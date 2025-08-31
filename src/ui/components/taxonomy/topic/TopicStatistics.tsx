import type { TaxonomySystemStatistics } from "@/domain/models/taxonomy/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface TopicStatisticsProps {
  statistics: TaxonomySystemStatistics;
}

export const TopicStatistics = ({ statistics }: TopicStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Total Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalTopics}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Max Depth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.maxDepth}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.assignmentsCount}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            {Object.entries(statistics.topicsPerLevel).map(([level, count]) => (
              <div key={level} className="flex justify-between">
                <span>L{level}:</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
