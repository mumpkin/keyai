import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';

interface LastWordZoneProps {
	readonly word: SampleWord | undefined;
}

export function LastWordZone({ word }: LastWordZoneProps) {
	return (
		<Placeholder
			label="last word"
			className="flex min-h-16 items-center gap-4"
		>
			{word && (
				<>
					<span className="font-kana text-3xl">{word.kana}</span>
					<span className="flex flex-col">
						<span className="font-mono text-sm text-muted-foreground">
							{word.romaji}
						</span>
						<span className="font-medium">{word.gloss}</span>
					</span>
					<span className="ml-auto text-xs text-muted-foreground">
						kanji · nature · note (aperçu de la fiche)
					</span>
				</>
			)}
		</Placeholder>
	);
}
