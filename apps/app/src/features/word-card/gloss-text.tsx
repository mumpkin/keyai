import type { LocalisedText } from './glosses.ts';

export function GlossText({ gloss }: { readonly gloss: LocalisedText }) {
	return (
		<span>
			{gloss.text}
			{gloss.isFallback && (
				<span className="ml-1 rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground">
					EN
				</span>
			)}
		</span>
	);
}
