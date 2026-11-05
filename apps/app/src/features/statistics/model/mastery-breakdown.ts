import { findKana, type Script } from '@keyai/core/kana';
import { masteryOf, type Progress } from '@keyai/core/progression';

const SCRIPTS: readonly Script[] = ['hiragana', 'katakana'];

export interface ScriptBreakdown {
	readonly script: Script;
	readonly mastered: number;
	readonly learning: number;
	readonly locked: number;
}

function breakdownOf(
	script: Script,
	progress: Progress,
	context: MasteryBreakdownContext,
): ScriptBreakdown {
	const unlocked = new Set(progress.unlocked);
	const kana = context.unlockOrder.filter(
		(item) => findKana(item)?.script === script,
	);
	const open = kana.filter((item) => unlocked.has(item));
	const mastered = open.filter(
		(item) =>
			masteryOf(progress.kana[item], context.thresholdKanaPerMinute)
				.isMastered,
	).length;
	return {
		script,
		mastered,
		learning: open.length - mastered,
		locked: kana.length - open.length,
	};
}

export interface MasteryBreakdownContext {
	readonly unlockOrder: readonly string[];
	readonly thresholdKanaPerMinute: number;
}

/**
 * Kana of each script by state. Only the kana of the unlock order count:
 * the others have no word to practise them with (C2).
 */
export function masteryBreakdownOf(
	progress: Progress,
	context: MasteryBreakdownContext,
): ScriptBreakdown[] {
	return SCRIPTS.map((script) => breakdownOf(script, progress, context));
}
