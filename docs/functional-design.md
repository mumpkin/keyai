# Functional design

**Status:** in progress
**Related:** [architecture](./architecture.md) ·
[functional specification (FR)](./cahier-des-charges.md)

This document settles the points left open by the specification. Topics are
validated one at a time:

| #   | Topic                                           | Status   |
| --- | ----------------------------------------------- | -------- |
| C1  | Romaji tables                                   | Approved |
| C2  | Kana catalogue, reference table, initial group  | Pending  |
| C3  | Measurements: speed, accuracy, pause threshold  | Pending  |
| C4  | Mastery and unlocking                           | Pending  |
| C5  | Session word selection                          | Pending  |
| C6  | Settings: speed presets, default session length | Pending  |
| C7  | V1 corpus: size, filters, katakana introduction | Pending  |

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
| ん before a vowel, `y` or `n`                             | n'                                       | nn, n' (a single `n` would be ambiguous)       |
| っ before a consonant                                     | doubled consonant                        | っち: tchi or cchi                             |
| ー                                                        | -                                        | `-` or the repeated previous vowel             |
| ティ / ディ / トゥ                                        | ti / di / tu                             | also thi / dhi / twu                           |
| ファ, フィ, フェ, フォ, ヴ, ウィ, ウェ, シェ, ジェ, チェ… | fa, fi, fe, fo, vu, wi, we, she, je, che | IME-only variants (fwa, xye…) are not accepted |

- **Input follows the writing, not the pronunciation**: the particle は is
  typed `ha`, へ is typed `he` (see architecture, A3).
- **Combinations cannot be typed in two parts** (`きゃ` as `ki` + `xya`): the
  point is to learn `きゃ` as a whole.
- **A standalone small `っ`** (`xtsu`, `ltu`) is not accepted; the pipeline
  drops the rare words ending with `っ`.
