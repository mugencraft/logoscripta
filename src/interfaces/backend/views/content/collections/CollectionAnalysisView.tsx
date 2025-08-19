import { useMemo } from "react";

import { CollectionStatsCard } from "@/ui/components/content/collection/analysis/CollectionStatsCard";
import { ContentTypeBreakdown } from "@/ui/components/content/collection/analysis/ContentTypeBreakdown";
import { TagDistributionChart } from "@/ui/components/content/collection/analysis/TagDistributionChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";

import { Route } from "../../../routes/content/collections_/$collectionId.analysis";

export function CollectionAnalysisView() {
  const { collection, analysis } = Route.useLoaderData();

  // Enhanced statistics calculation
  const enhancedStats = useMemo(() => {
    const taggedItemsCount = Object.values(analysis.tagDistribution).reduce(
      (a, b) => a + b,
      0,
    );
    const completionRate =
      analysis.totalItems > 0
        ? (taggedItemsCount / analysis.totalItems) * 100
        : 0;

    return {
      ...analysis,
      completionRate,
      taggedItemsCount,
    };
  }, [analysis]);

  return (
    <ViewContainer
      title={`Analysis: ${collection.name}`}
      description="Content collection statistics and insights"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CollectionStatsCard
            title="Total Items"
            value={enhancedStats.totalItems}
            icon="FileText"
            description="Items in collection"
          />
          <CollectionStatsCard
            title="Unique Tags"
            value={enhancedStats.totalTags}
            icon="Tags"
            description="Different tags used"
          />
          <CollectionStatsCard
            title="Avg Tags/Item"
            value={enhancedStats.averageTagsPerItem.toFixed(1)}
            icon="BarChart"
            description="Tag density"
          />
          <CollectionStatsCard
            title="Completion"
            value={`${enhancedStats.completionRate.toFixed(1)}%`}
            icon="CheckCircle"
            description="Items with tags"
            trend={{
              value: enhancedStats.completionRate,
              isPositive: enhancedStats.completionRate > 50,
            }}
          />
        </div>

        {/* Content Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentTypeBreakdown items={collection.items} />
            </CardContent>
          </Card>
        </div>

        {/* Tag Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Tags</CardTitle>
            <p className="text-sm text-muted-foreground">
              Top 10 tags by usage frequency
            </p>
          </CardHeader>
          <CardContent>
            <TagDistributionChart
              tagDistribution={enhancedStats.tagDistribution}
              totalItems={enhancedStats.totalItems}
            />
          </CardContent>
        </Card>

        {/* Collection Health Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {enhancedStats.completionRate > 80
                    ? "Excellent"
                    : enhancedStats.completionRate > 60
                      ? "Good"
                      : enhancedStats.completionRate > 40
                        ? "Fair"
                        : "Poor"}
                </div>
                <div className="text-sm text-gray-600">Tagging Coverage</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {enhancedStats.averageTagsPerItem.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Tags per Item</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {enhancedStats.totalTags}
                </div>
                <div className="text-sm text-gray-600">Tag Vocabulary</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ViewContainer>
  );
}
