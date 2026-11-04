# keyai

Learn to read Japanese kana by typing them.

keyai is a typing trainer for complete beginners, inspired by
[Keybr](https://www.keybr.com/). Frequent Japanese words are shown in
hiragana and katakana; you type their reading in romaji. Kana are unlocked
one at a time, based on your speed and accuracy, and every word comes with a
short translation in French or English.

> **Status:** early version, [available on the web](https://mumpkin.github.io/keyai/).

## Features

- Hiragana and katakana, including voiced kana, combinations (`きゃ`), small
  `っ`, long vowel mark `ー` and extended katakana (`ティ`, `ファ`…)
- Progressive unlocking driven by word frequency
- Hepburn romaji with common variants accepted (`shi` / `si`)
- Word cards with every meaning, usual kanji form and grammatical notes
- Session summary with charts
- Works offline; progress stays on your device, with export and import
- Web app (installable on mobile) and desktop app for Windows and Linux
- Interface in French and English

## Documentation

- [Functional specification](./docs/functional-specification.md)
- [Technical choices](./docs/technical-choices.md)
- [Architecture](./docs/architecture.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## License

The source code is released under the [MIT License](./LICENSE).

The vocabulary data is derived from the following sources and is released
under the
[Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
license:

- [JMdict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project),
  property of the
  [Electronic Dictionary Research and Development Group](https://www.edrdg.org/),
  used in conformance with the Group's
  [licence](https://www.edrdg.org/edrdg/licence.html)
- [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer
