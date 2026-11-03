import { useState } from 'react';
import { Placeholder } from '@/features/blocking/placeholder';
import { SAMPLE_WORDS } from '@/features/blocking/sample-words';
import { KanaTable } from '@/features/kana-table/kana-table';
import { MobileKanaSheet } from '@/features/kana-table/mobile-kana-sheet';
import { SessionSummaryLine } from './session-summary-line';
import type { TranslationLayout } from './translation-layout';
import { TranslationLayoutSwitch } from './translation-layout-switch';
import { UnlockBanner } from './unlock-banner';
import { WordLine } from './word-line';

export function TrainingScreen() {
	const [layout, setLayout] = useState<TranslationLayout>('lastWord');

	return (
		<div className="flex flex-1 flex-col gap-4">
			<TranslationLayoutSwitch layout={layout} onChange={setLayout} />
			<SessionSummaryLine />
			<UnlockBanner />
			<div className="flex flex-1 flex-col justify-center gap-4 py-8">
				<WordLine words={SAMPLE_WORDS} layout={layout} />
				<Placeholder
					label="japanese input warning"
					className="text-sm text-muted-foreground"
				>
					⚠ Saisie japonaise active : désactivez-la pour taper en
					romaji (affiché seulement si détectée)
				</Placeholder>
			</div>
			<div className="hidden md:block">
				<KanaTable />
			</div>
			<MobileKanaSheet />
		</div>
	);
}
