import type { Script } from '@keyai/core/kana';
import {
	KANA_TABLE_TABS,
	type KanaTableTab,
	withKanaTableTab,
} from '@keyai/core/settings';
import { type KeyboardEvent, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils.ts';
import { useProgress, useVocabulary } from '@/stores/app-context.tsx';
import { KanaCell } from './kana-cell.tsx';
import { type KanaSlot, kanaLayoutOf } from './kana-layout.ts';
import { type KanaStates, kanaStatesOf, recentKanaOf } from './kana-states.ts';
import { UnlockHint } from './unlock-hint.tsx';

const SCRIPT_LABELS: Record<Script, string> = {
	hiragana: 'Hiragana',
	katakana: 'Katakana',
};

const ARROW_STEPS: ReadonlyMap<string, number> = new Map([
	['ArrowLeft', -1],
	['ArrowRight', 1],
]);

/** The tab a step away, going round at both ends. */
function tabAfter(tab: KanaTableTab, step: number): KanaTableTab {
	const count = KANA_TABLE_TABS.length;
	const index = KANA_TABLE_TABS.indexOf(tab);
	return KANA_TABLE_TABS[(index + step + count) % count] ?? tab;
}

function useTabLabel() {
	const { t: translate } = useTranslation();
	return (tab: KanaTableTab) =>
		tab === 'mine' ? translate('kanaTable.mine') : SCRIPT_LABELS[tab];
}

function KanaTabs({
	current,
	panelId,
	onChange,
}: {
	readonly current: KanaTableTab;
	readonly panelId: string;
	readonly onChange: (tab: KanaTableTab) => void;
}) {
	const labelOf = useTabLabel();

	function moveWithArrows(event: KeyboardEvent<HTMLDivElement>) {
		const step = ARROW_STEPS.get(event.key);
		if (step !== undefined) {
			const next = tabAfter(current, step);
			onChange(next);
			event.currentTarget
				.querySelector<HTMLElement>(`[data-tab="${next}"]`)
				?.focus();
		}
	}

	return (
		<div
			className="flex gap-1"
			role="tablist"
			data-tour="tabs"
			onKeyDown={moveWithArrows}
		>
			{KANA_TABLE_TABS.map((tab) => (
				<button
					key={tab}
					type="button"
					role="tab"
					data-tab={tab}
					aria-selected={tab === current}
					aria-controls={panelId}
					tabIndex={tab === current ? 0 : -1}
					onClick={() => onChange(tab)}
					className={cn(
						'rounded-md px-3 py-1 text-sm',
						tab === current
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground',
					)}
				>
					{labelOf(tab)}
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

function ScriptChart({
	script,
	states,
}: {
	readonly script: Script;
	readonly states: KanaStates;
}) {
	const layout = kanaLayoutOf(script);
	return (
		<div className="flex items-start gap-6" data-tour="kana">
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
	);
}

/** Every unlocked kana whatever its script, so no choice has to be made. */
function RecentKana({ states }: { readonly states: KanaStates }) {
	const progress = useProgress((state) => state.save.progress);
	const { initialUnlocked } = useVocabulary().file;
	return (
		<div
			className="grid grid-cols-[repeat(auto-fill,2.75rem)] gap-1"
			data-tour="kana"
		>
			{recentKanaOf(progress, initialUnlocked).map((kana) => (
				<KanaCell
					key={kana}
					kana={kana}
					state={states.stateOf(kana)}
					score={states.scoreOf(kana)}
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

/** Reference table at the bottom of the screen (C2). */
export function KanaTable() {
	const tab = useProgress(
		(state) => state.save.settings.display.kanaTableTab,
	);
	const updateSettings = useProgress((state) => state.updateSettings);
	const labelOf = useTabLabel();
	const panelId = useId();
	const states = useKanaStates();
	return (
		<div className="flex flex-col gap-3" data-tour="table">
			<div className="flex items-center justify-between gap-4">
				<KanaTabs
					current={tab}
					panelId={panelId}
					onChange={(next) =>
						updateSettings((settings) =>
							withKanaTableTab(settings, next),
						)
					}
				/>
				<UnlockHint />
			</div>
			<div
				id={panelId}
				role="tabpanel"
				aria-label={labelOf(tab)}
				className={cn(
					'pt-2 pb-3',
					tab === 'mine'
						? 'min-h-136'
						: '[scrollbar-width:thin] overflow-x-auto',
				)}
			>
				{tab === 'mine' ? (
					<RecentKana states={states} />
				) : (
					<ScriptChart script={tab} states={states} />
				)}
			</div>
		</div>
	);
}
