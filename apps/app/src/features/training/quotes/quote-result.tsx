import type { Locale } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '@/components/external-link.tsx';
import { Button } from '@/components/ui/button.tsx';
import { translationReportUrl } from '@/lib/translation-report.ts';
import type { QuoteEntry } from '@/vocab/quotes.ts';

interface QuoteResultProps {
	readonly quote: QuoteEntry;
	readonly locale: Locale;
	readonly isFinished: boolean;
	readonly onNext: () => void;
	readonly onReplay: () => void;
}

function Shortcut({ children }: { readonly children: string }) {
	return (
		<kbd className="ml-2 hidden rounded border px-1 font-mono text-xs md:inline">
			{children}
		</kbd>
	);
}

/** The original, its meaning and its source, once the quote is typed. */
export function QuoteResult({
	quote,
	locale,
	isFinished,
	onNext,
	onReplay,
}: QuoteResultProps) {
	const { t: translate } = useTranslation();
	const translation = quote[locale];
	// Always there, so that nothing moves when the quote ends.
	return (
		<div className="flex min-h-40 flex-col gap-2" data-tour="result">
			{isFinished && (
				<>
					<p lang="ja" className="font-kana text-lg">
						{quote.text}
					</p>
					<p>{translation}</p>
					<p className="text-sm text-muted-foreground">
						{quote.authorLatin} ({quote.author}), {quote.work},{' '}
						{quote.year}
					</p>
					<p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
						<Button onClick={onNext}>
							{translate('training.quote.next')}
							<Shortcut>Enter</Shortcut>
						</Button>
						<Button variant="outline" onClick={onReplay}>
							{translate('training.quote.replay')}
							<Shortcut>Tab</Shortcut>
						</Button>
						<ExternalLink href={quote.source}>
							{translate('training.quote.source')}
						</ExternalLink>
						<ExternalLink
							href={translationReportUrl({
								kana: quote.text,
								translation,
							})}
						>
							{translate('training.quote.report')}
						</ExternalLink>
					</p>
				</>
			)}
		</div>
	);
}
