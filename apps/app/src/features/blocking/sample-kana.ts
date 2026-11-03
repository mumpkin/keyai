export type KanaState = 'locked' | 'learning' | 'mastered' | 'latest' | 'next';

export interface KanaSlot {
	readonly id: string;
	readonly kana: SampleKana | null;
}

export interface SampleKana {
	readonly kana: string;
	readonly romaji: string;
	readonly state: KanaState;
}

const MASTERED = new Set(['い', 'し', 'の', 'に', 'か', 'た']);
const LEARNING = new Set(['ね', 'す', 'る', 'こ', 'き', 'さ', 'ぬ']);
const LATEST = 'く';
const NEXT = 'て';

function stateOf(kana: string): KanaState {
	if (kana === LATEST) {
		return 'latest';
	}
	if (kana === NEXT) {
		return 'next';
	}
	if (MASTERED.has(kana)) {
		return 'mastered';
	}
	return LEARNING.has(kana) ? 'learning' : 'locked';
}

function row(kanaList: string, romajiList: string): (SampleKana | null)[] {
	const romaji = romajiList.split(' ');
	return [...kanaList].map((kana, index) =>
		kana === '・'
			? null
			: { kana, romaji: romaji[index] ?? '', state: stateOf(kana) },
	);
}

export const HIRAGANA_ROWS: readonly (SampleKana | null)[][] = [
	row('あいうえお', 'a i u e o'),
	row('かきくけこ', 'ka ki ku ke ko'),
	row('さしすせそ', 'sa shi su se so'),
	row('たちつてと', 'ta chi tsu te to'),
	row('なにぬねの', 'na ni nu ne no'),
	row('はひふへほ', 'ha hi fu he ho'),
	row('まみむめも', 'ma mi mu me mo'),
	row('や・ゆ・よ', 'ya - yu - yo'),
	row('らりるれろ', 'ra ri ru re ro'),
	row('わ・・・を', 'wa - - - wo'),
	row('ん・・・・', 'n - - - -'),
];

export const HIRAGANA_SLOTS: readonly KanaSlot[] = HIRAGANA_ROWS.flatMap(
	(cells, rowIndex) =>
		cells.map((kana, columnIndex) => ({
			id: kana?.kana ?? `gap-${rowIndex}-${columnIndex}`,
			kana,
		})),
);
