import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover.tsx';

const LATEST_RELEASE =
	'https://github.com/mumpkin/keyai/releases/latest/download';

/** Stable names, added to each release by `release.yml`. */
const DOWNLOADS = [
	{ label: 'Windows', detail: '.exe', file: 'keyai-windows-x64-setup.exe' },
	{ label: 'Linux', detail: 'AppImage', file: 'keyai-linux-x86_64.AppImage' },
	{ label: 'Linux', detail: '.deb', file: 'keyai-linux-amd64.deb' },
] as const;

/** Links to the desktop app, once a release has been published. */
export function DownloadMenu() {
	const { t: translate } = useTranslation();
	if (import.meta.env.VITE_DESKTOP_RELEASE !== 'true') {
		return null;
	}
	return (
		<Popover>
			<PopoverTrigger className="hidden cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground md:flex">
				<Download className="size-4" />
				{translate('download.title')}
			</PopoverTrigger>
			<PopoverContent align="end">
				<ul className="flex flex-col gap-1">
					{DOWNLOADS.map(({ label, detail, file }) => (
						<li key={file}>
							<a
								href={`${LATEST_RELEASE}/${file}`}
								className="flex items-baseline justify-between rounded-md px-2 py-1.5 hover:bg-muted"
							>
								<span className="font-medium">{label}</span>
								<span className="text-xs text-muted-foreground">
									{detail}
								</span>
							</a>
						</li>
					))}
				</ul>
				<p className="text-xs text-muted-foreground">
					{translate('download.unsignedNote')}
				</p>
			</PopoverContent>
		</Popover>
	);
}
