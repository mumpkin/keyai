import { masteryOf, nextKanaOf, type Progress } from '@keyai/core/progression';

export type KanaDisplayState =
	| 'locked'
	| 'learning'
	| 'mastered'
	| 'latest'
	| 'next';

const PERCENT = 100;

/** Share of the mastery colour in the background of a kana. */
const BACKGROUND_TINT = 15;
/** Same border opacity as the next kana, which has no background. */
const BORDER_OPACITY = 60;

export interface MasteryColors {
	readonly borderColor: string;
	readonly backgroundColor: string;
	/** Keeps the tint out of the gaps of the dashed border. */
	readonly backgroundClip: 'padding-box';
}

/** From red to green, for a score from 0 to 1 (C8). */
export function masteryColorOf(score: number): string {
	const low = Math.round((1 - score) * PERCENT);
	return `color-mix(in oklch, var(--mastery-low) ${low}%, var(--mastery-high))`;
}

/** Border and light tint of a kana (C8). */
export function masteryColorsOf(score: number): MasteryColors {
	const color = masteryColorOf(score);
	return {
		borderColor: `color-mix(in oklch, ${color} ${BORDER_OPACITY}%, transparent)`,
		backgroundColor: `color-mix(in oklch, ${color} ${BACKGROUND_TINT}%, transparent)`,
		backgroundClip: 'padding-box',
	};
}

export interface KanaStateContext {
	readonly progress: Progress;
	readonly unlockOrder: readonly string[];
	readonly initialUnlocked: number;
	readonly thresholdKanaPerMinute: number;
}

export interface KanaStates {
	readonly stateOf: (kana: string) => KanaDisplayState;
	readonly scoreOf: (kana: string) => number;
}

/** State of every kana in the reference table (C2, C8). */
export function kanaStatesOf(context: KanaStateContext): KanaStates {
	const { progress, thresholdKanaPerMinute } = context;
	const unlocked = new Set(progress.unlocked);
	/** Only a kana unlocked by playing is "new", not the initial group. */
	const latest =
		progress.unlocked.length > context.initialUnlocked
			? progress.unlocked.at(-1)
			: undefined;
	const next = nextKanaOf(progress, context.unlockOrder);
	const masteryFor = (kana: string) =>
		masteryOf(progress.kana[kana], thresholdKanaPerMinute);

	return {
		stateOf: (kana) => {
			if (kana === latest) {
				return 'latest';
			}
			if (kana === next) {
				return 'next';
			}
			if (!unlocked.has(kana)) {
				return 'locked';
			}
			return masteryFor(kana).isMastered ? 'mastered' : 'learning';
		},
		scoreOf: (kana) => masteryFor(kana).score,
	};
}
