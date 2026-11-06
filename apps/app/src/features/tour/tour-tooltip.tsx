import { useTranslation } from 'react-i18next';
import type { TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button.tsx';

/** A bubble made of the components of the app, in both themes. */
export function TourTooltip({
	index,
	size,
	step,
	isLastStep,
	backProps,
	primaryProps,
	skipProps,
	tooltipProps,
}: TooltipRenderProps) {
	const { t: translate } = useTranslation();
	return (
		<div
			{...tooltipProps}
			className="flex w-80 max-w-[90vw] flex-col gap-3 rounded-lg bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
		>
			<p>{step.content}</p>
			<div className="flex items-center gap-2">
				{size > 1 && (
					<span className="text-xs text-muted-foreground tabular-nums">
						{index + 1}/{size}
					</span>
				)}
				{!isLastStep && (
					<Button variant="ghost" size="sm" {...skipProps}>
						{translate('tour.skip')}
					</Button>
				)}
				<span className="ml-auto flex gap-2">
					{index > 0 && (
						<Button variant="outline" size="sm" {...backProps}>
							{translate('tour.back')}
						</Button>
					)}
					<Button size="sm" {...primaryProps}>
						{translate(isLastStep ? 'tour.done' : 'tour.next')}
					</Button>
				</span>
			</div>
		</div>
	);
}
