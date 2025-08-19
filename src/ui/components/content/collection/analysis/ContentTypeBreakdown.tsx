import { useMemo } from "react";

import type { ContentCollectionWithItems } from "@/domain/models/content/types";

import { Badge } from "@/ui/components/core/badge";

interface ContentTypeBreakdownProps {
  items: ContentCollectionWithItems["items"];
}

export const ContentTypeBreakdown = ({ items }: ContentTypeBreakdownProps) => {
  const typeDistribution = useMemo(() => {
    const distribution = new Map<string, number>();
    for (const item of items) {
      const type = item.contentType || "unknown";
      distribution.set(type, (distribution.get(type) || 0) + 1);
    }
    return Array.from(distribution.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / items.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  return (
    <div className="space-y-3">
      {typeDistribution.map(({ type, count, percentage }) => (
        <div key={type} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{type}</Badge>
            <span className="text-sm">{count} items</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{percentage.toFixed(1)}%</div>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
