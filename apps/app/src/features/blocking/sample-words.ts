export type WordStatus = 'done' | 'skipped' | 'current' | 'pending';

interface SampleEntry {
	readonly kana: string;
	readonly romaji: string;
	readonly gloss: string;
	readonly kanji?: string;
	readonly otherSenses?: readonly string[];
	readonly faultyUnits?: readonly number[];
}

export interface SampleWord extends SampleEntry {
	readonly id: string;
	readonly status: WordStatus;
	readonly completedUnits?: number;
	readonly hasPartialInput?: boolean;
}

const SAMPLE_POOL: readonly SampleEntry[] = [
	{ kana: 'いぬ', romaji: 'inu', gloss: 'chien', kanji: '犬' },
	{ kana: 'くに', romaji: 'kuni', gloss: 'pays', faultyUnits: [1] },
	{ kana: 'すし', romaji: 'sushi', gloss: 'sushi' },
	{
		kana: 'いる',
		romaji: 'iru',
		gloss: 'être, exister',
		kanji: '居る',
		otherSenses: ['avoir besoin de (要る)', 'entrer (入る)'],
	},
	{ kana: 'ねこ', romaji: 'neko', gloss: 'chat', kanji: '猫' },
	{ kana: 'きく', romaji: 'kiku', gloss: 'écouter' },
	{ kana: 'のこす', romaji: 'nokosu', gloss: 'laisser' },
	{ kana: 'いし', romaji: 'ishi', gloss: 'pierre' },
	{ kana: 'くし', romaji: 'kushi', gloss: 'peigne' },
	{ kana: 'ねる', romaji: 'neru', gloss: 'dormir' },
	{ kana: 'さく', romaji: 'saku', gloss: 'fleurir' },
	{ kana: 'の', romaji: 'no', gloss: 'particule (possession)' },
	{ kana: 'みず', romaji: 'mizu', gloss: 'eau', kanji: '水' },
	{ kana: 'やま', romaji: 'yama', gloss: 'montagne', kanji: '山' },
	{ kana: 'かわ', romaji: 'kawa', gloss: 'rivière', kanji: '川' },
	{ kana: 'そら', romaji: 'sora', gloss: 'ciel', kanji: '空' },
	{ kana: 'あめ', romaji: 'ame', gloss: 'pluie', kanji: '雨' },
	{ kana: 'はな', romaji: 'hana', gloss: 'fleur', kanji: '花' },
	{ kana: 'ひと', romaji: 'hito', gloss: 'personne', kanji: '人' },
	{ kana: 'て', romaji: 'te', gloss: 'main', kanji: '手' },
	{ kana: 'あし', romaji: 'ashi', gloss: 'pied, jambe', kanji: '足' },
	{ kana: 'め', romaji: 'me', gloss: 'œil', kanji: '目' },
	{ kana: 'みみ', romaji: 'mimi', gloss: 'oreille', kanji: '耳' },
	{ kana: 'くち', romaji: 'kuchi', gloss: 'bouche', kanji: '口' },
	{ kana: 'あさ', romaji: 'asa', gloss: 'matin', kanji: '朝' },
	{ kana: 'よる', romaji: 'yoru', gloss: 'nuit', kanji: '夜' },
	{ kana: 'いえ', romaji: 'ie', gloss: 'maison', kanji: '家' },
	{ kana: 'みち', romaji: 'michi', gloss: 'chemin', kanji: '道' },
	{ kana: 'うみ', romaji: 'umi', gloss: 'mer', kanji: '海' },
	{ kana: 'ほし', romaji: 'hoshi', gloss: 'étoile', kanji: '星' },
	{ kana: 'つき', romaji: 'tsuki', gloss: 'lune', kanji: '月' },
	{ kana: 'かぜ', romaji: 'kaze', gloss: 'vent', kanji: '風' },
	{ kana: 'ゆき', romaji: 'yuki', gloss: 'neige', kanji: '雪' },
	{ kana: 'たべる', romaji: 'taberu', gloss: 'manger', kanji: '食べる' },
	{ kana: 'のむ', romaji: 'nomu', gloss: 'boire', kanji: '飲む' },
	{ kana: 'みる', romaji: 'miru', gloss: 'voir', kanji: '見る' },
	{ kana: 'いく', romaji: 'iku', gloss: 'aller', kanji: '行く' },
	{ kana: 'くる', romaji: 'kuru', gloss: 'venir', kanji: '来る' },
	{ kana: 'かく', romaji: 'kaku', gloss: 'écrire', kanji: '書く' },
	{ kana: 'よむ', romaji: 'yomu', gloss: 'lire', kanji: '読む' },
	{ kana: 'はなす', romaji: 'hanasu', gloss: 'parler', kanji: '話す' },
	{ kana: 'あるく', romaji: 'aruku', gloss: 'marcher', kanji: '歩く' },
	{ kana: 'おおきい', romaji: 'ookii', gloss: 'grand', kanji: '大きい' },
	{ kana: 'ちいさい', romaji: 'chiisai', gloss: 'petit', kanji: '小さい' },
	{ kana: 'あたらしい', romaji: 'atarashii', gloss: 'nouveau' },
	{ kana: 'ふるい', romaji: 'furui', gloss: 'ancien', kanji: '古い' },
	{ kana: 'たかい', romaji: 'takai', gloss: 'haut, cher', kanji: '高い' },
	{ kana: 'やすい', romaji: 'yasui', gloss: 'bon marché', kanji: '安い' },
	{ kana: 'あか', romaji: 'aka', gloss: 'rouge', kanji: '赤' },
	{ kana: 'あお', romaji: 'ao', gloss: 'bleu', kanji: '青' },
	{ kana: 'しろ', romaji: 'shiro', gloss: 'blanc', kanji: '白' },
	{ kana: 'くろ', romaji: 'kuro', gloss: 'noir', kanji: '黒' },
	{ kana: 'なつ', romaji: 'natsu', gloss: 'été', kanji: '夏' },
	{ kana: 'ふゆ', romaji: 'fuyu', gloss: 'hiver', kanji: '冬' },
	{ kana: 'はる', romaji: 'haru', gloss: 'printemps', kanji: '春' },
	{ kana: 'あき', romaji: 'aki', gloss: 'automne', kanji: '秋' },
	{ kana: 'ともだち', romaji: 'tomodachi', gloss: 'ami', kanji: '友達' },
	{ kana: 'せんせい', romaji: 'sensei', gloss: 'professeur', kanji: '先生' },
	{ kana: 'がっこう', romaji: 'gakkou', gloss: 'école', kanji: '学校' },
];

const COMPLETED_SHARE = 0.4;
const SKIPPED_INDEX = 2;

function statusAt(index: number, completedCount: number): WordStatus {
	if (index === completedCount) {
		return 'current';
	}
	if (index > completedCount) {
		return 'pending';
	}
	return index === SKIPPED_INDEX ? 'skipped' : 'done';
}

function currentWordProgress(status: WordStatus): Partial<SampleWord> {
	return status === 'current'
		? { completedUnits: 1, hasPartialInput: true, faultyUnits: [0] }
		: {};
}

export function buildSampleSeries(length: number): SampleWord[] {
	const completedCount = Math.round(length * COMPLETED_SHARE);
	return Array.from({ length }, (_, index) => {
		const entry = SAMPLE_POOL[index % SAMPLE_POOL.length] as SampleEntry;
		const status = statusAt(index, completedCount);
		return {
			...entry,
			id: `${index}:${entry.kana}`,
			status,
			...currentWordProgress(status),
		};
	});
}
