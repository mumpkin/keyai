import { toHepburn, tokenize } from '@keyai/core/input';
import type { Locale } from '@keyai/core/settings';
import type { Sense, VocabEntry } from '@keyai/core/vocab';
import type { ReactNode } from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover.tsx';
import { GlossText } from './gloss-text.tsx';
import {
	glossOf,
	noteOf,
	PART_OF_SPEECH_LABELS,
	REGISTER_LABELS,
} from './glosses.ts';
import { useTypingFocus } from './typing-focus.tsx';

const HOVER_DELAY_MS = 150;

interface WordCardProps {
	readonly entry: VocabEntry;
	readonly locale: Locale;
}

function SenseDetails({
	sense,
	locale,
}: {
	readonly sense: Sense;
	readonly locale: Locale;
}) {
	const labels = [
		...sense.pos.map((pos) => PART_OF_SPEECH_LABELS[pos]),
		...(sense.register ? [REGISTER_LABELS[sense.register]] : []),
	];
	const note = noteOf(sense, locale);
	return (
		<>
			<p className="text-xs text-muted-foreground">
				{labels.join(' · ')}
			</p>
			{note && <p className="mt-1 text-xs italic">{note}</p>}
		</>
	);
}

function OtherSenses({
	senses,
	locale,
}: {
	readonly senses: readonly Sense[];
	readonly locale: Locale;
}) {
	return (
		<div className="mt-2 border-t pt-2">
			<p className="text-xs text-muted-foreground">Autres sens</p>
			<ul className="text-sm">
				{senses.map((sense) => (
					<li key={`${sense.kanji ?? ''}-${sense.gloss.en}`}>
						· <GlossText gloss={glossOf(sense, locale)} />
						{sense.kanji && (
							<span className="ml-1 font-kana text-muted-foreground">
								{sense.kanji}
							</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

function WordCardContent({ entry, locale }: WordCardProps) {
	const [primary, ...others] = entry.word.senses;
	if (!primary) {
		return null;
	}
	return (
		<>
			<p className="flex items-baseline gap-2">
				<span className="font-kana text-3xl">{entry.word.kana}</span>
				{primary.kanji && (
					<span className="font-kana text-xl text-muted-foreground">
						{primary.kanji}
					</span>
				)}
			</p>
			<p className="font-mono text-sm text-muted-foreground">
				{toHepburn(tokenize(entry.word.kana))}
			</p>
			<p className="font-medium">
				<GlossText gloss={glossOf(primary, locale)} />
			</p>
			<SenseDetails sense={primary} locale={locale} />
			{others.length > 0 && (
				<OtherSenses senses={others} locale={locale} />
			)}
		</>
	);
}

/**
 * Word card on hover, keyboard focus or touch (A3, C8), rendered in a
 * portal so that the word line and the recap never clip it. Focus goes
 * back to the typing input when it closes.
 */
export function WordCard({
	entry,
	locale,
	children,
}: WordCardProps & { readonly children: ReactNode }) {
	const typingInput = useTypingFocus();
	return (
		<Popover>
			<PopoverTrigger
				openOnHover
				delay={HOVER_DELAY_MS}
				className="w-full cursor-help text-left"
			>
				{children}
			</PopoverTrigger>
			<PopoverContent finalFocus={typingInput ?? true}>
				<WordCardContent entry={entry} locale={locale} />
			</PopoverContent>
		</Popover>
	);
}
