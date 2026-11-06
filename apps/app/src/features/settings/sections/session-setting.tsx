import {
	WORD_SCRIPTS,
	WORDS_PER_SESSION_LIMITS,
	withNaturalWriting,
	withWordScript,
	withWordSpaces,
	withWordsPerSession,
} from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { ChoiceField } from '@/features/settings/fields/choice-field.tsx';
import {
	SettingGroup,
	SettingRow,
} from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';

function WordScriptSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const scriptLabel = translate('settings.session.wordScript');
	return (
		<SettingRow label={scriptLabel}>
			<ChoiceField
				label={scriptLabel}
				value={settings.wordScript}
				options={WORD_SCRIPTS.map((script) => ({
					value: script,
					label: translate(`settings.session.${script}`),
				}))}
				onChange={(script) =>
					updateSettings((current) => withWordScript(current, script))
				}
			/>
		</SettingRow>
	);
}

export function SessionSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.session.wordsPerSeries');
	const naturalLabel = translate('settings.session.naturalWriting');
	const spacesLabel = translate('settings.session.keepWordSpaces');
	return (
		<SettingGroup tourZone="session">
			<SettingRow label={label}>
				<NumberField
					label={label}
					value={settings.wordsPerSession}
					limits={WORDS_PER_SESSION_LIMITS}
					onCommit={(wordsPerSession) =>
						updateSettings((current) =>
							withWordsPerSession(current, wordsPerSession),
						)
					}
				/>
			</SettingRow>
			<WordScriptSetting />
			<SettingRow label={naturalLabel}>
				<Switch
					aria-label={naturalLabel}
					checked={settings.naturalWriting}
					onCheckedChange={(naturalWriting) =>
						updateSettings((current) =>
							withNaturalWriting(current, naturalWriting),
						)
					}
				/>
			</SettingRow>
			<SettingRow label={spacesLabel}>
				<Switch
					aria-label={spacesLabel}
					checked={settings.keepsWordSpaces}
					disabled={!settings.naturalWriting}
					onCheckedChange={(keepsWordSpaces) =>
						updateSettings((current) =>
							withWordSpaces(current, keepsWordSpaces),
						)
					}
				/>
			</SettingRow>
		</SettingGroup>
	);
}
