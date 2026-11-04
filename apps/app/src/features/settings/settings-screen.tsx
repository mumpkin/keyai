import { AboutSection } from './about-section.tsx';
import { DataSetting } from './data-setting.tsx';
import { DisplaySetting } from './display-setting.tsx';
import { FeedbackSetting } from './feedback-setting.tsx';
import { LanguageSetting } from './language-setting.tsx';
import { SessionSetting } from './session-setting.tsx';
import { SpeedSetting } from './speed-setting.tsx';

interface SettingsScreenProps {
	readonly onReplaySplash: () => void;
}

export function SettingsScreen({ onReplaySplash }: SettingsScreenProps) {
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
			<LanguageSetting />
			<SessionSetting />
			<SpeedSetting />
			<FeedbackSetting />
			<DisplaySetting />
			<DataSetting />
			<AboutSection onReplaySplash={onReplaySplash} />
		</div>
	);
}
