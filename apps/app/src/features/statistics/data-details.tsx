import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover.tsx';

interface DataDetailsProps {
	readonly headers: readonly string[];
	readonly rows: readonly {
		readonly id: string;
		readonly cells: readonly ReactNode[];
	}[];
}

/**
 * The figures of a chart, readable without hovering it. They float above the
 * page, which does not move when they open.
 */
export function DataDetails({ headers, rows }: DataDetailsProps) {
	const { t: translate } = useTranslation();
	return (
		<Popover>
			<PopoverTrigger className="w-fit cursor-pointer text-sm text-muted-foreground underline">
				{translate('statistics.showData')}
			</PopoverTrigger>
			<PopoverContent align="start" className="w-[min(32rem,90vw)]">
				<div className="max-h-72 scroll-y">
					<table className="w-full text-left tabular-nums">
						<thead className="text-xs text-muted-foreground">
							<tr>
								{headers.map((header) => (
									<th key={header} className="font-normal">
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.id}>
									{row.cells.map((cell, column) => (
										<td key={headers[column]}>{cell}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</PopoverContent>
		</Popover>
	);
}
