import { type RefObject, useEffect, useRef } from 'react';

/** Wheel travel for one row: a mouse notch is at least this long. */
const WHEEL_PX_PER_ROW = 50;
const WHEEL_PX_PER_LINE = 16;

/**
 * At most one row per wheel event, so that no row is ever jumped over; small
 * trackpad movements add up until they make a row.
 */
export function rowStepOf(accumulatedPx: number): {
	readonly rows: number;
	readonly remainderPx: number;
} {
	const rows = Math.trunc(accumulatedPx / WHEEL_PX_PER_ROW);
	return rows === 0
		? { rows: 0, remainderPx: accumulatedPx }
		: { rows: Math.sign(rows), remainderPx: 0 };
}

function rowPitchOf(list: HTMLElement): number {
	const [first, ...others] = [...list.children] as HTMLElement[];
	const next = others.find((row) => row.offsetTop !== first?.offsetTop);
	return next && first ? next.offsetTop - first.offsetTop : list.clientHeight;
}

function canScroll(list: HTMLElement, direction: number): boolean {
	return direction > 0
		? list.scrollTop + list.clientHeight < list.scrollHeight - 1
		: list.scrollTop > 0;
}

/** Scrolls a short list row by row; at its ends, the page takes over. */
export function useRowWheelScroll(listRef: RefObject<HTMLElement | null>) {
	const accumulatedPx = useRef(0);

	useEffect(() => {
		const list = listRef.current;
		if (!list) {
			return;
		}
		const handleWheel = (event: WheelEvent) => {
			if (!canScroll(list, event.deltaY)) {
				return;
			}
			event.preventDefault();
			accumulatedPx.current +=
				event.deltaY *
				(event.deltaMode === WheelEvent.DOM_DELTA_PIXEL
					? 1
					: WHEEL_PX_PER_LINE);
			const step = rowStepOf(accumulatedPx.current);
			accumulatedPx.current = step.remainderPx;
			list.scrollBy({ top: step.rows * rowPitchOf(list) });
		};
		list.addEventListener('wheel', handleWheel, { passive: false });
		return () => list.removeEventListener('wheel', handleWheel);
	}, [listRef]);
}
