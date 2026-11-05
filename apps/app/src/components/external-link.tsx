import type { MouseEvent, ReactNode } from 'react';
import { useOpenLink } from '@/stores/app-context.tsx';

/** A link to the web; the desktop app hands it over to the browser. */
export function ExternalLink({
	href,
	children,
}: {
	readonly href: string;
	readonly children: ReactNode;
}) {
	const openLink = useOpenLink();

	function open(event: MouseEvent) {
		if (openLink) {
			event.preventDefault();
			openLink(href);
		}
	}

	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			onClick={open}
			className="text-primary underline"
		>
			{children}
		</a>
	);
}
