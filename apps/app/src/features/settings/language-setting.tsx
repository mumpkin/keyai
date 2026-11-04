import { type Locale, withLocale } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { ChoiceField } from './choice-field.tsx';
import { SettingRow, SettingSection } from './setting-section.tsx';
import { useSettings } from './use-settings.ts';

/** Each language is named in itself, whatever the current language is. */
const LANGUAGES: readonly { value: Locale; label: string }[] = [
	{ value: 'fr', label: 'Français' },
	{ value: 'en', label: 'English' },
];

export function LanguageSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.language.label');
	return (
		<SettingSection title={translate('settings.language.title')}>
			<SettingRow label={label}>
				<ChoiceField
					label={label}
					value={settings.locale}
					options={LANGUAGES}
					onChange={(locale) =>
						updateSettings((current) => withLocale(current, locale))
					}
				/>
			</SettingRow>
		</SettingSection>
	);
}
