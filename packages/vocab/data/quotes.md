# Quotes

Data of the quote mode. `quotes.json` holds 100
quotes, each with its author, work, year of first publication and Aozora Bunko
card.

## Rules

- **Text:** taken word for word from [Aozora Bunko](https://www.aozora.gr.jp/).
  `quotes.test.ts` does not check this: it was done when the file was written.
  Authors and works come from the same catalogue.
- **Works:** out of copyright according to Aozora Bunko, not translations, in
  modern spelling, by authors who died in 1955 or before.
- **Readings:** `ruby` splits the words with spaces, writes `[kanji|reading]`,
  and marks with `{は}` and `{へ}` the particles read _wa_ and _e_. They come from
  Aozora Bunko when it gives them, otherwise from Sudachi, and were then
  corrected by hand: they were not reviewed by a native speaker.
- **Cards:** `words` gives the card of each word, from `quote-words.json`. They
  come from the vocabulary and JMdict, with hand-written ones for grammar and
  names, and their primary sense was read through. They stay out of `vocab.json`.
- **Translations:** written for this project, and compared with those of
  [Tatoeba](https://tatoeba.org/) where they exist, without copying them.

## Licences

The Japanese texts are in the public domain. The translations and readings are
under CC BY-SA 4.0, like the vocabulary data. The Aozora Bunko catalogue is
under CC BY 4.0, credited in the About section.
