import { THEMES, withSupportButton, withTheme } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch.tsx';
import { ChoiceField } from '@/features/settings/fields/choice-field.tsx';
import { SettingRow } from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';
import { KanaSizeSetting } from './kana-size-setting.tsx';

const THEME_LABELS = {
	system: 'settings.display.themeSystem',
	dark: 'settings.display.themeDark',
	light: 'settings.display.themeLight',
} as const;

function ThemeSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.display.theme');
	return (
		<SettingRow label={label}>
			<ChoiceField
				label={label}
				value={settings.display.theme}
				options={THEMES.map((theme) => ({
					value: theme,
					label: translate(THEME_LABELS[theme]),
				}))}
				onChange={(theme) =>
					updateSettings((current) => withTheme(current, theme))
				}
			/>
		</SettingRow>
	);
}

function SupportButtonSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.display.supportButton');
	return (
		<SettingRow label={label}>
			<Switch
				aria-label={label}
				checked={settings.display.showsSupportButton}
				onCheckedChange={(isShown) =>
					updateSettings((current) =>
						withSupportButton(current, isShown),
					)
				}
			/>
		</SettingRow>
	);
}

export function DisplaySetting() {
	return (
		<>
			<ThemeSetting />
			<KanaSizeSetting />
			<SupportButtonSetting />
		</>
	);
}
