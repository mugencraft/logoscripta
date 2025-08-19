import { BarChart3, Database, FileUp } from "lucide-react";

import type { ContentCollection } from "@/domain/models/content/collection";
import type { ContentStatistics } from "@/domain/models/content/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface ContentStatisticsProps {
  collections?: ContentCollection[];
  stats?: ContentStatistics;
}

export const ContentStatisticsBanner = ({
  collections,
  stats,
}: ContentStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Collections
          </CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{collections?.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <FileUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tagged Items</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.taggedItems || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.totalItems
              ? Math.round((stats.taggedItems / stats.totalItems) * 100)
              : 0}
            % completion
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
