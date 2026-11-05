import { cn } from '@/lib/utils.ts';

export interface DataMessage {
	readonly text: string;
	readonly isError?: boolean;
}

/** Always there, empty or not: a message never moves the page. */
export function DataMessageLine({
	message,
}: {
	readonly message: DataMessage | null;
}) {
	return (
		<p
			role="status"
			className={cn(
				'min-h-5 text-sm',
				message?.isError ? 'text-destructive' : 'text-muted-foreground',
			)}
		>
			{message?.text}
		</p>
	);
}
