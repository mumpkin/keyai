import { THEMES, withTheme } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { ChoiceField } from './choice-field.tsx';
import { KanaSizeSetting } from './kana-size-setting.tsx';
import { SettingRow, SettingSection } from './setting-section.tsx';
import { useSettings } from './use-settings.ts';

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

export function DisplaySetting() {
	const { t: translate } = useTranslation();
	return (
		<SettingSection title={translate('settings.display.title')}>
			<ThemeSetting />
			<KanaSizeSetting />
		</SettingSection>
	);
}
