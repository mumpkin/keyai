import { useState } from 'react';
import { Placeholder } from '@/features/blocking/placeholder';

const DEFAULT_KANA_SIZE_PX = 24;
const MIN_KANA_SIZE_PX = 16;
const MAX_KANA_SIZE_PX = 64;

export function KanaSizeSetting() {
	const [sizePx, setSizePx] = useState(DEFAULT_KANA_SIZE_PX);

	function applySize(nextSizePx: number) {
		setSizePx(nextSizePx);
		document.documentElement.style.setProperty(
			'--kana-size',
			`${nextSizePx}px`,
		);
	}

	return (
		<Placeholder label="Affichage">
			<p className="font-medium">Affichage</p>
			<label className="mt-1 flex items-center gap-3 text-sm">
				Taille des kana
				<input
					type="range"
					min={MIN_KANA_SIZE_PX}
					max={MAX_KANA_SIZE_PX}
					value={sizePx}
					onChange={(event) => applySize(Number(event.target.value))}
				/>
				<input
					type="number"
					min={MIN_KANA_SIZE_PX}
					max={MAX_KANA_SIZE_PX}
					value={sizePx}
					onChange={(event) => applySize(Number(event.target.value))}
					className="w-16 rounded border px-1"
				/>
				px
				<span
					className="font-kana"
					style={{ fontSize: 'var(--kana-size)' }}
				>
					あいう
				</span>
			</label>
		</Placeholder>
	);
}
