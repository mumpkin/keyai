import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const STYLES = readFileSync(new URL('./app.css', import.meta.url), 'utf8');

const TEXT = 4.5;
/** Field borders, charts and large marks (WCAG 1.4.11). */
const GRAPHIC = 3;

type Tokens = ReadonlyMap<string, string>;

function tokensOf(selector: string): Tokens {
	const block = STYLES.split(`\n${selector} {\n`)[1]?.split('\n}')[0] ?? '';
	const entries = block.matchAll(/--([\w-]+): (#[0-9a-f]{6});/g);
	return new Map(
		[...entries].map(([, name, hex]) => [name as string, hex as string]),
	);
}

function channelsOf(hex: string): number[] {
	return [1, 3, 5].map((start) =>
		Number.parseInt(hex.slice(start, start + 2), 16),
	);
}

function luminanceOf(channels: readonly number[]): number {
	const [red, green, blue] = channels.map((channel) => {
		const value = channel / 255;
		return value <= 0.04045
			? value / 12.92
			: ((value + 0.055) / 1.055) ** 2.4;
	}) as [number, number, number];
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastOf(first: number[], second: number[]): number {
	const [lighter, darker] = [luminanceOf(first), luminanceOf(second)].sort(
		(one, other) => other - one,
	) as [number, number];
	return (lighter + 0.05) / (darker + 0.05);
}

/** A colour at some opacity over another, as `bg-destructive/10` paints it. */
function blend(top: number[], bottom: number[], opacity: number): number[] {
	return top.map(
		(channel, index) =>
			channel * opacity + (bottom[index] ?? 0) * (1 - opacity),
	);
}

const TEXT_PAIRS = [
	['foreground', 'background'],
	['foreground', 'muted'],
	['muted-foreground', 'background'],
	['muted-foreground', 'muted'],
	['muted-foreground', 'popover'],
	['destructive', 'popover'],
	['popover-foreground', 'popover'],
	['primary', 'background'],
	['primary-foreground', 'primary'],
	['destructive', 'background'],
	['background', 'destructive'],
] as const;

const GRAPHIC_PAIRS = [
	['input', 'background'],
	['ring', 'background'],
	['mastery-low', 'background'],
	['mastery-high', 'background'],
] as const;

describe.each([
	['light', ':root', 0.1],
	['dark', '.dark', 0.2],
] as const)('%s theme', (_name, selector, destructiveTint) => {
	const tokens = tokensOf(selector);
	const colour = (name: string) => channelsOf(tokens.get(name) ?? '');

	it.each(TEXT_PAIRS)('%s on %s is readable', (text, surface) => {
		expect(
			contrastOf(colour(text), colour(surface)),
		).toBeGreaterThanOrEqual(TEXT);
	});

	it.each(GRAPHIC_PAIRS)('%s on %s stands out', (graphic, surface) => {
		expect(
			contrastOf(colour(graphic), colour(surface)),
		).toBeGreaterThanOrEqual(GRAPHIC);
	});

	it('keeps a warning readable on its tint', () => {
		const tint = blend(
			colour('destructive'),
			colour('background'),
			destructiveTint,
		);
		expect(contrastOf(colour('destructive'), tint)).toBeGreaterThanOrEqual(
			TEXT,
		);
	});

	it('keeps a kana readable on its mastery tint', () => {
		for (const mastery of ['mastery-low', 'mastery-high']) {
			const tint = blend(colour(mastery), colour('background'), 0.15);
			expect(
				contrastOf(colour('foreground'), tint),
			).toBeGreaterThanOrEqual(TEXT);
		}
	});
});
