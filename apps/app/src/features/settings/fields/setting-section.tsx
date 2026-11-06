import type { ReactNode } from 'react';

export function SettingSection({
	title,
	tourZone,
	children,
}: {
	readonly title: string;
	/** Where the guided tour can point. */
	readonly tourZone?: string;
	readonly children: ReactNode;
}) {
	return (
		<section
			className="flex flex-col gap-3 rounded-lg border p-4"
			data-tour={tourZone}
		>
			<h2 className="font-medium">{title}</h2>
			{children}
		</section>
	);
}

/** Rows the guided tour can point at, inside a section. */
export function SettingGroup({
	tourZone,
	children,
}: {
	readonly tourZone: string;
	readonly children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3" data-tour={tourZone}>
			{children}
		</div>
	);
}

export function SettingRow({
	label,
	children,
}: {
	readonly label: string;
	readonly children: ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
			<span>{label}</span>
			{children}
		</div>
	);
}
