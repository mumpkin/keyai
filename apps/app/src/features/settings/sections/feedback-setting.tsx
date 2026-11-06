import { withErrorSound } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch.tsx';
import { SettingRow } from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';

export function FeedbackSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.feedback.errorSound');
	return (
		<SettingRow label={label}>
			<Switch
				aria-label={label}
				checked={settings.feedback.sound}
				onCheckedChange={(sound) =>
					updateSettings((current) => withErrorSound(current, sound))
				}
			/>
		</SettingRow>
	);
}
