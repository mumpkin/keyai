# Technical choices — kana reading training application

**Status:** approved on 2026-11-03  
**Functional reference:** [functional-specification.md](./functional-specification.md)

This document summarises the approved technical choices and their justifications. The detailed architecture and the design of the application are covered by separate documents.

## General principle

A **single static web application**, written once:

- published on the web (GitHub Pages) as a **PWA** usable offline and installable on mobile;
- wrapped by **Tauri 2** to produce the Windows and Linux desktop applications.

All the domain logic (romaji input, word selection, statistics, progression) lives in a **pure TypeScript engine**, independent from React and Tauri.

## Summary

| #   | Area                  | Choice                                                                                                                                                                                                                                                        | Rejected alternatives                                                                                                                      |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Desktop shell         | **Tauri 2**                                                                                                                                                                                                                                                   | Electron (too heavy), Wails                                                                                                                |
| 2   | Language / UI         | **TypeScript + React**                                                                                                                                                                                                                                        | Svelte 5, SolidJS, Vue                                                                                                                     |
| 3   | Build / tooling       | **Vite 8**, **React Compiler**, **pnpm**, no router at first                                                                                                                                                                                                  | Next.js (SSR pointless with Tauri), npm                                                                                                    |
| 4   | Styles / components   | **Tailwind CSS v4**, **shadcn/ui on Base UI**, bundled **Noto Sans JP** font (Fontsource)                                                                                                                                                                     | CSS Modules, Radix, React Aria                                                                                                             |
| 4b  | Code quality          | **Biome** (lint + format, Tailwind class sorting with `useTailwindSortedClasses`)                                                                                                                                                                             | Prettier, ESLint (minimal addition possible for the React Compiler rules if needed)                                                        |
| 5   | Interface translation | **react-i18next** (FR by default, EN)                                                                                                                                                                                                                         | Lingui, Paraglide                                                                                                                          |
| 6   | Storage and export    | **localStorage** + `navigator.storage.persist()` (web), **`@tauri-apps/plugin-store`** (Tauri), behind a common `load()/save()` interface; versioned JSON export (`schemaVersion` + migrations); **Zod 4** validation                                         | IndexedDB, Valibot                                                                                                                         |
| 7   | Offline / state       | **vite-plugin-pwa** (disabled in Tauri), **Zustand** for global state, `useReducer` + pure engine for the running session                                                                                                                                     | Jotai, Redux Toolkit, TanStack Query                                                                                                       |
| 8   | Romaji input          | **Custom engine** in pure TS, driven by a variant table, key-by-key validation                                                                                                                                                                                | WanaKana (converts whole strings, unmaintained since 11/2023)                                                                              |
| 9   | Vocabulary            | **JMdict** (through jmdict-simplified) + **wordfreq**; BCCWJ as a simple control reference; file of reviewed manual corrections                                                                                                                               | French Wiktionary (no usable extraction)                                                                                                   |
| 10  | Data pipeline         | **TypeScript scripts run by Node 24** (`erasableSyntaxOnly`), corrections in **YAML**, final JSON versioned; **pnpm monorepo**                                                                                                                                | Python                                                                                                                                     |
| 11  | Tests                 | **Vitest 5**, **fast-check**, **Playwright** (phone and desktop formats); later: **Vitest Browser Mode** (`vitest-browser-react`), **WebdriverIO + `@wdio/tauri-service`**                                                                                    | jsdom                                                                                                                                      |
| 12  | CI / distribution     | **GitHub + GitHub Actions**, **GitHub Pages** (`*.github.io`), **tauri-action** (NSIS `.exe`, AppImage, `.deb`), later: signed **`plugin-updater`**; unsigned for Windows for now, application to **SignPath Foundation**; duplicate detection with **jscpd** | Cloudflare Workers, Azure Artifact Signing (US/Canada only), SonarQube Cloud (redundant with Biome/TS/Vitest, free plan limited to `main`) |

**Addition (design C3):** statistics charts with **Recharts 3** (SVG, compatible with React 19), used directly because the `chart` component of shadcn/ui breaks the Biome rules; rejected: ECharts, Chart.js, visx.

## Points of attention

- **Linux / WebKitGTK:** rendering and keyboard handling may differ from Chromium. Test on Linux, for example with `WebKitWebDriver`.
- **Tauri on Windows:** changing `useHttpsScheme` between two versions makes the webview storage inaccessible. This is one of the reasons for choosing `plugin-store`.
- **React Compiler + Vite 8:** `@vitejs/plugin-react` v6 no longer uses Babel; the Compiler is enabled through `@rolldown/plugin-babel` and `reactCompilerPreset`.
- **Biome:** `useTailwindSortedClasses` (formerly `useSortedClasses`, renamed in 2.6) is still in the "nursery" (experimental) category.
- **Tailwind:** keep the JSX readable; classes stay encapsulated in components and `cva` variants, and the screens themselves contain few of them.
- **French vocabulary:** JMdict only provides a French translation for ~15,300 entries. Missing French translations are completed with drafts, always reviewed before publication. Kana homographs (e.g. はし) must be settled.
- **Linux build:** compile on Ubuntu 22.04 for glibc compatibility.
- **Updates:** Linux auto-update only concerns the AppImage. Updates (PWA and Tauri) are offered, never forced during a session.
- **GitHub Pages without a domain:** set the base path `/repository-name/` in Vite.

## Code conventions

Configured in `biome.json` (Biome 2.6), `.editorconfig` and `.zed/settings.json`:

- indentation with **tabs**, displayed width **4**;
- lines of **80 characters** at most;
- **single quotes** in JS/TS and CSS; **double quotes in JSX attributes** (React convention, `<div className="…">`);
- semicolons everywhere, trailing commas everywhere;
- imports sorted automatically; Tailwind classes sorted, including in `cn()`, `clsx()` and `cva()`;
- YAML: 2 spaces (the format forbids tabs);
- Prettier and ESLint disabled in Zed; Biome formats on save;
- **Clean Code** rules (Robert C. Martin) applied by Biome, including the ban on single-letter identifiers (GritQL plugin);
- **everything in English**: code, commits, branches, changelog, technical documentation.

Git conventions (typed branches, commits without prefix, linear history, Keep a Changelog, SemVer): see [CONTRIBUTING.md](../CONTRIBUTING.md). Architecture: see [architecture.md](./architecture.md).

## Licenses

- **Code:** MIT.
- **Vocabulary data:** CC BY-SA 4.0 (derived from JMdict/EDRDG and wordfreq), stored in a file separate from the code, with attribution in the application ("About" page).

## Planned repository layout

```
packages/core     → pure TS engine (romaji input, selection, statistics, Zod schemas)
packages/vocab    → pipeline + YAML corrections + generated JSON
apps/app          → React + Vite interface, and Tauri (src-tauri)
```

To be detailed in the architecture step.

## Content decisions postponed to the design

- Romaji variants: `xtsu`/`ltu`, input of `ー`, particles は/へ/を read `wa`/`e`/`o`.
- Unlock thresholds, definition of accuracy, values of the speed presets.
- Size of the V1 corpus (order of magnitude: 1,500 to 3,000 words).
