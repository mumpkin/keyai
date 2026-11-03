/** A source of numbers in [0, 1), deterministic for a given seed. */
export interface Random {
	readonly next: () => number;
}

const UINT32_RANGE = 4_294_967_296;
const MULBERRY_INCREMENT = 0x6d2b79f5;
const MIX_SHIFTS = { first: 15, second: 7, third: 14 } as const;
const MIX_ODD = 61;

/** Mulberry32: small, fast and good enough to vary word selection. */
export function createRandom(seed: number): Random {
	let state = seed >>> 0;
	return {
		next: () => {
			state = (state + MULBERRY_INCREMENT) >>> 0;
			let mixed = state;
			mixed = Math.imul(mixed ^ (mixed >>> MIX_SHIFTS.first), mixed | 1);
			mixed ^=
				mixed +
				Math.imul(
					mixed ^ (mixed >>> MIX_SHIFTS.second),
					mixed | MIX_ODD,
				);
			return (
				((mixed ^ (mixed >>> MIX_SHIFTS.third)) >>> 0) / UINT32_RANGE
			);
		},
	};
}

/** Draws one item with a probability proportional to its weight. */
export function pickWeighted<Item>(
	items: readonly Item[],
	weightOf: (item: Item) => number,
	random: Random,
): Item | undefined {
	const weights = items.map((item) => Math.max(0, weightOf(item)));
	const total = weights.reduce((sum, weight) => sum + weight, 0);
	let threshold = random.next() * total;
	for (const [index, item] of items.entries()) {
		threshold -= weights[index] ?? 0;
		if (threshold < 0) {
			return item;
		}
	}
	return items.at(-1);
}

/** Fisher–Yates shuffle, returning a new array. */
export function shuffle<Item>(items: readonly Item[], random: Random): Item[] {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const target = Math.floor(random.next() * (index + 1));
		[shuffled[index], shuffled[target]] = [
			shuffled[target] as Item,
			shuffled[index] as Item,
		];
	}
	return shuffled;
}
