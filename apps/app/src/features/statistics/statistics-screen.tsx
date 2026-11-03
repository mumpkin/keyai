import { Placeholder } from '@/features/blocking/placeholder';

const KEY_FIGURES = ['42 kana/min', '94 %', '3 erreurs', '20 mots'];

function LastSeriesSection() {
	return (
		<Placeholder label="last series" className="flex flex-col gap-3">
			<h2 className="text-lg font-semibold">Dernière série</h2>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
				{KEY_FIGURES.map((figure) => (
					<Placeholder
						key={figure}
						label="figure"
						className="text-2xl"
					>
						{figure}
					</Placeholder>
				))}
			</div>
			<Placeholder
				label="chart · speed per word + threshold"
				className="h-40"
			/>
			<div className="grid gap-2 md:grid-cols-3">
				<Placeholder label="faulty kana" className="h-24" />
				<Placeholder label="words encountered" className="h-24" />
				<Placeholder label="skipped words" className="h-24" />
			</div>
		</Placeholder>
	);
}

export function StatisticsScreen() {
	return (
		<div className="flex flex-col gap-4">
			<LastSeriesSection />
			<Placeholder label="progress" className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">Progression</h2>
				<Placeholder
					label="chart · hiragana / katakana mastery"
					className="h-20"
				/>
				<Placeholder
					label="kana table coloured by mastery"
					className="h-48"
				/>
			</Placeholder>
			<Placeholder label="history" className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold">Évolution</h2>
				<Placeholder
					label="chart · speed and accuracy, last 100 series"
					className="h-48"
				/>
			</Placeholder>
		</div>
	);
}
