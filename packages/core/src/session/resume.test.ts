import { describe, expect, it } from 'vitest';
import { createSeries } from './create.ts';
import { seriesReducer } from './reducer.ts';
import { resumeSeries } from './resume.ts';

describe('resumeSeries', () => {
	it('leaves a series that has not started alone', () => {
		const series = createSeries(['いぬ']);
		expect(resumeSeries(series, 5000)).toBe(series);
	});

	it('does not count the time away, nor time the unit in progress', () => {
		const started = seriesReducer(createSeries(['いぬ']), {
			type: 'key',
			key: 'i',
			at: 1000,
		});
		const resumed = resumeSeries(started, 60_000);
		expect(resumed.startedAt).toBe(61_000);

		const typed = seriesReducer(resumed, {
			type: 'key',
			key: 'n',
			at: 62_000,
		});
		const finished = seriesReducer(typed, {
			type: 'key',
			key: 'u',
			at: 62_500,
		});
		expect(finished.attempts.at(-1)?.durationMs).toBeNull();
	});
});
