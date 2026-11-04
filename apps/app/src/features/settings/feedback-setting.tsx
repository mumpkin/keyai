import { withErrorSound } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch.tsx';
import { SettingRow, SettingSection } from './setting-section.tsx';
import { useSettings } from './use-settings.ts';

export function FeedbackSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.feedback.errorSound');
	return (
		<SettingSection title={translate('settings.feedback.title')}>
			<SettingRow label={label}>
				<Switch
					aria-label={label}
					checked={settings.feedback.sound}
					onCheckedChange={(sound) =>
						updateSettings((current) =>
							withErrorSound(current, sound),
						)
					}
				/>
			</SettingRow>
		</SettingSection>
	);
}
