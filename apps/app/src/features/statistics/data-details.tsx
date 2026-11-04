import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface DataDetailsProps {
	readonly headers: readonly string[];
	readonly rows: readonly {
		readonly id: string;
		readonly cells: readonly ReactNode[];
	}[];
}

/** The figures of a chart, readable without hovering it. */
export function DataDetails({ headers, rows }: DataDetailsProps) {
	const { t: translate } = useTranslation();
	return (
		<details className="text-sm">
			<summary className="cursor-pointer text-muted-foreground">
				{translate('statistics.showData')}
			</summary>
			<div className="mt-2 max-h-60 scroll-y">
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
		</details>
	);
}
