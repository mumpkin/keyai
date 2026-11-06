import { type Locale, withLocale } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { ChoiceField } from '@/features/settings/fields/choice-field.tsx';
import { SettingRow } from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';

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
	);
}
