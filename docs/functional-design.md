# Functional design

**Status:** approved on 2026-11-03
**Related:** [architecture](./architecture.md) ·
[functional specification](./functional-specification.md)

This document settles the points left open by the specification. Topics are
validated one at a time:

| #   | Topic                                           | Status   |
| --- | ----------------------------------------------- | -------- |
| C1  | Romaji tables                                   | Approved |
| C2  | Kana catalogue, reference table, initial group  | Approved |
| C3  | Measurements: speed, accuracy, errors           | Approved |
| C4  | Mastery and unlocking                           | Approved |
| C5  | Session word selection                          | Approved |
| C6  | Settings: speed presets, default session length | Approved |
| C7  | V1 corpus: size, filters, katakana introduction | Approved |
| C8  | Screens and series flow                         | Approved |

## C1 — Romaji tables

General rule: the displayed form is always **Hepburn**; common variants
(those understood by Japanese input methods) are accepted. Input is
case-insensitive.

| Case                                                      | Displayed                                | Accepted                                       |
| --------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| し / ち / つ / ふ / じ                                    | shi / chi / tsu / fu / ji                | also si / ti / tu / hu / zi                    |
| ぢ / づ                                                   | ji / zu                                  | also di / du                                   |
| を / は / へ                                              | wo / ha / he                             | を: also o                                     |
| しゃ / ちゃ / じゃ                                        | sha / cha / ja                           | also sya / tya, cya / zya, jya                 |
| ん at the end of a word or before a consonant             | n                                        | n, nn, n'                                      |
| ん before a vowel or `y`                                  | n'                                       | nn, n' (a single `n` would be ambiguous)       |
| っ before a consonant                                     | doubled consonant                        | っち: tchi or cchi                             |
| ー                                                        | -                                        | `-` or the repeated previous vowel             |
| ティ / ディ / トゥ                                        | ti / di / tu                             | also thi / dhi / twu                           |
| ファ, フィ, フェ, フォ, ヴ, ウィ, ウェ, シェ, ジェ, チェ… | fa, fi, fe, fo, vu, wi, we, she, je, che | IME-only variants (fwa, xye…) are not accepted |

- **Input follows the writing, not the pronunciation**: the particle は is
  typed `ha`, へ is typed `he` (see architecture, A3).
- **ん before a vowel or `y`** — or before a kana that can be typed starting
  with one of them, such as `を` (`o`) — must be typed `nn` or `n'`, and is
  displayed `n'` (きんえん → `kin'en`).
- **ん before `n`** accepts a single `n`: こんにちは is displayed
  `konnichiha` and accepts `konnichiha`, `konnnichiha` and `kon'nichiha`.
  The word being known, the input engine follows every reading the keys
  still allow and settles once the next keys remove the ambiguity.
- **Long vowels in hiragana**: `う` after an o sound also accepts `o` (こう:
  `kou` or `koo`, きょう: `kyou` or `kyoo`) and `い` after an e sound also
  accepts `e` (せんせい: `sensei` or `sensee`). After any other sound they
  keep their own reading (かう is only `kau`). The displayed form stays
  `kou`. The rule follows the spelling: without word boundaries, it also
  applies where the sounds are separate in speech (おもう accepts `omoo`).
- **Combinations cannot be typed in two parts** (`きゃ` as `ki` + `xya`): the
  point is to learn `きゃ` as a whole.
- **A standalone small `っ`** (`xtsu`, `ltu`) is not accepted; the pipeline
  drops the rare words ending with `っ`.

## C2 — Kana catalogue, reference table and unlock order

### Catalogue

| Block                                                     | Hiragana | Katakana |
| --------------------------------------------------------- | -------- | -------- |
| Base (あ to ん, including を)                             | 46       | 46       |
| Voiced and semi-voiced (が…, ざ…, だ…, ば…, ぱ…)          | 25       | 25       |
| Combinations (きゃ, しゅ, ちょ…)                          | 33       | 33       |
| Small っ                                                  | 1        | 1        |
| Long vowel mark ー                                        | —        | 1        |
| Extended combinations (ティ, ファ, ヴ, ウィ, シェ, ツァ…) | —        | ~20      |

Excluded: ゐ and ゑ (archaic), ぢゃ, ぢゅ, ぢょ (virtually unused), hiragana ゔ.

### Reference table

- Laid out like the gojūon chart: five columns (a, i, u, e, o), one row per
  consonant; blocks follow each other (base, voiced, combinations with three
  columns ya/yu/yo, special marks and extended combinations).
- One script at a time, with hiragana and katakana tabs; defaults to the
  script of the current word.
- Each cell shows the kana and its Hepburn romaji. States: locked (greyed
  out), unlocked, last unlocked (highlighted). How mastery is shown is left
  to the UI design.

### Unlock order (computed by the pipeline)

A **single order mixing hiragana and katakana**, so that both scripts are
practised in parallel from the start. Greedy selection: at each step, pick
the kana (of either script) that makes the most new frequent words typeable.

1. **Weight**: each word counts for its log-scale frequency (wordfreq Zipf
   value). Raw frequency would let particles dominate everything.
2. **Prerequisites**: a voiced kana comes after its base form (が after か); a
   combination after both components (きゃ after き and や); っ only when it
   opens words; an extended combination after its components (ティ after テ
   and イ).
   A katakana comes after its hiragana counterpart (カ after か), so that
   corresponding katakana are introduced after the hiragana, as the
   specification requires, without waiting for the whole hiragana set.
3. **Usefulness**: a kana must make at least one new word typeable, so that
   it can be practised as soon as it is unlocked. On the V1 vocabulary, none
   of the 209 kana of the order is unlocked without a word.
4. **Balance**: if one script has had **three unlocks in a row** while the
   other has a kana opening a word, the next unlock goes to the other script.
   Frequency drives the order; this rule only prevents one script from
   starving the other.
5. **Ties** are broken by gojūon order (hiragana first).

### Initial group

Most katakana words need several new kana, so katakana could not start one
kana at a time: the app starts with **a group in each script**.

- About **six hiragana**, opening at least ~15 words.
- About **six katakana**, opening at least ~5 words; only the prerequisites
  within katakana apply to this group, not the hiragana counterpart.

Each group only keeps kana that appear in a typeable word. On the V1
vocabulary: は こ い う か つ and マ ン イ ラ ト ド, opening 46 words.

### Kana outside the progression

A kana that appears in no word can never be practised, hence never mastered:
it stays out of the unlock order and locked in the table (22 kana in the V1,
listed in the pipeline report). Prerequisites on such kana are ignored.

## C3 — Measurements

### Counting unit

One **catalogue unit** counts as one kana: `きゃ`, `っ` and `ー` each count for
one, exactly like a cell of the reference table.

### Speed (kana per minute)

- **Session**: completed units ÷ elapsed time from the first key to the end
  of the session. Units of skipped words do not count.
- **Per kana**: each attempt gives 60,000 ÷ duration in milliseconds, compared
  with the user's speed threshold (see C4).
- **No pause detection**: all elapsed time counts. A user who needs a real
  break aborts the session with Escape. Per-kana outliers are handled by the
  mastery formula (C4), not by discarding time.

### Accuracy

- A unit is **clean** when it was typed without any wrong key.
- Accuracy = clean units ÷ attempted units (the unit on which a word was
  skipped counts as attempted). Corrected errors therefore lower accuracy.
- Several wrong keys on the same unit lower accuracy once: a keystroke-based
  measure would penalise kana with long romaji (`shi`, `tsu`).

### Errors

- The error count shown in the summary is the number of **wrong keys**.
- Frequent errors: the **five kana** with the most faulty units in the
  session.

### Timing rules (from A4)

- The timer starts on the first key; the first unit of a session only counts
  for accuracy.
- A unit's time starts at the completion of the previous unit, or at the
  space that starts the word.
- When returning to a skipped word, the current unit's timer restarts.

### Summary content

Speed, accuracy, error count, the five most faulty kana, kana unlocked during
the session, words encountered with their translation, skipped words with
their Hepburn reading. There is no summary screen: series follow each other
and this content lives in the statistics screen (see C8).

### Statistics charts

Built with Recharts 3.

| Chart                  | Content                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Speed over the session | One point per word, with the speed threshold as a line                                                 |
| Slowest kana           | Speed of the 15 slowest kana as bars, coloured by accuracy, threshold line, with every kana in a table |
| Overall progress       | Locked / learning / mastered kana, for hiragana and katakana                                           |
| Progress over time     | Speed and accuracy over the last sessions (light history)                                              |

The light history keeps one record per session (date, speed, accuracy, word
count, unlocked kana) for the last 100 sessions; see architecture, A3.

## C4 — Mastery and unlocking

### Mastery of a kana

Computed from the **last 10 attempts** of the kana. A kana is **mastered**
when:

1. it has at least **5 attempts**;
2. the **median** speed of these attempts reaches the user's speed
   threshold (the median absorbs abnormally long attempts, see C3);
3. at least **90 %** of these attempts are clean (at most one faulty attempt
   out of ten; none with fewer than ten attempts).

Mastery is never stored: it is recomputed, so a mastered kana can fall back
to unmastered when its recent attempts degrade.

A **display score** from 0 to 100 % feeds the reference table and the charts:
the lower of `median speed ÷ threshold` and `clean ratio ÷ 90 %`, capped at
100 %.

### Unlocking

- The next kana in the unlock order is unlocked only when **every** unlocked
  kana, of both scripts, is mastered.
- Unlocking happens at the end of a session, **at most one kana per
  session**, and is announced in the summary.
- Hiragana and katakana share a single unlock order (C2) but keep distinct
  mastery figures and progress displays.
- An unlocked kana is never locked again; if it regresses, it comes back as the
  featured kana, and delays the next unlock while it is one of the last five.
- **A series with a skipped word unlocks nothing**: holding space must never
  lead to an unlock.
- **The five last unlocked kana** must be mastered before the next one
  unlocks; the screen says which ones are missing. Requiring every kana at
  once stalled learners: simulated with the real engine, 15 % of errors meant
  no unlock at all. Older kana stay in the series, as the weakest one is always
  featured (C5). The unlock order guarantees that each kana can be practised
  (C2).
- A loaded save is aligned with the unlock order, which a new vocabulary can
  change: the unlocked kana become the start of the order, up to the last one
  already unlocked. Nothing is locked again and progress cannot get stuck.
- Rare kana are protected by word selection (C5), which favours unmastered
  kana, and by allowed word repetitions. The pipeline report flags kana that
  open very few words.

### Constants (`core/progression`)

| Constant             | Value     |
| -------------------- | --------- |
| Attempt window       | 10        |
| Minimum attempts     | 5         |
| Required clean ratio | 90 %      |
| Speed statistic      | median    |
| Unlocks per session  | at most 1 |

## C5 — Session word selection

`generateSession(vocab, progress, settings, random)` with a seeded random
generator.

- **Eligible words**: every unit is unlocked (hiragana and katakana mix
  naturally once both progressions allow it).
- **Priority kana**: the **featured kana** (the least mastered unlocked one,
  or the last unlocked one when all are mastered)
  and the **weak kana** (unlocked but not mastered, weakest first by display
  score).

### Three passes

1. **Coverage**: for each weak kana, draw one word containing it.
2. **Featured**: add words containing the featured kana until they make up
   about **50 %** of the session.
3. **Fill**: weighted draw among all eligible words; the weight grows with the
   number of weak kana in the word and, slightly, with its frequency.

The word order is then shuffled.

### Variety rules

- No duplicate within a session while unused eligible words remain; when
  repetitions become necessary, the least used words are drawn first, so
  that repetitions stay balanced and never the same word twice in a row.
- Single-unit words are capped at about **20 %** of the session, so that
  early sessions are not reduced to typing one letter per word.
- When the vocabulary is too small, constraints are relaxed in this order:
  the single-unit cap, then the featured share, then the no-duplicate rule.
  A session always has the requested number of words.

### Constants (`core/selection`)

| Constant             | Value |
| -------------------- | ----- |
| Featured kana share  | 50 %  |
| Single-unit word cap | 20 %  |

## C6 — Settings

### Speed threshold (kana per minute)

| Preset         | Value             | Time per kana | Profile                              |
| -------------- | ----------------- | ------------- | ------------------------------------ |
| Easy (default) | 30                | 2 s           | Recognised after a short hesitation  |
| Normal         | 45                | ~1.3 s        | Fluent but deliberate reading        |
| Hard           | 60                | 1 s           | Near-instant recognition             |
| Custom         | 10 to 150, step 5 |               | Free value or adjusted from a preset |

- Editing the value after picking a preset switches to _custom_.
- Changes apply immediately: mastery is recomputed (C4), so raising the
  threshold may unmaster kana and lowering it may speed up unlocking (still
  at most one per session).
- Values are estimates, to be tuned after the first real tests.

### Other settings

| Setting           | Default                       | Range                 |
| ----------------- | ----------------------------- | --------------------- |
| Words per session | 20                            | 5 to 100              |
| Language          | browser language, else French | French / English      |
| Error sound       | off                           | on / off              |
| Kana size         | 24 px                         | 16 to 64 px           |
| Theme             | system                        | system / dark / light |

The themes use the Tokyo Night Light and Tokyo Night colours. Where an
original colour fails WCAG AA, it is adjusted as little as possible, and
`theme-contrast.test.ts` keeps it that way.

### Data management

- **Export** the progress (`keyai-save` file).
- **Import**: a preview (file date, unlocked kana, number of sessions) is
  shown first; after confirmation the file **replaces** the current progress
  entirely. No merging.
- **Unreadable save**: a stored save that cannot be read, or that comes from a
  newer version, is set aside before anything replaces it. A notice says so at
  launch, and the copy can be exported from there or from the settings.
- **Reset** the progress and the history, with an explicit confirmation. The
  settings are kept.

### Not in settings (V1)

- Choosing which kana to practise: progression stays automatic.

## C7 — V1 corpus

### Size

- **2,000 to 3,000 kana spellings** (target 2,500, tuned from the pipeline
  report), taken by frequency, plus the coverage additions below.
- **Missing French translations fall back to English**, marked with an `EN`
  badge in the interface. French translations are completed in later data
  releases; a vocabulary update needs no code change.
- JMdict keeps French glosses in separate senses that are not aligned with
  the English ones (日 would read « dimanche »): a French gloss is only used
  for entries with a single sense, about a third of the V1 words. The most
  frequent polysemous words get their French translation in
  `overrides/words.yaml`.
- Glosses coming from JMdict are used as is. Only editorial overrides written
  by us carry the `reviewed` flag checked by `vocab:check --strict`.

### Coverage

- The pipeline adds the most frequent words containing each kana until every
  kana has **at least five words**.
- A kana with fewer than five words in the whole of JMdict is flagged in the
  report and decided case by case: excluded from the catalogue or accepted
  with few words.

### Filters

| Excluded                                                 | Reason                 |
| -------------------------------------------------------- | ---------------------- |
| Archaic, obsolete and rare words (`arch`, `obs`, `rare`) | Not current Japanese   |
| Discriminatory and sensitive terms (`derog`, `sens`)     | Slurs targeting people |
| Readings flagged as rare or search-only                  | Not usual readings     |
| Words longer than **8 units**                            | Too long for beginners |
| Words ending with `っ` or containing an excluded kana    | Not typeable (C1, C2)  |

- **Kept**: vulgar words and insults (`vulg`, `X`), with their register
  shown in the word card (_vulgar_, _familiar_); common onomatopoeia.
- **Particles**: は, が, を, に, へ, で, と, も, の, か, や, よ, ね, から, まで,
  より, だけ, しか, など, each with a hand-written card in
  `particles.yaml`.

## C8 — Screens and series flow

Agreed during the blocking session (pull request #5).

### Series flow

- There is **no summary screen**. When a series ends, the next one starts
  immediately; its results are saved and shown in the statistics bar and the
  statistics screen.
- A short animated title opens the app: on the web only at the first launch
  (nothing stored yet), on the desktop app at every launch. It can be replayed
  from the settings: `hayai` (速い, _fast_) turns
  into `keyai` as `ha` rolls up into `ke`. Any key or click skips it without reaching the
  series; it is reduced to an instant swap under `prefers-reduced-motion`.

### Screens

| Screen     | Content                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Training   | Statistics bar, word line, series words recap, Japanese input warning, kana table                                                                |
| Statistics | Last series (figures, speed per word, faulty kana, words, skipped words), progress (mastery per script, kana table coloured by mastery), history |
| Settings   | Language, session, speed, feedback, display, data, about                                                                                         |

Navigation: header with Training, Statistics and Settings (icons only on
mobile). It always stays visible: only the content below it scrolls.

On the web, from a desktop-sized screen, the header also offers the desktop
app for Windows and Linux, once a release is published.

The desktop app has no system title bar: the navigation moves to the middle of
the header and minimize, maximize and close buttons take its place on the
right. The header moves the window when dragged and maximizes it on a double
click.

### Training screen

- **Statistics bar** (replaces the unlock banner): progress of the current
  series (`5/20` with a gauge), live speed, accuracy and errors, previous
  series figures, and a _new_ chip when a kana was just unlocked.
- **Word line**: words separated by a normal space. **No romaji is shown
  under the words**: as in Keybr or Monkeytype, typing fills the kana in
  place. Typed units turn to the main colour, the unit being typed is shown
  as partially filled, and a single cursor glides under the unit being typed. A unit on which a wrong
  key was typed turns **red** and stays red once the word is done, in the
  word line and in the recap. Skipped words are struck through.
  The word line shows **three lines** at most and scrolls as typing
  progresses, keeping the current line in the middle, so the layout does not
  change with the series length.
- **Series words recap** below the line: each finished word of the current
  series once, newest first (the newest is highlighted, so the latest translation
  always sits at the same place), with its kana, Hepburn reading and
  translation; skipped words are marked. This is where translations appear.
  It stays on the finished series until the first key of the next one, so
  that the translations can still be read.
  It shows two rows (about eight words) and scrolls for the rest, one row per
  wheel step so that no row is jumped over.
- **The last word needs no space**: the series ends with its last key (a
  final ん ends it as soon as `n` spells it). Space does nothing before the
  first key of a series, so a space typed out of habit skips nothing.
- **Word card** on hover, keyboard focus or touch of a finished word, in the
  word line or in the recap, in a floating popover that neither of them clips: kana, usual kanji, reading, primary sense,
  grammatical nature, register, note and **other senses** (homographs).
- **Kana table**: one script at a time; the last unlocked kana carries a
  _new_ badge, the **next kana to unlock** a _next_ badge (dashed outline).
  Romaji is shown under unmastered, new and next kana, and only on hover,
  focus or touch for mastered kana.
- **Mastery colours**: unlocked kana have a dashed border and a light tint going from dark red to green with their
  mastery score, the percentage being shown in the cell title.
- **Kana size** is a setting, in pixels (default 24 px, 16 to 64 px).
- **Series length picker** in the statistics bar: 10, 20, 50, 100 or _custom_,
  which opens a small field for any length from 5 to 100 (Enter confirms,
  Escape cancels) and shows the current length when it is not one of the four.
  The same setting is available in the settings.

### Keeping the thread

- A series in progress survives a visit to another screen; the time away does
  not count. Escape, a new length or a reload still drop it.
- When the keys go nowhere, because the focus left the typing input, a notice
  says so above the words.
- During the first series, a line says what to do.

### Accessibility

The end-to-end tests run axe on every screen, in both themes and every format.
Kana cells are information, not controls. Screen readers hear the end of a
series and new kana, but nothing during typing.

### Updates

A new version is only offered: on the web as soon as it is cached, on the
desktop at launch. Nothing is downloaded or installed before the user clicks
"Update", and "Later" asks again at the next launch.

### Stable layout

An interaction never moves what surrounds it: changing figures have a reserved
width, the previous series has its own line, and messages and details either
have a reserved place or float above the page.

### Mobile

The words sit at the top of the screen, as the virtual keyboard covers the
bottom. The full kana table does not fit a phone, so it gives way to the kana
to work on, with the number of mastered kana: unlocked kana that are not
mastered, then the next one. The word line wraps.
