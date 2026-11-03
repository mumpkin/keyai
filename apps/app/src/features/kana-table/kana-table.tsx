import type { Script } from '@keyai/core/kana';
import { useState } from 'react';
import { Placeholder } from '@/features/blocking/placeholder';
import { HIRAGANA_SLOTS } from '@/features/blocking/sample-kana';
import { KanaCell } from './kana-cell';

const SCRIPT_LABELS: Record<Script, string> = {
	hiragana: 'Hiragana',
	katakana: 'Katakana',
};

function ScriptTabs({
	script,
	onChange,
}: {
	readonly script: Script;
	readonly onChange: (script: Script) => void;
}) {
	return (
		<div className="flex gap-1">
			{(Object.keys(SCRIPT_LABELS) as Script[]).map((tab) => (
				<button
					key={tab}
					type="button"
					onClick={() => onChange(tab)}
					className={
						tab === script
							? 'rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground'
							: 'rounded-md px-3 py-1 text-sm text-muted-foreground'
					}
				>
					{SCRIPT_LABELS[tab]}
				</button>
			))}
		</div>
	);
}

export function KanaTable() {
	const [script, setScript] = useState<Script>('hiragana');

	return (
		<Placeholder label="kana table" className="flex flex-col gap-3">
			<ScriptTabs script={script} onChange={setScript} />
			<div className="flex flex-wrap gap-6">
				<div className="grid max-w-full grid-flow-col grid-rows-5 gap-1 overflow-x-auto pb-1">
					{HIRAGANA_SLOTS.map((slot) => (
						<KanaCell key={slot.id} cell={slot.kana} />
					))}
				</div>
				<Placeholder label="voiced" className="h-32 w-40" />
				<Placeholder label="combinations" className="h-32 w-40" />
				<Placeholder label="っ ー extended" className="h-32 w-28" />
			</div>
		</Placeholder>
	);
}
