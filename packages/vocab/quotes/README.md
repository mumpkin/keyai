# Quotes

Data of the quote mode, which is not in the app yet. `quotes.yaml` holds 100
quotes, each with its author, work, year of first publication and Aozora Bunko
card.

## Rules

- **Text:** taken word for word from [Aozora Bunko](https://www.aozora.gr.jp/).
  `quotes.test.ts` does not check this: it was done when the file was written.
- **Works:** out of copyright according to Aozora Bunko, not translations, in
  modern spelling, by authors who died in 1955 or before.
- **Readings:** `ruby` splits the words with spaces, writes `[kanji|reading]`,
  and marks with `{は}` and `{へ}` the particles read _wa_ and _e_. They come from
  Aozora Bunko when it gives them, otherwise from Sudachi, and were then
  corrected by hand: they were not reviewed by a native speaker.
- **Translations:** written for this project, and compared with those of
  [Tatoeba](https://tatoeba.org/) where they exist, without copying them.

## Licences

The Japanese texts are in the public domain. The translations and readings are
under CC BY-SA 4.0, like the vocabulary data. The Aozora Bunko catalogue is
under CC BY 4.0: the app must credit it when this data ships.
