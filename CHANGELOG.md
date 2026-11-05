# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Natural writing, on by default: words follow each other without typing a
  space, with or without a gap on screen
- An Anki list: add words from their card and export them from the statistics
- A "My kana" tab, shown first, with every unlocked kana from the most recent

### Changed

- The kana table remembers its tab, across screens and launches
- On phones, the kana to work on start with the most recent

### Fixed

- Kana still to type stand out clearly from the kana already typed

## [0.3.0] - 2026-11-05

### Added

- A link in the word card and the settings to report a wrong translation

### Changed

- Every word has a French translation, and particles have a French note
- Word cards show each homograph before the secondary senses of the first one
- Many more words have a French translation, with up to two glosses each

## [0.2.0] - 2026-11-05

### Added

- The desktop app offers new versions at launch, and installs them on request

### Fixed

- A second tab no longer erases the progress saved by the first one

### Changed

- Accessibility: kana are no longer keyboard stops, Japanese text is marked as
  such, screen readers hear the end of a series, selected states show in high
  contrast mode, and locked kana are easier to read
- A very short animation marks a new kana
- A series in progress survives a visit to another screen
- A notice says when typing lost the focus, and a line guides the first series
- The next kana unlocks once the last five are mastered, instead of all of
  them, the screen says which ones are missing, and the weakest kana is always
  featured
- On a phone, the words sit above the virtual keyboard, and the kana table
  gives way to the kana to work on

## [0.1.0] - 2026-11-04

### Added

- Download button for the desktop app on the web version
- Installable web app that works offline, offering new versions without
  forcing them
- Header that stays visible while scrolling
- Warning and a kept copy when the stored save cannot be read
- Dark theme, with a setting to follow the system or force dark or light
- Statistics screen: last series with the speed of each word, progress per
  script and history of the last series
- Export and import of the progress, with a preview before replacing it
- Settings screen: language, words per series, speed threshold, error sound,
  kana size, progress reset and about section
- French and English interface, following the language of the settings
- Custom series length typed directly in the statistics bar
- Desktop app without a system title bar: window buttons in the header, which
  also moves the window
- Favicon: the kana `け` on a key with the typing cursor
- Training screen: series of real words typed in place, recap of the series
  with word cards, live statistics, kana table with mastery, error feedback
- Vocabulary pipeline building 2,720 frequent words from JMdict and wordfreq,
  with the unlock order and a review report
- Unlock order mixing hiragana and katakana, starting with a group in each
  script, in which every kana opens at least one word
- Settings with speed presets and versioned save format with validation and
  migrations
- Kana catalogue (105 hiragana, 126 katakana units) and romaji input engine
  validating keystrokes
- Series measurements (speed, accuracy, errors) and kana mastery and
  unlocking rules
- Vocabulary format and word selection for a series
- Series state machine: typing, skipping and returning to words, timing
- Functional specification, technical choices and architecture documents
- README and MIT license
- Contributing guide with Clean Code, branch and commit conventions
- Biome configuration with Clean Code rules and a single-letter identifier
  check

[Unreleased]: https://github.com/mumpkin/keyai/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/mumpkin/keyai/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/mumpkin/keyai/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mumpkin/keyai/releases/tag/v0.1.0
