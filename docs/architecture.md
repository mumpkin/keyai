# Architecture

**Status:** approved on 2026-11-03
**Related:** [functional specification (FR)](./cahier-des-charges.md) ·
[technical choices (FR)](./choix-techniques.md) ·
[contributing guide](../CONTRIBUTING.md)

This document records the architecture decisions (A1–A7). Fine-grained
algorithms (mastery formula, unlock thresholds, romaji variant tables) belong
to the functional design and are out of scope here.

## A1 — Repository layout and dependency rules

One static web application, published on the web and wrapped by Tauri for
desktop. A pnpm monorepo with three workspaces:

```
packages/core     pure TypeScript engine (domain logic, Zod schemas)
packages/vocab    vocabulary pipeline, editorial overrides, generated JSON
apps/app          React + Vite UI, platform adapters, Tauri shell (src-tauri)
```

| Package        | May import                           | Must never import              |
| -------------- | ------------------------------------ | ------------------------------ |
| `@keyai/core`  | `zod`                                | React, DOM, Tauri, Node, vocab |
| `@keyai/vocab` | `core`; Node APIs (scripts only)     | React, Tauri                   |
| `apps/app`     | `core`, the JSON produced by `vocab` | pipeline scripts               |

- `core` defines the shared contracts (Zod schemas for vocabulary, progress
  and save files). `vocab` produces data, `app` consumes it.
- Platform interfaces (storage, file transfer, updater) live in `app`, not in
  `core`: the engine takes a state and returns a new one, persistence is an
  application concern.
- The rule for `core` is enforced by Biome (`noRestrictedImports` override).
- No shared `ui` package: there is a single application.

## A2 — Engine modules (`packages/core`)

Design principles:

- **Plain data and pure functions.** No classes. State is serialisable JSON;
  every operation returns a new state.
- **No hidden non-determinism.** Time and randomness are always passed in:
  timestamps on each keystroke, a seeded random generator for word selection.
  The same seed always produces the same session.

```
kana/          kana catalogue and romaji table
input/         word tokenisation and keystroke matching
vocab/         word schema, kana → words index
selection/     session word list generation
stats/         keystroke events → speed, accuracy, errors
progression/   per-kana mastery, unlocking, unlock order algorithm
session/       session state machine (combines input + stats)
settings/      settings schema, defaults, speed presets
save/          versioned save format, migrations, import parsing
random/        seeded random generator, weighted draw, shuffle
```

| Module        | Responsibility                                                                                                            | Depends on                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `kana`        | Every unit (base, voiced, combos, `っ`, `ー`, extended katakana), gojūon rank, counterpart, accepted and displayed romaji | —                         |
| `input`       | `tokenize`, `createMatcher`, `feed`; context rules for `ん` and `っ`                                                      | `kana`                    |
| `vocab`       | Word schema, kana set per word, lookup index                                                                              | `kana`, `input`           |
| `selection`   | `generateSession(vocab, progress, settings, random)`                                                                      | `vocab`, `progression`    |
| `stats`       | Timestamped events → measurements                                                                                         | `kana`                    |
| `progression` | Mastery from recent samples, unlocking, unlock order                                                                      | `stats`, `settings`       |
| `session`     | Session reducer                                                                                                           | `input`, `stats`          |
| `settings`    | Settings schema and defaults                                                                                              | —                         |
| `save`        | `parseSave` (validate + migrate), `serializeSave`                                                                         | `settings`, `progression` |

Dependencies only point downwards; there are no cycles.

- **Unlock order is computed at build time.** It depends only on the
  vocabulary and its frequency, so the pipeline runs the algorithm from
  `core/progression` and writes the result into the vocabulary JSON. Only the
  _moment_ of unlocking (driven by mastery) is decided at runtime.
- **Subpath exports** (`@keyai/core/input`, `@keyai/core/kana`, …) declared in
  `package.json#exports`. Everything else stays private.
- **No build step for `core`:** consumed as TypeScript source by Vite and by
  Node 24 type stripping (relative imports use explicit `.ts` extensions).

## A3 — Data model

Principles: store facts, compute conclusions (mastery is never stored);
identifiers that end up in saves never change.

### Kana (hand-written data in `core/kana`)

```ts
interface KanaUnit {
	text: string; // 'き', 'きゃ', 'っ', 'ー' — also the identifier
	script: 'hiragana' | 'katakana';
	kind:
		| 'base'
		| 'nasal' // ん, ン
		| 'voiced'
		| 'semivoiced'
		| 'combo'
		| 'extended' // katakana-only combinations (ティ, ファ…)
		| 'sokuon'
		| 'choon';
	gojuon: number;
	counterpart?: string;
	romaji: { display: string; accepted: string[] };
}
```

### Vocabulary (generated by the pipeline)

```ts
interface VocabFile {
	schemaVersion: 1;
	sources: { jmdict: string; wordfreq: string };
	unlockOrder: string[]; // single order mixing both scripts
	initialUnlocked: number; // size of the initial group
	words: VocabWord[];
}

interface VocabWord {
	id: string;
	kana: string;
	rank: number;
	senses: Sense[]; // senses[0] is the primary sense
}

interface Sense {
	gloss: { en: string; fr?: string }; // French falls back to English
	pos: PartOfSpeech[];
	kanji?: string;
	note?: { fr?: string; en?: string };
}
```

- **One entry per kana spelling.** Homographs (`はし`: 橋, 箸, 端) are merged;
  the primary gloss is shown under the exercise, every sense is listed in the
  word card (tooltip).
- **Input follows the writing, not the pronunciation.** The particle `は` is
  typed `ha`, `へ` is typed `he`; the word card states the particle
  pronunciation (_wa_, _e_). `を` is displayed `wo` (accepting `wo` and `o`,
  to be confirmed in the romaji tables).
- Extended katakana combinations (`ティ`, `ファ`, `ヴ`…) are included at the end
  of the katakana progression.
- The usual kanji form is shown in the word card for information only.
- Unit split and script are not stored: they are recomputed with `core/input`.

### Progress, settings and save file

```ts
interface Progress {
	unlocked: string[]; // in unlock order; script comes from the catalogue
	kana: Record<string, KanaStats>;
}

interface KanaStats {
	seen: number;
	errors: number;
	recent: Sample[]; // sliding window of the last 10 attempts
}

interface Sample {
	ms: number | null; // null when the unit was not timed
	error: boolean;
}

interface Settings {
	locale: 'fr' | 'en';
	wordsPerSession: number;
	speed: {
		preset: 'easy' | 'normal' | 'hard' | 'custom';
		kanaPerMinute: number;
	};
	feedback: { sound: boolean };
	display: { kanaSizePx: number };
}

interface SaveFile {
	format: 'keyai-save';
	schemaVersion: 1;
	appVersion: string;
	savedAt: string;
	settings: Settings;
	progress: Progress;
	history: SessionRecord[]; // last 100 sessions, oldest dropped first
}

interface SessionRecord {
	date: string; // ISO date
	kanaPerMinute: number;
	accuracy: number; // 0 to 1
	wordCount: number;
	unlocked: string[]; // kana unlocked at the end of this session
}
```

- Unlocked kana are stored as an explicit list so that a new unlock order in
  a later vocabulary release never changes what a user has already unlocked.
- The same `SaveFile` format is used for local storage and for export/import.
- `parseSave` never throws: it reports `invalidJson`, `notASave`,
  `unsupportedVersion` or `invalidContent`, after migrating older versions
  through a registry of one migration per version (`core/save`).
- A **light history** (one `SessionRecord` per session, capped at 100,
  about 10 KB) feeds the progress-over-time chart. Detailed history (per word
  or per keystroke) stays out of scope.
- Not persisted: in-session keystrokes.

## A4 — Session flow

```
ready ──first key──► typing ──last word done──► finished ──► next series
                       │
                       └──Escape──► aborted (nothing is saved)
```

A single pure reducer in `core/session`: `createSeries(words)`,
`seriesReducer(state, action)` with timestamped actions (`key`, `space`,
`backspace`, `abort`), and `seriesRecordOf(state)` handing the attempts,
wrong key count and elapsed time to `core/stats` and `core/progression`.

| Situation                           | Behaviour                                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Correct key                         | Input advances; a completed unit records a `{ ms, error }` sample                                                |
| Wrong key                           | Rejected (nothing displayed); one error recorded on the current unit                                             |
| Space, word complete (not the last) | Word validated, its translation appears, next word                                                               |
| Space, word incomplete              | Word skipped (greyed out); one error on the current unit, no speed sample                                        |
| Backspace at the start of a word    | Back to the previous word if it was skipped, where it was left                                                   |
| Backspace on a completed word       | No effect                                                                                                        |
| End of series                       | Last key of the last word, or last word skipped; the series is saved and the next one starts (no summary screen) |

- Timer starts on the first key. Unit time runs from the previous unit's
  completion; the first unit of a session only counts for accuracy.
- Gaps longer than a pause threshold (value set during design) are excluded
  from speed.
- Error feedback: a short horizontal shake of the word; replaced by a colour
  flash under `prefers-reduced-motion`. Optional error sound (off by default),
  synthesised with the Web Audio API and throttled.
- **Keyboard capture** lives in the app (`useTypingInput`): a focused,
  invisible `<input>` read through `beforeinput`/`input` events (works with
  mobile virtual keyboards), with autocorrect, autocapitalise, autocomplete
  and spellcheck disabled. An active Japanese IME is detected through
  composition events and the user is asked to switch it off.

## A5 — React integration (`apps/app/src`)

```
main.tsx            bootstrap: platform → save → i18n → render
platform/           types.ts · web/ · tauri/
stores/             progress-store.ts · ui-store.ts
features/           training/ · kana-table/ · statistics/ · settings/ · splash/
components/ui/      shadcn components
vocab/              JSON loading and index
i18n/               configuration and locales
styles/app.css      Tailwind and theme
```

| State                       | Location                     | Notes                                                |
| --------------------------- | ---------------------------- | ---------------------------------------------------- |
| Settings, progress          | `progress-store` (Zustand)   | Actions call `core`, then save immediately           |
| Current screen, last series | `ui-store` (Zustand)         | Replaces a router                                    |
| Running session             | `useReducer(sessionReducer)` | Result handed to `progress-store.applySessionResult` |
| Vocabulary and index        | Loaded once at startup       | Read-only                                            |

- The platform is selected **at build time** (`VITE_PLATFORM=web|tauri`): the
  web build contains no Tauri code, the Tauri build contains no service
  worker.
- A single `platform` object is created at startup and injected into
  `progress-store` when it is created; components never access it directly.

## A6 — Vocabulary pipeline (`packages/vocab`)

```
sources.json        pinned sources (URL, version, SHA-256)
overrides/          words.yaml · particles.yaml
src/                fetch.ts · build.ts · report.ts · stages/
.cache/             raw sources (git-ignored)
data/vocab.json     output (committed)
```

1. Load JMdict (all languages, for French glosses).
2. Load wordfreq (indexed by usual written form: look up the kanji form
   unless the entry is tagged `uk`).
3. Select candidates (exclude names, archaic, vulgar and rare entries; rank by
   wordfreq and JMdict priority tags).
4. Merge homographs by kana spelling.
5. Apply overrides.
6. Validate: every word must be typeable with `core/input`, every unit must
   exist in the catalogue, the file must match the `core` schema.
7. Compute the unlock order with `core/progression`.
8. Emit a deterministic file (stable ordering, no timestamps).

- JMdict glosses are used as is; a missing French gloss falls back to
  English in the interface.
- Each override carries `reviewed: true | false`. Draft translations are
  written during working sessions (no API in the pipeline) with
  `reviewed: false`. `pnpm vocab:check --strict` rejects any unreviewed entry
  and runs in the release workflow.
- Measured on JMdict 3.6.2 (261 MB of JSON): the whole build takes about four
  seconds; `JSON.parse` is enough, no streaming needed.
- wordfreq counts strings, not words: only **common** JMdict forms are looked
  up, otherwise a rare word written い would inherit the frequency of every
  い. Entries that are only suffixes, prefixes or counters are left out.
- Generated files (`data/vocab.json`, `report.md`) are deterministic and
  excluded from Biome; the CI runs `pnpm vocab:check`.

## A7 — Build, configuration and CI

```
package.json          scripts, packageManager (pnpm), engines (node >= 24)
pnpm-workspace.yaml   packages/*, apps/*
tsconfig.base.json    strict, erasableSyntaxOnly, verbatimModuleSyntax,
                      allowImportingTsExtensions, noUncheckedIndexedAccess
.github/workflows/    ci.yml · release.yml · pages.yml
```

- TypeScript 7 for type checking only (`tsc --noEmit`). No Turborepo or Nx.
- Single application version, read by `tauri.conf.json` from `package.json`.

| Script                                            | Purpose                     |
| ------------------------------------------------- | --------------------------- |
| `pnpm dev` / `pnpm dev:tauri`                     | Development (web / desktop) |
| `pnpm build:web` / `pnpm build:tauri`             | Production builds           |
| `pnpm check`                                      | Biome                       |
| `pnpm typecheck`                                  | Type checking               |
| `pnpm test` / `pnpm test:e2e`                     | Vitest / Playwright         |
| `pnpm vocab:fetch` · `build` · `report` · `check` | Vocabulary pipeline         |

| Workflow      | Trigger            | Steps                                                                                                                                                                                                                       |
| ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`      | push, pull request | Commit and branch checks, changelog check, `biome ci`, typecheck, Vitest with coverage, `vocab:check`, web build, Playwright (3 browsers), duplicate detection (`jscpd`); Rust `fmt` and `clippy` when `src-tauri/` changes |
| `release.yml` | tag `v*`           | Version consistency (tag, `package.json`, changelog), `vocab:check --strict`, `tauri-action` on `ubuntu-22.04` and `windows-latest`, draft GitHub Release with notes extracted from the changelog                           |
| `pages.yml`   | release published  | Web build with `base: '/keyai/'`, deploy to GitHub Pages                                                                                                                                                                    |

CI tuning: parallel jobs, pnpm/Cargo/Playwright caches, `concurrency` with
`cancel-in-progress`, path filters, actions pinned by commit SHA (updated by
Dependabot), minimal `permissions`, `timeout-minutes` on every job, coverage
thresholds (high on `core`), Biome warnings fail the build.

The web app is deployed on release only, so the web and desktop versions
always match.

No external code quality service (SonarQube Cloud was considered and
rejected): Biome, strict TypeScript, Vitest coverage thresholds and Clippy
already cover its rules, and its free plan only analyses the main branch.
`jscpd` fills the only gap, duplicate code detection.
