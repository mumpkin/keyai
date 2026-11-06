import { useTranslation } from 'react-i18next';
import { DataSetting } from '@/features/settings/data/data-setting.tsx';
import { SettingSection } from '@/features/settings/fields/setting-section.tsx';
import { AboutSection } from '@/features/settings/sections/about-section.tsx';
import { DisplaySetting } from '@/features/settings/sections/display-setting.tsx';
import { FeedbackSetting } from '@/features/settings/sections/feedback-setting.tsx';
import { LanguageSetting } from '@/features/settings/sections/language-setting.tsx';
import { QuoteSetting } from '@/features/settings/sections/quote-setting.tsx';
import { SessionSetting } from '@/features/settings/sections/session-setting.tsx';
import { SpeedSetting } from '@/features/settings/sections/speed-setting.tsx';

interface SettingsScreenProps {
	readonly onReplaySplash: () => void;
}

export function SettingsScreen({ onReplaySplash }: SettingsScreenProps) {
	const { t: translate } = useTranslation();
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
			<SettingSection title={translate('settings.general')}>
				<LanguageSetting />
				<DisplaySetting />
			</SettingSection>
			<SettingSection title={translate('settings.training')}>
				<SessionSetting />
				<SpeedSetting />
				<FeedbackSetting />
			</SettingSection>
			<QuoteSetting />
			<DataSetting />
			<AboutSection onReplaySplash={onReplaySplash} />
		</div>
	);
}
