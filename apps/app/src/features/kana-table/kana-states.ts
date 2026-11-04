import { masteryOf, nextKanaOf, type Progress } from '@keyai/core/progression';

export type KanaDisplayState =
	| 'locked'
	| 'learning'
	| 'mastered'
	| 'latest'
	| 'next';

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
