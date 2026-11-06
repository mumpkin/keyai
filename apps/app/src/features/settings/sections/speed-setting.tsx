import {
	type Settings,
	SPEED_LIMITS,
	SPEED_PRESET_NAMES,
	type SpeedPresetName,
	withKanaPerMinute,
	withSpeedPreset,
} from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import { ChoiceField } from '@/features/settings/fields/choice-field.tsx';
import {
	SettingGroup,
	SettingRow,
} from '@/features/settings/fields/setting-section.tsx';
import { useSettings } from '@/features/settings/use-settings.ts';

function withPreset(settings: Settings, preset: SpeedPresetName): Settings {
	return preset === 'custom'
		? withKanaPerMinute(settings, settings.speed.kanaPerMinute)
		: withSpeedPreset(settings, preset);
}

export function SpeedSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const label = translate('settings.speed.label');
	const threshold = translate('settings.speed.threshold');
	return (
		<SettingGroup tourZone="speed">
			<SettingRow label={label}>
				<ChoiceField
					label={label}
					value={settings.speed.preset}
					options={SPEED_PRESET_NAMES.map((preset) => ({
						value: preset,
						label: translate(`settings.speed.${preset}`),
					}))}
					onChange={(preset) =>
						updateSettings((current) => withPreset(current, preset))
					}
				/>
			</SettingRow>
			<SettingRow label={threshold}>
				<NumberField
					label={threshold}
					value={settings.speed.kanaPerMinute}
					limits={SPEED_LIMITS}
					onCommit={(kanaPerMinute) =>
						updateSettings((current) =>
							withKanaPerMinute(current, kanaPerMinute),
						)
					}
				/>
			</SettingRow>
			<p className="text-xs text-muted-foreground">
				{translate('settings.speed.hint')}
			</p>
		</SettingGroup>
	);
}
