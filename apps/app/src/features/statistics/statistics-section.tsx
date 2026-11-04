import type { ReactNode } from 'react';

export function StatisticsSection({
	title,
	children,
}: {
	readonly title: string;
	readonly children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4 rounded-lg border p-4">
			<h2 className="text-lg font-semibold">{title}</h2>
			{children}
		</section>
	);
}

export function StatisticsBlock({
	title,
	children,
}: {
	readonly title: string;
	readonly children: ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<h3 className="text-sm font-medium">{title}</h3>
			{children}
		</div>
	);
}

export function StatTile({
	label,
	value,
}: {
	readonly label: string;
	readonly value: string;
}) {
	return (
		<div className="rounded-md bg-muted/50 p-3">
			<p className="text-2xl font-semibold tabular-nums">{value}</p>
			<p className="text-xs text-muted-foreground">{label}</p>
		</div>
	);
}

export function EmptyNote({ children }: { readonly children: ReactNode }) {
	return <p className="text-sm text-muted-foreground">{children}</p>;
}
