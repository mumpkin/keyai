import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx';

interface ChoiceFieldProps<Value extends string> {
	readonly label: string;
	readonly value: Value;
	readonly options: readonly {
		readonly value: Value;
		readonly label: string;
	}[];
	readonly onChange: (value: Value) => void;
}

/** One choice among a few, always visible. */
export function ChoiceField<Value extends string>({
	label,
	value,
	options,
	onChange,
}: ChoiceFieldProps<Value>) {
	function select(values: readonly string[]) {
		const selected = options.find((option) =>
			values.includes(option.value),
		);
		// Clicking the current choice deselects it: the setting stays as it is.
		if (selected) {
			onChange(selected.value);
		}
	}

	return (
		<ToggleGroup
			aria-label={label}
			variant="outline"
			value={[value]}
			onValueChange={select}
		>
			{options.map((option) => (
				<ToggleGroupItem key={option.value} value={option.value}>
					{option.label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
