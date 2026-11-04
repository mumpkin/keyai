import type { Locale } from '@keyai/core/settings';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';

/** Both languages are bundled: they are small and the app works offline. */
export async function initTranslations(locale: Locale): Promise<void> {
	await i18next.use(initReactI18next).init({
		lng: locale,
		fallbackLng: 'fr',
		resources: { fr: { translation: fr }, en: { translation: en } },
		interpolation: { escapeValue: false },
	});
}

export function applyLocale(locale: Locale): void {
	void i18next.changeLanguage(locale);
	document.documentElement.lang = locale;
}
