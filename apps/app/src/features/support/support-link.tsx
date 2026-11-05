import { Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '@/components/external-link.tsx';
import { useProgress } from '@/stores/app-context.tsx';

const SUPPORT_URL = 'https://buymeacoffee.com/mumpkin';

/**
 * A plain link in the colours of Buy Me a Coffee: their script and images are
 * hosted elsewhere, so they would break offline and in the desktop app.
 */
export function SupportLink() {
	const { t: translate } = useTranslation();
	return (
		<ExternalLink
			href={SUPPORT_URL}
			className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#ffdd00] px-2.5 py-1 text-sm font-medium text-black"
		>
			<Coffee aria-hidden="true" className="size-4" />
			{translate('support.button')}
		</ExternalLink>
	);
}

/** Bottom left of every screen, too small for a phone: see the settings. */
export function FloatingSupport() {
	const { t: translate } = useTranslation();
	const isShown = useProgress(
		(state) => state.save.settings.display.showsSupportButton,
	);
	if (!isShown) {
		return null;
	}
	return (
		<aside
			aria-label={translate('support.button')}
			className="fixed bottom-2 left-2 z-10 hidden flex-col items-start gap-0.5 md:flex"
		>
			<SupportLink />
			<p className="rounded bg-background/80 px-1 text-[10px] text-muted-foreground">
				{translate('support.hint')}
			</p>
		</aside>
	);
}
