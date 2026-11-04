import { KANA_SIZE_LIMITS, withKanaSize } from '@keyai/core/settings';
import { useTranslation } from 'react-i18next';
import { NumberField } from '@/components/number-field.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { SettingRow, SettingSection } from './setting-section.tsx';
import { useSettings } from './use-settings.ts';

export function KanaSizeSetting() {
	const { t: translate } = useTranslation();
	const { settings, updateSettings } = useSettings();
	const sizePx = settings.display.kanaSizePx;

	function applySize(nextSizePx: number) {
		updateSettings((current) => withKanaSize(current, nextSizePx));
	}

	return (
		<SettingSection title={translate('settings.display.title')}>
			<SettingRow label={translate('settings.display.kanaSize')}>
				<span className="flex items-center gap-3">
					<span className="w-40">
						<Slider
							thumbLabel={translate('settings.display.kanaSize')}
							min={KANA_SIZE_LIMITS.min}
							max={KANA_SIZE_LIMITS.max}
							value={sizePx}
							onValueChange={(value) =>
								applySize(value as number)
							}
						/>
					</span>
					<NumberField
						label={translate('settings.display.kanaSizePx')}
						value={sizePx}
						limits={KANA_SIZE_LIMITS}
						onCommit={applySize}
					/>
					px
				</span>
			</SettingRow>
			<p
				className="truncate font-kana"
				style={{ fontSize: 'var(--kana-size)' }}
			>
				あいう
			</p>
		</SettingSection>
	);
}
