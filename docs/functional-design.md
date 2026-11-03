# Functional design

**Status:** approved on 2026-11-03
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
- **ん before a vowel, `y` or `n`** — or before a kana that can be typed
  starting with one of them, such as `を` (`o`) — must be typed `nn` or `n'`.
  The displayed reading uses `n'` in these cases (こんにちは →
  `kon'nichiha`), so that the displayed form is always typeable; this
  departs from strict Hepburn, which writes `konnichiwa`.
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
3. **Usefulness**: a candidate must make at least one new word typeable;
   otherwise it could never be practised, hence never mastered, and would
   block the progression.
4. **Balance**: if one script has had **three unlocks in a row** while the
   other has a useful candidate, the next unlock goes to the other script.
   Frequency drives the order; this rule only prevents one script from
   starving the other.
5. **Ties** are broken by gojūon order (hiragana first).

### Initial group

About **six hiragana** (no katakana: the default path starts with
hiragana) are unlocked from the start, chosen with the same
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
- An unlocked kana is never locked again; if it regresses, it delays the next
  unlock until it is mastered again.
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
- **Priority kana**: the **featured kana** (the last unlocked one)
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
  repetitions become necessary, never the same word twice in a row.
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

| Setting           | Default                       | Range            |
| ----------------- | ----------------------------- | ---------------- |
| Words per session | 20                            | 5 to 100         |
| Language          | browser language, else French | French / English |
| Error sound       | off                           | on / off         |

### Data management

- **Export** the progress (`keyai-save` file).
- **Import**: a preview (file date, unlocked kana, number of sessions) is
  shown first; after confirmation the file **replaces** the current progress
  entirely. No merging.
- **Reset** the progress, with an explicit confirmation.

### Not in settings (V1)

- Light and dark themes follow the system (`prefers-color-scheme`).
- Choosing which kana to practise: progression stays automatic.

## C7 — V1 corpus

### Size

- **2,000 to 3,000 kana spellings** (target 2,500, tuned from the pipeline
  report), taken by frequency, plus the coverage additions below.
- **Missing French translations fall back to English**, marked with an `EN`
  badge in the interface. French translations are completed in later data
  releases; a vocabulary update needs no code change.
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
