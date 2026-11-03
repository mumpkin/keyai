import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';

interface WordCardProps {
	readonly word: SampleWord;
}

export function WordCard({ word }: WordCardProps) {
	return (
		<Placeholder
			label="word card"
			className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 hidden w-64 -translate-x-1/2 bg-popover text-left group-hover:block group-focus-visible:block"
		>
			<p className="font-kana text-3xl">{word.kana}</p>
			<p className="text-sm text-muted-foreground">{word.romaji}</p>
			<p className="mt-2 font-medium">{word.gloss}</p>
			<p className="text-xs text-muted-foreground">
				kanji · nature · registre · note · autres sens
			</p>
		</Placeholder>
	);
}
