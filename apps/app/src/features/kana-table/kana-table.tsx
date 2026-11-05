import type { Script } from '@keyai/core/kana';
import { type KeyboardEvent, useId, useState } from 'react';
import { cn } from '@/lib/utils.ts';
import { useProgress, useVocabulary } from '@/stores/app-context.tsx';
import { KanaCell } from './kana-cell.tsx';
import { type KanaSlot, kanaLayoutOf } from './kana-layout.ts';
import { type KanaStates, kanaStatesOf } from './kana-states.ts';
import { UnlockHint } from './unlock-hint.tsx';

const SCRIPT_LABELS: Record<Script, string> = {
	hiragana: 'Hiragana',
	katakana: 'Katakana',
};

const SCRIPTS = Object.keys(SCRIPT_LABELS) as Script[];

function ScriptTabs({
	script,
	panelId,
	onChange,
}: {
	readonly script: Script;
	readonly panelId: string;
	readonly onChange: (script: Script) => void;
}) {
	function moveWithArrows(event: KeyboardEvent<HTMLDivElement>) {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			const other = SCRIPTS.find((tab) => tab !== script) ?? script;
			onChange(other);
			event.currentTarget
				.querySelector<HTMLElement>(`[data-script="${other}"]`)
				?.focus();
		}
	}

	return (
		<div className="flex gap-1" role="tablist" onKeyDown={moveWithArrows}>
			{SCRIPTS.map((tab) => (
				<button
					key={tab}
					type="button"
					role="tab"
					data-script={tab}
					aria-selected={tab === script}
					aria-controls={panelId}
					tabIndex={tab === script ? 0 : -1}
					onClick={() => onChange(tab)}
					className={cn(
						'rounded-md px-3 py-1 text-sm',
						tab === script
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground',
					)}
				>
					{SCRIPT_LABELS[tab]}
				</button>
			))}
		</div>
	);
}

function SlotGrid({
	slots,
	states,
	className,
}: {
	readonly slots: readonly KanaSlot[];
	readonly states: KanaStates;
	readonly className: string;
}) {
	return (
		<div className={cn('grid gap-1', className)}>
			{slots.map((slot) => (
				<KanaCell
					key={slot.id}
					kana={slot.kana}
					state={slot.kana ? states.stateOf(slot.kana) : 'locked'}
					score={slot.kana ? states.scoreOf(slot.kana) : 0}
				/>
			))}
		</div>
	);
}

function useKanaStates(): KanaStates {
	const progress = useProgress((state) => state.save.progress);
	const threshold = useProgress(
		(state) => state.save.settings.speed.kanaPerMinute,
	);
	const { unlockOrder, initialUnlocked } = useVocabulary().file;
	return kanaStatesOf({
		progress,
		unlockOrder,
		initialUnlocked,
		thresholdKanaPerMinute: threshold,
	});
}

/** Reference table at the bottom of the screen, one script at a time (C2). */
export function KanaTable() {
	const [script, setScript] = useState<Script>('hiragana');
	const panelId = useId();
	const states = useKanaStates();
	const layout = kanaLayoutOf(script);
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-4">
				<ScriptTabs
					script={script}
					panelId={panelId}
					onChange={setScript}
				/>
				<UnlockHint />
			</div>
			<div
				id={panelId}
				role="tabpanel"
				aria-label={SCRIPT_LABELS[script]}
				className="flex [scrollbar-width:thin] items-start gap-6 overflow-x-auto pt-2 pb-3"
			>
				<SlotGrid
					slots={layout.base}
					states={states}
					className="grid-flow-col grid-rows-5"
				/>
				<SlotGrid
					slots={layout.voiced}
					states={states}
					className="grid-flow-col grid-rows-5"
				/>
				<SlotGrid
					slots={layout.combinations}
					states={states}
					className="h-fit grid-cols-3"
				/>
				<SlotGrid
					slots={layout.others}
					states={states}
					className="h-fit grid-cols-2"
				/>
			</div>
		</div>
	);
}
