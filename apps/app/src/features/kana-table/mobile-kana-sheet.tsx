import { ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { KanaTable } from './kana-table.tsx';

/** On mobile, the virtual keyboard takes the bottom: the table is a sheet. */
export function MobileKanaSheet() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="md:hidden" data-keeps-focus>
			<Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
				Table des kana <ChevronUp data-icon="inline-end" />
			</Button>
			{isOpen && (
				<div className="fixed inset-x-0 bottom-0 z-20 max-h-[70dvh] overflow-auto rounded-t-2xl border-t bg-background p-4 shadow-2xl">
					<Button
						variant="ghost"
						className="mb-2 w-full"
						onClick={() => setIsOpen(false)}
					>
						Fermer
					</Button>
					<KanaTable />
				</div>
			)}
		</div>
	);
}
