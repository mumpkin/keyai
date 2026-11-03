interface OptionGroupProps<Option extends string> {
	readonly name: string;
	readonly legend: string;
	readonly labels: Record<Option, string>;
	readonly value: Option;
	readonly onChange: (value: Option) => void;
}

export function OptionGroup<Option extends string>({
	name,
	legend,
	labels,
	value,
	onChange,
}: OptionGroupProps<Option>) {
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
			<span className="font-medium">{legend}</span>
			{(Object.keys(labels) as Option[]).map((option) => (
				<label key={option} className="flex items-center gap-1">
					<input
						type="radio"
						name={name}
						checked={option === value}
						onChange={() => onChange(option)}
					/>
					{labels[option]}
				</label>
			))}
		</div>
	);
}
