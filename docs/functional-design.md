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

Greedy selection: at each step, pick the kana that makes the most new
frequent words typeable.

1. **Weight**: each word counts for its log-scale frequency (wordfreq Zipf
   value). Raw frequency would let particles dominate everything.
2. **Prerequisites**: a voiced kana comes after its base form (が after か); a
   combination after both components (きゃ after き and や); っ only when it
   opens words; an extended combination after its components (ティ after テ
   and イ).
3. **Ties** are broken by gojūon order.

### Initial group

About **six hiragana** are unlocked from the start, chosen with the same
method under a constraint of at least ~15 typeable words. Single-kana
particles (の, に, は, か, と…) help reach that quickly. The exact size and
minimum are tuned from the pipeline report, on real data.

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
their Hepburn reading.

### Summary charts

Built with shadcn/ui Charts (Recharts 3).

| Chart                  | Content                                                      |
| ---------------------- | ------------------------------------------------------------ |
| Speed over the session | One point per word, with the speed threshold as a line       |
| Session kana           | Speed per kana as bars, coloured by accuracy, threshold line |
| Overall progress       | Locked / learning / mastered kana, for hiragana and katakana |
| Progress over time     | Speed and accuracy over the last sessions (light history)    |

The light history keeps one record per session (date, speed, accuracy, word
count, unlocked kana) for the last 100 sessions; see architecture, A3.
