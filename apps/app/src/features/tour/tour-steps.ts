import type { TrainingMode } from '@keyai/core/settings';
import type { Screen } from '@/stores/ui-store.ts';

/** Where a step happens: the tour moves there by itself. */
export interface TourPlace {
	readonly screen: Screen;
	readonly mode?: TrainingMode;
}

export interface TourStep {
	readonly id: string;
	readonly target: string;
	readonly place: TourPlace;
}

const WORDS: TourPlace = { screen: 'training', mode: 'words' };
const QUOTES: TourPlace = { screen: 'training', mode: 'quotes' };
const STATISTICS: TourPlace = { screen: 'statistics' };
const SETTINGS: TourPlace = { screen: 'settings' };

export const CENTER = 'body';

function zone(name: string): string {
	return `[data-tour="${name}"]`;
}

export const VISIT_STEPS: readonly TourStep[] = [
	{ id: 'welcome', target: CENTER, place: WORDS },
	{ id: 'line', target: zone('line'), place: WORDS },
	{ id: 'lookup', target: zone('kana'), place: WORDS },
	{ id: 'tabs', target: zone('tabs'), place: WORDS },
	{ id: 'mastery', target: `${zone('table')} [role="img"]`, place: WORDS },
	{ id: 'unlock', target: zone('unlock'), place: WORDS },
	{ id: 'bar', target: zone('bar'), place: WORDS },
	{ id: 'stuck', target: zone('line'), place: WORDS },
	{ id: 'quotes', target: zone('mode'), place: QUOTES },
	{ id: 'display', target: zone('display'), place: QUOTES },
	{ id: 'result', target: zone('result'), place: QUOTES },
	{ id: 'lastSeries', target: zone('last-series'), place: STATISTICS },
	{ id: 'progress', target: zone('progress'), place: STATISTICS },
	{ id: 'anki', target: zone('anki'), place: STATISTICS },
	{ id: 'speed', target: zone('speed'), place: SETTINGS },
	{ id: 'session', target: zone('session'), place: SETTINGS },
	{ id: 'end', target: zone('replay-tour'), place: SETTINGS },
];

/** Shown once, after the first series: only then is there a word to hover. */
export const WORD_CARD_STEPS: readonly TourStep[] = [
	{
		id: 'wordCards',
		target: zone('recap'),
		place: { screen: 'training' },
	},
];
