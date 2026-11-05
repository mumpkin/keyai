import { useTranslation } from 'react-i18next';
import { ExternalLink } from '@/components/external-link.tsx';
import { SettingSection } from '@/features/settings/fields/setting-section.tsx';
import { SupportLink } from '@/features/support/support-link.tsx';
import { translationReportUrl } from '@/lib/translation-report.ts';

const SOURCE_CODE_URL = 'https://github.com/mumpkin/keyai';
const JMDICT_URL =
	'https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project';
const EDRDG_LICENCE_URL = 'https://www.edrdg.org/edrdg/licence.html';
const WORDFREQ_URL = 'https://github.com/rspeer/wordfreq';
const AOZORA_URL = 'https://www.aozora.gr.jp/';

export function AboutSection({
	onReplaySplash,
}: {
	readonly onReplaySplash: () => void;
}) {
	const { t: translate } = useTranslation();
	return (
		<SettingSection title={translate('settings.about.title')}>
			<div className="flex flex-col gap-1 text-sm">
				<p>
					{translate('settings.about.version', {
						version: __APP_VERSION__,
					})}
				</p>
				<p>
					<ExternalLink href={SOURCE_CODE_URL}>
						{translate('settings.about.sourceCode')}
					</ExternalLink>
				</p>
				<p>{translate('settings.about.vocabulary')}</p>
				<ul className="list-inside list-disc">
					<li>
						<ExternalLink href={JMDICT_URL}>JMdict</ExternalLink>
						{' · '}
						<ExternalLink href={EDRDG_LICENCE_URL}>
							EDRDG
						</ExternalLink>
					</li>
					<li>
						<ExternalLink href={WORDFREQ_URL}>
							wordfreq
						</ExternalLink>
						{' · Robyn Speer'}
					</li>
					<li>
						<ExternalLink href={AOZORA_URL}>
							Aozora Bunko
						</ExternalLink>
						{` · ${translate('settings.about.quotes')}`}
					</li>
				</ul>
				<p>
					<ExternalLink href={translationReportUrl()}>
						{translate('settings.about.reportTranslation')}
					</ExternalLink>
				</p>
				<p className="mt-2">
					<SupportLink />
				</p>
				<button
					type="button"
					onClick={onReplaySplash}
					className="mt-2 w-fit text-primary underline"
				>
					{translate('settings.about.replaySplash')}
				</button>
			</div>
		</SettingSection>
	);
}
