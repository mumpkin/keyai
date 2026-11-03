import { Placeholder } from '@/features/blocking/placeholder';
import { SAMPLE_WORDS } from '@/features/blocking/sample-words';
import { KanaTable } from '@/features/kana-table/kana-table';
import { MobileKanaSheet } from '@/features/kana-table/mobile-kana-sheet';
import { SessionStatsBar } from './session-stats-bar';
import { WordLine } from './word-line';

export function TrainingScreen() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<SessionStatsBar />
			<div className="flex flex-1 flex-col justify-center gap-4 py-6">
				<WordLine words={SAMPLE_WORDS} />
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
