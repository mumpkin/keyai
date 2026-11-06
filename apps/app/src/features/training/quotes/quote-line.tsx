import { type QuoteWord, quoteWordsOf } from '@keyai/core/quote';
import type { Locale } from '@keyai/core/settings';
import {
	type WordView as WordViewModel,
	wordViewsOf,
} from '@/features/training/series/series-view.ts';
import {
	isUnderCursor,
	KanaUnits,
	unitVariants,
} from '@/features/training/words/kana-units.tsx';
import { TypingLine } from '@/features/training/words/word-line.tsx';
import { WordView } from '@/features/training/words/word-view.tsx';
import { cn } from '@/lib/utils.ts';
import { useProgress, useVocabulary } from '@/stores/app-context.tsx';
import type { QuoteSeries } from '@/stores/series-types.ts';
import {
	type PieceView,
	pieceStateOf,
	pieceViewsOf,
	type QuoteGroup,
	quoteGroupsOf,
} from './quote-view.ts';

const KANA_LINE_SCALE = 1.6;
/** Furigana sit above the kanji, and always keep their room. */
const RUBY_LINE_SCALE = 2.4;

function Mark({
	text,
	isPassed,
}: {
	readonly text: string;
	readonly isPassed: boolean;
}) {
	return (
		<span
			lang="ja"
			className={cn(
				'font-kana',
				isPassed ? 'text-typed-foreground' : 'text-pending-foreground',
			)}
		>
			{text}
		</span>
	);
}

function KanjiPiece({
	view,
	showsReading,
}: {
	readonly view: PieceView;
	readonly showsReading: boolean;
}) {
	const state = pieceStateOf(view.units);
	return (
		<ruby
			className={unitVariants({ state })}
			data-cursor={isUnderCursor({ state }) || undefined}
		>
			{view.piece.text}
			<rt
				className={cn(
					'font-kana text-muted-foreground',
					!showsReading && 'invisible',
				)}
			>
				<KanaUnits units={view.units} />
			</rt>
		</ruby>
	);
}

function WordWriting({
	word,
	view,
	showsReading,
}: {
	readonly word: QuoteWord;
	readonly view: WordViewModel;
	readonly showsReading: boolean;
}) {
	return pieceViewsOf(word, view.units).map((piece) =>
		piece.piece.reading ? (
			<KanjiPiece
				key={piece.units[0]?.id}
				view={piece}
				showsReading={showsReading}
			/>
		) : (
			<KanaUnits key={piece.units[0]?.id} units={piece.units} />
		),
	);
}

interface QuoteGroupViewProps {
	readonly group: QuoteGroup;
	readonly word: QuoteWord;
	readonly view: WordViewModel;
	readonly locale: Locale;
	readonly errors: number;
}

function QuoteGroupView({
	group,
	word,
	view,
	locale,
	errors,
}: QuoteGroupViewProps) {
	const { display, hintAfterErrors } = useProgress(
		(progress) => progress.save.settings.quote,
	);
	const { entriesById } = useVocabulary();
	const isPassed = view.status === 'done' || view.status === 'skipped';
	const isHintDue =
		view.status === 'current' &&
		hintAfterErrors > 0 &&
		errors >= hintAfterErrors;
	return (
		<span className="inline-flex items-end">
			<Mark text={group.before} isPassed={isPassed} />
			<WordView
				word={view}
				entry={entriesById.get(word.cardId ?? '')}
				locale={locale}
				errorCount={errors}
				writing={
					display === 'kana' ? undefined : (
						<WordWriting
							word={word}
							view={view}
							showsReading={display === 'furigana' || isHintDue}
						/>
					)
				}
			/>
			<Mark text={group.after} isPassed={isPassed} />
		</span>
	);
}

interface QuoteLineProps {
	readonly series: QuoteSeries;
	readonly locale: Locale;
	readonly isJoined: boolean;
}

/** The quote being typed, in kana or in kanji with their readings. */
export function QuoteLine({ series, locale, isJoined }: QuoteLineProps) {
	const display = useProgress(
		(progress) => progress.save.settings.quote.display,
	);
	const { state, tokens } = series;
	const views = wordViewsOf(state);
	const words = quoteWordsOf(tokens);
	return (
		<TypingLine
			currentIndex={state.currentIndex}
			isJoined={isJoined}
			lineScale={display === 'kana' ? KANA_LINE_SCALE : RUBY_LINE_SCALE}
		>
			{quoteGroupsOf(tokens).map((group) => {
				const view = views[group.wordIndex];
				const word = words[group.wordIndex];
				return view && word ? (
					<QuoteGroupView
						key={group.wordIndex}
						group={group}
						word={word}
						view={view}
						locale={locale}
						errors={state.currentWordErrors}
					/>
				) : null;
			})}
		</TypingLine>
	);
}
