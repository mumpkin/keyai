import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Placeholder } from '@/features/blocking/placeholder';

export function UnlockBanner() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) {
		return null;
	}
	return (
		<Placeholder
			label="unlock banner"
			className="flex items-center justify-between border-primary bg-primary/10"
		>
			<span>
				✦ Nouveau kana : <span className="font-kana text-xl">く</span>{' '}
				(ku)
			</span>
			<button
				type="button"
				aria-label="Fermer"
				onClick={() => setIsVisible(false)}
			>
				<XIcon className="size-4" />
			</button>
		</Placeholder>
	);
}
