# Choix techniques — application d’entraînement à la lecture des kana

**Statut :** validé le 2026-11-03  
**Référence fonctionnelle :** [cahier-des-charges.md](./cahier-des-charges.md)

Ce document récapitule les choix techniques validés et leurs justifications. L’architecture détaillée et le design de l’application feront l’objet de documents séparés.

## Principe général

Une **seule application web statique**, écrite une fois :

- publiée sur le web (GitHub Pages) sous forme de **PWA** utilisable hors ligne et installable sur mobile ;
- encapsulée par **Tauri 2** pour produire les applications de bureau Windows et Linux.

Toute la logique métier (saisie romaji, sélection des mots, statistiques, progression) vit dans un **moteur TypeScript pur**, indépendant de React et de Tauri.

## Récapitulatif

| #   | Domaine                   | Choix                                                                                                                                                                                                                        | Alternatives écartées                                                              |
| --- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | Enveloppe bureau          | **Tauri 2**                                                                                                                                                                                                                  | Electron (trop lourd), Wails                                                       |
| 2   | Langage / UI              | **TypeScript + React**                                                                                                                                                                                                       | Svelte 5, SolidJS, Vue                                                             |
| 3   | Build / outillage         | **Vite 8**, **React Compiler**, **pnpm**, pas de routeur au départ                                                                                                                                                           | Next.js (SSR inutile avec Tauri), npm                                              |
| 4   | Styles / composants       | **Tailwind CSS v4**, **shadcn/ui sur Base UI**, police **Noto Sans JP** embarquée (Fontsource)                                                                                                                               | CSS Modules, Radix, React Aria                                                     |
| 4b  | Qualité du code           | **Biome** (lint + format, tri des classes Tailwind via `useTailwindSortedClasses`)                                                                                                                                           | Prettier, ESLint (ajout minimal possible pour les règles React Compiler si besoin) |
| 5   | Traduction de l’interface | **react-i18next** (FR par défaut, EN)                                                                                                                                                                                        | Lingui, Paraglide                                                                  |
| 6   | Stockage et export        | **localStorage** + `navigator.storage.persist()` (web), **`@tauri-apps/plugin-store`** (Tauri), derrière une interface commune `load()/save()` ; export JSON versionné (`schemaVersion` + migrations) ; validation **Zod 4** | IndexedDB, Valibot                                                                 |
| 7   | Hors ligne / état         | **vite-plugin-pwa** (désactivé dans Tauri), **Zustand** pour l’état global, `useReducer` + moteur pur pour la séance en cours                                                                                                | Jotai, Redux Toolkit, TanStack Query                                               |
| 8   | Saisie romaji             | **Moteur maison** en TS pur, piloté par une table de variantes, validation touche par touche                                                                                                                                 | WanaKana (conversion de chaînes entières, plus maintenu depuis 11/2023)            |
| 9   | Vocabulaire               | **JMdict** (via jmdict-simplified) + **wordfreq** ; BCCWJ comme simple référence de contrôle ; fichier de corrections manuelles relues                                                                                       | Wiktionnaire FR (pas d’extraction exploitable)                                     |
| 10  | Pipeline de données       | Scripts **TypeScript exécutés par Node 24** (`erasableSyntaxOnly`), corrections en **YAML**, JSON final versionné ; **monorepo pnpm**                                                                                        | Python                                                                             |
| 11  | Tests                     | **Vitest 4**, **fast-check**, **Vitest Browser Mode** (`vitest-browser-react`), **Playwright** (Chromium/Firefox/WebKit), **WebdriverIO + `@wdio/tauri-service`** (plus tard)                                                | jsdom                                                                              |
| 12  | CI / distribution         | **GitHub + GitHub Actions**, **GitHub Pages** (`*.github.io`), **tauri-action** (NSIS `.exe`, AppImage, `.deb`), **`plugin-updater`** signé ; V1 non signée pour Windows, demande à **SignPath Foundation**                  | Cloudflare Workers, Azure Artifact Signing (réservé US/Canada)                     |

## Points de vigilance

- **Linux / WebKitGTK :** le rendu et la gestion du clavier peuvent différer de Chromium. Tester sous Linux ; les tests Playwright WebKit servent d’indicateur.
- **Tauri sous Windows :** changer `useHttpsScheme` entre deux versions rend le stockage de la webview inaccessible. C’est l’une des raisons du choix de `plugin-store`.
- **React Compiler + Vite 8 :** `@vitejs/plugin-react` v6 n’utilise plus Babel ; le Compiler s’active via `@rolldown/plugin-babel` et `reactCompilerPreset`.
- **Biome :** `useTailwindSortedClasses` (ex-`useSortedClasses`, renommée en 2.6) est encore dans la catégorie « nursery » (expérimentale).
- **Tailwind :** garder le JSX lisible ; les classes restent encapsulées dans les composants et les variantes `cva`, et les écrans eux-mêmes en contiennent peu.
- **Vocabulaire FR :** JMdict ne fournit une traduction française que pour ~15 300 entrées. Les traductions FR manquantes sont complétées par des brouillons, systématiquement relus avant publication. Les homographes en kana (ex. はし) doivent être tranchés.
- **Build Linux :** compiler sur Ubuntu 22.04 pour la compatibilité glibc.
- **Mises à jour :** l’auto-update Linux ne concerne que l’AppImage. Les mises à jour (PWA et Tauri) sont proposées, jamais imposées pendant une séance.
- **GitHub Pages sans domaine :** configurer le chemin de base `/nom-du-depot/` dans Vite.

## Conventions de code

Configurées dans `biome.json` (Biome 2.6), `.editorconfig` et `.zed/settings.json` :

- indentation par **tabulations**, largeur affichée **4** ;
- lignes de **80 caractères** maximum ;
- **apostrophes simples** en JS/TS et CSS ; **guillemets doubles dans les attributs JSX** (convention React, `<div className="…">`) ;
- point-virgule systématique, virgules finales partout ;
- imports triés automatiquement ; classes Tailwind triées, y compris dans `cn()`, `clsx()` et `cva()` ;
- YAML : 2 espaces (le format interdit les tabulations) ;
- Prettier et ESLint désactivés dans Zed ; Biome formate à l’enregistrement ;
- règles **Clean Code** (Robert C. Martin) appliquées par Biome, dont l’interdiction des identifiants d’une seule lettre (plugin GritQL) ;
- **tout en anglais** : code, commits, branches, changelog, documentation technique.

Conventions git (branches typées, commits sans préfixe, historique linéaire, Keep a Changelog, SemVer) : voir [CONTRIBUTING.md](../CONTRIBUTING.md). Architecture : voir [architecture.md](./architecture.md).

## Licences

- **Code :** MIT.
- **Données de vocabulaire :** CC BY-SA 4.0 (dérivées de JMdict/EDRDG et wordfreq), stockées dans un fichier séparé du code, avec attribution dans l’application (page « À propos »).

## Organisation prévisionnelle du dépôt

```
packages/core     → moteur TS pur (saisie romaji, sélection, statistiques, schémas Zod)
packages/vocab    → pipeline + corrections YAML + JSON généré
apps/app          → interface React + Vite, et Tauri (src-tauri)
```

À détailler lors de l’étape architecture.

## Décisions de contenu reportées à la conception

- Variantes romaji : `xtsu`/`ltu`, saisie de `ー`, particules は/へ/を lues `wa`/`e`/`o`.
- Seuils de déblocage, définition de la précision, valeurs des presets de vitesse.
- Taille du corpus V1 (ordre de grandeur : 1 500 à 3 000 mots).
