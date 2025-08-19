import { useMemo } from "react";

interface TagDistributionChartProps {
  tagDistribution: Record<string, number>;
  totalItems: number;
}

export const TagDistributionChart = ({
  tagDistribution,
  totalItems,
}: TagDistributionChartProps) => {
  // Get top 10 most used tags
  const topTags = useMemo(() => {
    return Object.entries(tagDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: (count / totalItems) * 100,
      }));
  }, [tagDistribution, totalItems]);

  return (
    <div className="space-y-2">
      {topTags.map(({ tag, count, percentage }) => (
        <div key={tag} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium truncate">{tag}</span>
            <span className="text-gray-600">
              {count} ({percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
