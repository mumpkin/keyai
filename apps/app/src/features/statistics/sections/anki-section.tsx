import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { ankiFileNameOf, ankiFileOf } from '@/features/anki/anki-file.ts';
import { ConfirmDialog } from '@/features/settings/fields/confirm-dialog.tsx';
import { TEXT_EXPORT } from '@/platform/types.ts';
import {
	useExportFile,
	useProgress,
	useVocabulary,
} from '@/stores/app-context.tsx';
import { WordRow } from './series-words-lists.tsx';
import { EmptyNote, StatisticsSection } from './statistics-section.tsx';

function useAnkiEntries() {
	const ids = useProgress((state) => state.save.ankiWords);
	const { entriesById } = useVocabulary();
	return ids.flatMap((id) => entriesById.get(id) ?? []);
}

function ClearAnkiList() {
	const { t: translate } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const updateAnkiWords = useProgress((state) => state.updateAnkiWords);
	return (
		<>
			<Button variant="outline" onClick={() => setIsOpen(true)}>
				{translate('statistics.anki.clear')}
			</Button>
			<ConfirmDialog
				isOpen={isOpen}
				title={translate('statistics.anki.clearTitle')}
				description={translate('statistics.anki.clearDescription')}
				confirmLabel={translate('statistics.anki.clear')}
				cancelLabel={translate('settings.data.cancel')}
				onConfirm={() => updateAnkiWords(() => [])}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}

function useAnkiExport() {
	const { t: translate } = useTranslation();
	const locale = useProgress((state) => state.save.settings.locale);
	const exportFile = useExportFile();
	const entries = useAnkiEntries();

	return () =>
		exportFile(
			ankiFileNameOf(new Date()),
			ankiFileOf(entries, {
				locale,
				otherSenses: translate('wordCard.otherSenses'),
				partOfSpeechOf: (pos) => translate(`partOfSpeech.${pos}`),
				registerOf: (register) => translate(`register.${register}`),
			}),
			TEXT_EXPORT,
		);
}

function ExportAnkiList() {
	const { t: translate } = useTranslation();
	const [message, setMessage] = useState('');
	const exportList = useAnkiExport();

	async function exportAndSay() {
		try {
			const isExported = await exportList();
			setMessage(isExported ? translate('statistics.anki.done') : '');
		} catch {
			setMessage(translate('statistics.anki.failed'));
		}
	}

	return (
		<>
			<Button onClick={() => void exportAndSay()}>
				{translate('statistics.anki.export')}
			</Button>
			<ClearAnkiList />
			<p role="status" className="min-h-5 text-sm text-muted-foreground">
				{message}
			</p>
		</>
	);
}

/** The words set aside from their card, to study them in Anki (C8). */
export function AnkiSection() {
	const { t: translate } = useTranslation();
	const entries = useAnkiEntries();
	return (
		<StatisticsSection
			title={translate('statistics.anki.title')}
			tourZone="anki"
		>
			{entries.length > 0 ? (
				<>
					<ul className="max-h-60 scroll-y">
						{entries.map((entry) => (
							<WordRow key={entry.word.id} entry={entry} />
						))}
					</ul>
					<div className="flex flex-wrap items-center gap-2">
						<ExportAnkiList />
					</div>
				</>
			) : (
				<EmptyNote>{translate('statistics.anki.empty')}</EmptyNote>
			)}
		</StatisticsSection>
	);
}
