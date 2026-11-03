import { Placeholder } from '@/features/blocking/placeholder';
import { KanaSizeSetting } from './kana-size-setting';

interface SettingRow {
	readonly section: string;
	readonly control: string;
}

const SETTING_ROWS: readonly SettingRow[] = [
	{ section: 'Langue', control: 'select · Français / English' },
	{ section: 'Séance', control: 'number · mots par série (20)' },
	{
		section: 'Vitesse',
		control: 'segmented · Facile / Normal / Difficile / Perso + number',
	},
	{ section: 'Retours', control: 'switch · son d’erreur' },
	{
		section: 'Données',
		control: 'buttons · Exporter / Importer / Réinitialiser',
	},
];

interface SettingsScreenProps {
	readonly onReplaySplash: () => void;
}

export function SettingsScreen({ onReplaySplash }: SettingsScreenProps) {
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
			{SETTING_ROWS.map(({ section, control }) => (
				<Placeholder key={section} label={section}>
					<p className="font-medium">{section}</p>
					<p className="text-sm text-muted-foreground">{control}</p>
				</Placeholder>
			))}
			<KanaSizeSetting />
			<Placeholder label="about">
				<p className="font-medium">À propos</p>
				<p className="text-sm text-muted-foreground">
					version · crédits JMdict / wordfreq · licences
				</p>
				<button
					type="button"
					onClick={onReplaySplash}
					className="mt-2 text-sm text-primary underline"
				>
					(blocking) Rejouer l’animation de lancement
				</button>
			</Placeholder>
		</div>
	);
}
