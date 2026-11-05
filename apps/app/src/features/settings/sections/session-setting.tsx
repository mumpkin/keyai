import {
	WORDS_PER_SESSION_LIMITS,
	withWordsPerSession,
} from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import {
	SettingRow,
	SettingSection,
} from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';

export function SessionSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.session.wordsPerSeries');
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
		</SettingSection>
	);
}
