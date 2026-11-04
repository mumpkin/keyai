# Functional specification — kana reading training application

**Version:** draft 0.2  
**Scope:** functional needs and user experience. Technical choices are deliberately excluded, to be defined later.

## 1. Goal

Create an application that helps complete beginners learn to read Japanese kana through repetition and keyboard typing. The exercise must also introduce them to frequent vocabulary.

The first version focuses on hiragana and katakana. Kanji may be considered in a later version.

## 2. Audience and platforms

- The application is aimed first at complete beginners.
- It is designed mainly for use on a computer, with a keyboard.
- It must remain responsive enough to be usable on mobile.
- It must be available in a browser and as a downloadable application for Windows and Linux.
- The interface will be offered in French and English, with priority given to French.

## 3. Course of a session

1. The user chooses the number of words in the session, not the words themselves.
2. The application generates a sequence of frequent Japanese words, without trying to form sentences.
3. Words are displayed in kana; the user types their reading in romaji.
4. An error must be corrected before the user can continue.
5. At the end of each word, its short translation appears below the exercise.
6. Audio pronunciation is not planned for V1.

Words must not repeat during a session as long as enough eligible words remain. If the available vocabulary is too small, repetitions are allowed.

## 4. Vocabulary and word selection

- The vocabulary contains frequent words of everyday written Japanese.
- Words usually written in kanji may be presented in kana only.
- Particles are included. Their detail card must state that they are particles and describe their function rather than give them a misleadingly simple translation.
- Word selection is limited to kana already unlocked.
- **Training priority:** sequences must favour words containing the last unlocked kana and kana that are unlocked but not yet mastered. Generation maximises their presence when the available vocabulary allows it; it may use other eligible words if that vocabulary is not sufficient.
- Frequent words that become accessible with a new kana must contribute to the progression order.

The short translation follows the language chosen in the options. A more detailed card is available on hover, keyboard focus and touch. It may notably specify the meaning, usage or grammatical function of a word.

## 5. Kana progression

- V1 includes hiragana and katakana, each with a distinct progression and mastery measure.
- The default path starts with hiragana; the corresponding katakana are then introduced.
- Sessions may mix hiragana and katakana words as soon as the required kana have been learned.
- Kana are unlocked one by one.
- The first group of hiragana is chosen to quickly form frequent words, rather than only following a conventional order.
- The next kana is chosen according to the frequent words it allows practising; gojūon order serves as a reference in case of a tie.
- The progression includes basic and extended forms: kana with voicing marks, combinations such as `きゃ`, small `っ` and `ー` in katakana.
- Unlocking takes into account the speed and accuracy observed over several attempts. The exact thresholds and calculation remain to be defined.

## 6. Speed, accuracy and errors

Speed is expressed in **correctly typed kana per minute**. Its threshold is customisable: the user can enter a precise value or choose a preset — "facile / easy", "normal", "difficile / hard" — then adjust the value.

Accuracy and errors are also taken into account for progression and the summary. Errors must be corrected before moving on and remain visible in the statistics.

**Definition to confirm:** one possible measure of accuracy would be the percentage of correctly typed kana, counting corrected errors. The accuracy threshold required for unlocking is not yet set.

## 7. Training interface and summary

- A kana reference table is placed at the bottom of the screen, where Keybr shows its virtual keyboard.
- The table shows the characters and their romaji equivalent.
- All kana are visible from the start; those not unlocked appear greyed out.
- The end-of-session summary shows speed, accuracy, frequent errors, unlocked kana and the words encountered.
- No detailed session history is needed.

## 8. Romaji input

Hepburn is the displayed reference form, but common variants must be accepted. For example, `し` can be typed `shi` or `si`, and `ち` as `chi` or `ti`.

The full list of accepted variants and the input rules for special sounds remain to be specified.

## 9. Data and offline use

- No user account is planned.
- Progress is kept on the device.
- The user can export and import their progress manually, notably to transfer it between the browser and the installed application.
- Exercises must not depend on an API and must be usable offline.
- Audio pronunciation is postponed to V2.

## 10. Out of scope for V1

- Kanji exercises.
- Audio pronunciation.
- Accounts and automatic synchronisation.
- Detailed session history.

## Points to specify later

- The exact definition of accuracy and the threshold required to unlock a kana.
- The values offered by the speed presets.
- The exhaustive list of accepted romaji input variants.
- The amount and sources of the vocabulary, and its frequency information
