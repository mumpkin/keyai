import { Placeholder } from '@/features/blocking/placeholder';
import type { SampleWord } from '@/features/blocking/sample-words';

interface WordCardProps {
	readonly word: SampleWord;
}

function OtherSenses({ senses }: { readonly senses: readonly string[] }) {
	return (
		<div className="mt-2 border-t pt-2">
			<p className="text-xs text-muted-foreground">Autres sens</p>
			<ul className="text-sm">
				{senses.map((sense) => (
					<li key={sense}>· {sense}</li>
				))}
			</ul>
		</div>
	);
}

export function WordCard({ word }: WordCardProps) {
	return (
		<Placeholder
			label="word card"
			className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 hidden w-64 -translate-x-1/2 bg-popover text-left group-hover:block group-focus-visible:block"
		>
			<p className="flex items-baseline gap-2">
				<span className="font-kana text-3xl">{word.kana}</span>
				{word.kanji && (
					<span className="font-kana text-xl text-muted-foreground">
						{word.kanji}
					</span>
				)}
			</p>
			<p className="font-mono text-sm text-muted-foreground">
				{word.romaji}
			</p>
			<p className="mt-2 font-medium">{word.gloss}</p>
			<p className="text-xs text-muted-foreground">
				nature · registre · note
			</p>
			{word.otherSenses && <OtherSenses senses={word.otherSenses} />}
		</Placeholder>
	);
}
