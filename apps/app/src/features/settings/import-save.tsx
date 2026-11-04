import {
	importPreviewOf,
	parseSave,
	type SaveError,
	type SaveFile,
} from '@keyai/core/save';
import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.tsx';
import { useProgress } from '@/stores/app-context.tsx';
import { useUiStore } from '@/stores/ui-store.ts';
import { ConfirmDialog } from './confirm-dialog.tsx';
import type { DataMessage } from './data-message.tsx';

function ImportPreviewText({ save }: { readonly save: SaveFile }) {
	const { t: translate } = useTranslation();
	const locale = useProgress((state) => state.save.settings.locale);
	const preview = importPreviewOf(save);
	const date = new Intl.DateTimeFormat(locale, {
		dateStyle: 'long',
		timeStyle: 'short',
	}).format(new Date(preview.savedAt));
	return (
		<>
			<ul className="mb-2">
				<li>{translate('settings.data.importDate', { date })}</li>
				<li>
					{translate('settings.data.importUnlocked', {
						count: preview.unlockedCount,
					})}
				</li>
				<li>
					{translate('settings.data.importSeries', {
						count: preview.sessionCount,
					})}
				</li>
			</ul>
			<p>{translate('settings.data.importWarning')}</p>
		</>
	);
}

function useSaveImport(onError: (error: SaveError | null) => void) {
	const [candidate, setCandidate] = useState<SaveFile | null>(null);
	const replaceSave = useProgress((state) => state.replaceSave);
	const clearSeriesResult = useUiStore((state) => state.clearSeriesResult);

	async function readFile(event: ChangeEvent<HTMLInputElement>) {
		const input = event.target;
		const file = input.files?.[0];
		if (!file) {
			return;
		}
		const parsed = parseSave(await file.text());
		input.value = '';
		onError(parsed.ok ? null : parsed.error);
		setCandidate(parsed.ok ? parsed.save : null);
	}

	function confirm() {
		if (candidate) {
			replaceSave(candidate);
			clearSeriesResult();
		}
		setCandidate(null);
	}

	return {
		candidate,
		readFile,
		confirm,
		cancel: () => setCandidate(null),
	};
}

export function ImportSave({
	onMessage,
}: {
	readonly onMessage: (message: DataMessage | null) => void;
}) {
	const { t: translate } = useTranslation();
	const fileInput = useRef<HTMLInputElement>(null);
	const { candidate, readFile, confirm, cancel } = useSaveImport((error) =>
		onMessage(
			error && {
				text: translate(`settings.data.importErrors.${error}`),
				isError: true,
			},
		),
	);

	return (
		<>
			<Button
				variant="outline"
				onClick={() => fileInput.current?.click()}
			>
				{translate('settings.data.import')}
			</Button>
			<input
				ref={fileInput}
				type="file"
				accept=".json,application/json"
				aria-label={translate('settings.data.import')}
				onChange={(event) => void readFile(event)}
				className="hidden"
			/>
			<ConfirmDialog
				isOpen={candidate !== null}
				title={translate('settings.data.importTitle')}
				description={
					candidate && <ImportPreviewText save={candidate} />
				}
				confirmLabel={translate('settings.data.importConfirm')}
				cancelLabel={translate('settings.data.cancel')}
				onConfirm={confirm}
				onClose={cancel}
			/>
		</>
	);
}
