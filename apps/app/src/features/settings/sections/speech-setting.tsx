import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/confirm-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { SettingSection } from '@/features/settings/fields/setting-section.tsx';
import {
	hasModel,
	MODEL_MEGABYTES,
	useSpeechStore,
} from '@/features/speech/speech-store.ts';

const PERCENT = 100;

function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function DeleteModel() {
	const { t: translate } = useTranslation();
	const [isConfirming, setIsConfirming] = useState(false);
	const deleteModel = useSpeechStore((state) => state.deleteModel);
	return (
		<>
			<Button variant="destructive" onClick={() => setIsConfirming(true)}>
				{translate('settings.speech.delete')}
			</Button>
			<ConfirmDialog
				isOpen={isConfirming}
				title={translate('settings.speech.deleteTitle')}
				description={translate('settings.speech.deleteDescription', {
					megabytes: MODEL_MEGABYTES,
				})}
				confirmLabel={translate('settings.speech.deleteConfirm')}
				cancelLabel={translate('settings.data.cancel')}
				onConfirm={() => {
					setIsConfirming(false);
					void deleteModel();
				}}
				onClose={() => setIsConfirming(false)}
			/>
		</>
	);
}

function ModelRow() {
	const { t: translate } = useTranslation();
	const status = useSpeechStore((state) => state.status);
	const loadModel = useSpeechStore((state) => state.loadModel);
	const download = (
		<Button onClick={() => void loadModel()}>
			{translate('settings.speech.download', {
				megabytes: MODEL_MEGABYTES,
			})}
		</Button>
	);
	switch (status.kind) {
		case 'absent':
			return (
				<div className="flex flex-wrap items-center gap-3 text-sm">
					<span>{translate('settings.speech.absent')}</span>
					{download}
				</div>
			);
		case 'loading':
			if (status.fromCache) {
				return (
					<p className="text-sm">
						{translate('settings.speech.downloaded')}
					</p>
				);
			}
			return (
				<p className="text-sm" role="status">
					{translate('settings.speech.loading', {
						percent: Math.floor(status.fraction * PERCENT),
					})}
				</p>
			);
		case 'downloaded':
		case 'ready':
			return (
				<div className="flex flex-wrap items-center gap-3 text-sm">
					<span>{translate('settings.speech.downloaded')}</span>
					<DeleteModel />
				</div>
			);
		case 'failed':
			return (
				<div className="flex flex-wrap items-center gap-3 text-sm">
					<span className="text-destructive" role="alert">
						{translate('settings.speech.failed', {
							message: status.message,
						})}
					</span>
					{download}
				</div>
			);
		default:
			return null;
	}
}

type TestState =
	| { readonly kind: 'idle' }
	| { readonly kind: 'preparing' }
	| { readonly kind: 'listening' }
	| { readonly kind: 'hearing' }
	| { readonly kind: 'heard'; readonly text: string }
	| { readonly kind: 'failed'; readonly message: string };

function testMessage(
	state: TestState,
	translate: ReturnType<typeof useTranslation>['t'],
): string {
	switch (state.kind) {
		case 'preparing':
			return translate('settings.speech.testPreparing');
		case 'listening':
			return translate('settings.speech.testListening');
		case 'hearing':
			return translate('settings.speech.testHearing');
		case 'heard':
			return state.text
				? translate('settings.speech.testHeard', { text: state.text })
				: translate('settings.speech.testNothing');
		case 'failed':
			return translate('settings.speech.microphoneFailed', {
				message: state.message,
			});
		default:
			return '';
	}
}

/** Says what the recognizer hears, without any expected word. */
function MicrophoneTest() {
	const { t: translate } = useTranslation();
	const engine = useSpeechStore((store) => store.engine);
	const loadModel = useSpeechStore((store) => store.loadModel);
	const [state, setState] = useState<TestState>({ kind: 'idle' });
	const stopListening = useRef<(() => void) | null>(null);

	const stop = () => {
		stopListening.current?.();
		stopListening.current = null;
		setState({ kind: 'idle' });
	};
	useEffect(() => () => stopListening.current?.(), []);

	const start = async () => {
		setState({ kind: 'preparing' });
		try {
			await loadModel();
			await engine.prepare([]);
			stopListening.current = await engine.listen({
				onSpeechStarted: () => setState({ kind: 'hearing' }),
				onHeard: (text) => setState({ kind: 'heard', text }),
			});
			setState({ kind: 'listening' });
		} catch (error) {
			stopListening.current?.();
			stopListening.current = null;
			setState({ kind: 'failed', message: messageOf(error) });
		}
	};

	const running = state.kind !== 'idle' && state.kind !== 'failed';
	return (
		<div className="flex flex-wrap items-center gap-3 text-sm">
			<Button
				variant="outline"
				onClick={running ? stop : () => void start()}
			>
				{translate(
					running
						? 'settings.speech.testStop'
						: 'settings.speech.test',
				)}
			</Button>
			<span
				aria-live="polite"
				lang={state.kind === 'heard' ? 'ja' : undefined}
			>
				{testMessage(state, translate)}
			</span>
		</div>
	);
}

export function SpeechSetting() {
	const { t: translate } = useTranslation();
	const status = useSpeechStore((state) => state.status);
	const checkModel = useSpeechStore((state) => state.checkModel);
	useEffect(() => {
		void checkModel();
	}, [checkModel]);
	return (
		<SettingSection title={translate('settings.speech.title')}>
			<p className="text-sm text-muted-foreground">
				{translate('settings.speech.description', {
					megabytes: MODEL_MEGABYTES,
				})}
			</p>
			<ModelRow />
			{hasModel(status) && <MicrophoneTest />}
		</SettingSection>
	);
}
