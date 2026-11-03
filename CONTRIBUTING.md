# Contributing

Everything in this repository is written in English: code, comments, commit
messages, branch names, changelog and technical documentation.

## Clean Code

The code follows the rules of _Clean Code_ (Robert C. Martin).

- **Descriptive names, no obfuscation.** Single-letter identifiers are
  forbidden, including loop counters, callback parameters and `catch`
  bindings: write `index`, `word`, `error`. Avoid cryptic abbreviations.
- **Small functions that do one thing**, at one level of abstraction.
- **Few arguments**: three at most; group related values in an object.
- **No side effects hidden behind a name** that does not announce them.
- **No magic numbers**: use named constants.
- **No nested ternaries, no parameter reassignment, always use braces.**
- **Comments explain why, not what.** If code needs a comment to explain
  what it does, rename or extract instead.
- **Tests are first-class code** and follow the same rules.

Biome enforces what can be automated (`biome.json`):

| Rule                                                                     | Limit                     |
| ------------------------------------------------------------------------ | ------------------------- |
| Single-letter identifiers                                                | forbidden (GritQL plugin) |
| `noExcessiveCognitiveComplexity`                                         | 10                        |
| `noExcessiveLinesPerFunction`                                            | 40 (tests excluded)       |
| `useMaxParams`                                                           | 3                         |
| `noExcessiveLinesPerFile`                                                | 300                       |
| `noMagicNumbers`                                                         | error (tests excluded)    |
| `noNestedTernary`, `noParameterAssign`, `useBlockStatements`, `noShadow` | error                     |
| `useNamingConvention`                                                    | strict case, ASCII only   |

## Code style

Formatting is handled by Biome: tabs (width 4), 80 columns, single quotes
(double quotes in JSX attributes), semicolons, trailing commas. Run
`pnpm check` before pushing; the pre-commit hook does it for staged files.

## Branches

Every change goes through a branch and a pull request. The branch prefix
carries the type of change:

| Prefix      | Use                                  |
| ----------- | ------------------------------------ |
| `feat/`     | New feature                          |
| `fix/`      | Bug fix                              |
| `docs/`     | Documentation only                   |
| `refactor/` | Code change without behaviour change |
| `perf/`     | Performance improvement              |
| `test/`     | Tests only                           |
| `ci/`       | Continuous integration               |
| `chore/`    | Tooling, dependencies, maintenance   |

Example: `feat/romaji-matcher`.

## Commit messages

- Imperative mood: `Add`, `Fix`, `Remove` (not `Added`, `Fixes`).
- Start with a capital letter.
- No prefix (`feat:`, `fix:`…): the type lives in the branch name.
- No trailing punctuation.
- Subject line of 72 characters at most.
- Code, file and library names go between backticks.

```
Add `tokenize` to split words into kana units
Handle `ん` before vowels in the matcher
Configure `biome.json` with tab indentation
```

A `commit-msg` hook (lefthook) and the CI check these rules, except the
imperative mood, which is left to review.

## History

The history of `main` is linear: no merge commits.

- Pull requests are merged with **Rebase and merge** only.
- Update a branch with `git rebase main`, never `git merge`.
- Set `git config pull.rebase true` locally.
- Clean up your commits (`git rebase -i`) before asking for review.

## Changelog and versioning

- The project follows [Semantic Versioning](https://semver.org/). Versions
  stay at `0.x.y` until the first stable release.
- [`CHANGELOG.md`](./CHANGELOG.md) follows
  [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
- Every pull request that changes the application updates the
  `[Unreleased]` section. Pull requests that do not affect users (CI,
  tooling) carry the `no-changelog` label.
- A release moves `[Unreleased]` to a new `[X.Y.Z] - YYYY-MM-DD` section and
  tags `vX.Y.Z`. The GitHub Release notes are taken from that section.
