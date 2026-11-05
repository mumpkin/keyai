import {
	WORDS_PER_SESSION_LIMITS,
	withNaturalWriting,
	withWordSpaces,
	withWordsPerSession,
} from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import {
	SettingRow,
	SettingSection,
} from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';

export function SessionSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.session.wordsPerSeries');
	const naturalLabel = translate('settings.session.naturalWriting');
	const spacesLabel = translate('settings.session.keepWordSpaces');
	return (
		<SettingSection title={translate('settings.session.title')}>
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
		</SettingSection>
	);
}
