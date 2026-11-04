# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Training screen: series of real words typed in place, recap of the series
  with word cards, live statistics, kana table with mastery, error feedback
- Vocabulary pipeline building 2,720 frequent words from JMdict and wordfreq,
  with the unlock order and a review report
- Unlock order computation mixing hiragana and katakana, and unlocking that
  ignores kana without any typeable word yet
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

[Unreleased]: https://github.com/mumpkin/keyai/commits/main
