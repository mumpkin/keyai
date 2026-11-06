import type { ReactNode } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';

interface ConfirmDialogProps {
	readonly isOpen: boolean;
	readonly title: string;
	readonly description: ReactNode;
	readonly confirmLabel: string;
	readonly cancelLabel: string;
	readonly onConfirm: () => void;
	readonly onClose: () => void;
}

/** Asks before an action that erases something. */
export function ConfirmDialog({
	isOpen,
	title,
	description,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onClose,
}: ConfirmDialogProps) {
	return (
		<AlertDialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription render={<div />}>
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={onConfirm}
					>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
