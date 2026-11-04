import { type KeyboardEvent, useRef, useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils.ts';

interface NumberFieldProps {
	readonly label: string;
	readonly value: number;
	readonly limits: {
		readonly min: number;
		readonly max: number;
		readonly step?: number;
	};
	readonly onCommit: (value: number) => void;
	/** Left without a new value: nothing typed, or Escape. */
	readonly onCancel?: () => void;
	readonly opensFocused?: boolean;
	readonly className?: string;
}

/**
 * Keeps what is being typed apart from the value: clamping on every key
 * would turn the first digit of "30" into the minimum. Enter and Escape
 * leave the field, and leaving it is what commits or cancels.
 */
export function NumberField({
	label,
	value,
	limits,
	onCommit,
	onCancel,
	opensFocused = false,
	className,
}: NumberFieldProps) {
	const [draft, setDraft] = useState<string | null>(null);
	const isCancelled = useRef(false);

	function leave() {
		if (draft && !isCancelled.current) {
			onCommit(Number(draft));
		} else {
			onCancel?.();
		}
		isCancelled.current = false;
		setDraft(null);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Escape') {
			isCancelled.current = true;
		}
		if (event.key === 'Escape' || event.key === 'Enter') {
			event.currentTarget.blur();
		}
	}

	return (
		<Input
			type="number"
			aria-label={label}
			min={limits.min}
			max={limits.max}
			step={limits.step}
			value={draft ?? value}
			autoFocus={opensFocused}
			onFocus={(event) => event.target.select()}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={leave}
			onKeyDown={handleKeyDown}
			className={cn('w-20 shrink-0', className)}
		/>
	);
}
