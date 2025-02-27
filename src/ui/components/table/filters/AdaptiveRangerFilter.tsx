import { formatNumber } from "@/core/utils/format";
import { cn } from "@/ui/utils";
import { useRanger } from "@tanstack/react-ranger";
import type { Column } from "@tanstack/react-table";
import { useRef, useState } from "react";

export const AdaptiveRangerFilter = <TData,>({
	column,
}: {
	column: Column<TData>;
}) => {
	const rangerRef = useRef<HTMLDivElement>(null);

	// Get all values and create scale transformation
	const facetedValues = Array.from(
		column.getFacetedUniqueValues().keys(),
	).filter((value): value is number => typeof value === "number");

	const min = Math.min(...facetedValues);
	const max = Math.max(...facetedValues);

	// Initialize values from current filter or defaults
	const currentFilter = column.getFilterValue() as [number, number] | undefined;
	const [values, setValues] = useState<ReadonlyArray<number>>(
		currentFilter ?? [min, max],
	);

	const { threshold, linearPortion, distribution } =
		analyzeDistribution(facetedValues);

	const rangerInstance = useRanger<HTMLDivElement>({
		getRangerElement: () => rangerRef.current,
		values,
		min,
		max,
		stepSize: 1,
		interpolator: interpolator(threshold, linearPortion),
		ticks: [
			0,
			getScaledValue(0.25, max, threshold, linearPortion),
			getScaledValue(0.5, max, threshold, linearPortion),
			getScaledValue(0.75, max, threshold, linearPortion),
			max,
		],
		onChange: (instance) => {
			setValues(instance.sortedValues);
			column.setFilterValue(instance.sortedValues);
		},
	});

	return (
		<div className="px-2" data-column-id={column.id}>
			<div
				ref={rangerRef}
				className="relative h-2 w-full rounded-full my-8 select-none"
			>
				{/* Track segments */}
				{rangerInstance.getSteps().map(({ left, width }, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<RangerStep key={i} {...{ left, width }} />
				))}

				{/* Tick marks */}
				{rangerInstance.getTicks().map(({ value, key, percentage }) => (
					<RangerTick key={key} {...{ value, percentage }} />
				))}

				{/* Handles */}
				{rangerInstance
					.handles()
					.map(
						(
							{
								value,
								onKeyDownHandler,
								onMouseDownHandler,
								onTouchStart,
								isActive,
							},
							i,
						) => {
							return (
								<button
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={i}
									type="button"
									onKeyDown={onKeyDownHandler}
									onMouseDown={onMouseDownHandler}
									onTouchStart={onTouchStart}
									role="slider"
									aria-valuemin={rangerInstance.options.min}
									aria-valuemax={rangerInstance.options.max}
									aria-valuenow={value}
									className={cn(
										"absolute top-1/2 w-4 h-4",
										"transform -translate-y-1/2 -translate-x-1/2",
										"rounded-full bg-primary",
										"transition-transform cursor-grab active:cursor-grabbing",
										isActive ? "scale-125 z-20" : "z-10",
									)}
									style={{
										left: `${rangerInstance.getPercentageForValue(value)}%`,
									}}
								>
									<span className="sr-only">Adjust range value</span>
								</button>
							);
						},
					)}
				<div className="absolute -translate-y-8 text-xs text-accent">
					({distribution})
				</div>
			</div>
		</div>
	);
};

const RangerStep = ({ left, width }: { left: number; width: number }) => (
	<div
		className="absolute h-full bg-primary/30"
		style={{
			left: `${left}%`,
			width: `${width}%`,
		}}
	/>
);

const RangerTick = ({
	percentage,
	value,
}: { value: number; percentage: number }) => (
	<div
		key={percentage}
		className="absolute w-px h-3 bg-primary -bottom-4"
		style={{
			left: `${percentage}%`,
		}}
	>
		<span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-accent">
			{formatNumber(value)}
		</span>
	</div>
);

function analyzeDistribution(values: number[]) {
	if (values.length === 0) {
		return {
			threshold: 0,
			linearPortion: 0.5, // default to linear if no values
			distribution: "linear",
		};
	}

	const orderedValues = [...values].sort((a, b) => a - b);
	const max = orderedValues[orderedValues.length - 1] as number;

	// Find the value that captures 90% of the data points
	const percentile90Index = Math.floor(orderedValues.length * 0.9);
	const percentile90Value = orderedValues[percentile90Index] as number;

	// Calculate the ratio between the 90th percentile and max
	// This helps identify how extreme the distribution's tail is
	const tailRatio = percentile90Value / max;

	// If the tail ratio is very small, we have a highly skewed distribution
	if (tailRatio < 0.2) {
		return {
			threshold: percentile90Value,
			linearPortion: 0.9, // Use linear scale for 90% of the range
			distribution: "power",
		};
	}

	// For more moderate distributions
	if (tailRatio < 0.5) {
		return {
			threshold: percentile90Value,
			linearPortion: 0.75,
			distribution: "exponential",
		};
	}

	// For roughly linear distributions
	return {
		threshold: max * 0.5,
		linearPortion: 0.5,
		distribution: "linear",
	};
}

function getScaledValue(
	percentage: number,
	max: number,
	threshold: number,
	linearPortion: number,
): number {
	// For the linear portion (0 to threshold)
	if (percentage <= linearPortion) {
		// Scale percentage to the threshold value
		return (percentage / linearPortion) * threshold;
	}

	// For the non-linear portion (threshold to max)
	// Use exponential scaling for smoother transition
	const nonLinearPercentage =
		(percentage - linearPortion) / (1 - linearPortion);
	const exponentialBase = Math.log(max / threshold);

	return threshold * Math.exp(nonLinearPercentage * exponentialBase);
}

const interpolator = (threshold: number, linearPortion: number) => {
	return {
		getPercentageForValue: (val: number, min: number, max: number) => {
			if (val <= threshold) {
				return (val / threshold) * (linearPortion * 100);
			}

			const logThreshold = Math.log(threshold);
			const logMax = Math.log(max);
			const logVal = Math.log(val);

			// Scale the remaining portion to fill the rest of the range
			const remainingPortion = 1 - linearPortion;
			const logPercentage = (logVal - logThreshold) / (logMax - logThreshold);

			return linearPortion * 100 + remainingPortion * 100 * logPercentage;
		},

		getValueForClientX: (
			clientX: number,
			trackDims: { width: number; left: number },
			min: number,
			max: number,
		) => {
			const { left, width } = trackDims;
			const val = Math.max(0, Math.min(100, ((clientX - left) / width) * 100));

			const linearThreshold = linearPortion * 100;

			if (val <= linearThreshold) {
				return (val / linearThreshold) * threshold;
			}

			const logThreshold = Math.log(threshold);
			const logMax = Math.log(max);
			const remainingPortion = 1 - linearPortion;
			const normalizedPercentage =
				(val - linearThreshold) / (remainingPortion * 100);

			return Math.exp(
				logThreshold + normalizedPercentage * (logMax - logThreshold),
			);
		},
	};
};
