import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PlaceholderProps {
	readonly label: string;
	readonly className?: string;
	readonly children?: ReactNode;
}

export function Placeholder({ label, className, children }: PlaceholderProps) {
	return (
		<div
			className={cn(
				'relative rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/40 p-3',
				className,
			)}
		>
			<span className="absolute top-1 right-2 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
				{label}
			</span>
			{children}
		</div>
	);
}
