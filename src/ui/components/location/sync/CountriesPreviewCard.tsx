import { AlertCircle, CheckCircle, Minus, Plus, RotateCcw } from "lucide-react";

import type { PreviewStats } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface CountriesPreviewCardProps {
  title: string;
  description: string;
  stats: PreviewStats;
  currentCount?: number;
  onSync: () => void;
  isLoading?: boolean;
  error?: string;
}

export const CountriesPreviewCard = ({
  title,
  description,
  stats,
  currentCount = 0,
  onSync,
  isLoading,
  error,
}: CountriesPreviewCardProps) => {
  const totalChanges = stats.toAdd + stats.toUpdate + stats.toDeprecate;
  const hasChanges = totalChanges > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasChanges ? (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {title}
        </CardTitle>
        <CardDescription>
          {description}
          <div className="text-sm text-muted-foreground mt-1">
            Currently tracking: {currentCount} countries
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasChanges ? (
          <div className="grid grid-cols-3 gap-3">
            {stats.toAdd > 0 && (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-600" />
                <Badge variant="outline" className="text-green-700">
                  Add: {stats.toAdd}
                </Badge>
              </div>
            )}
            {stats.toUpdate > 0 && (
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-blue-600" />
                <Badge variant="outline" className="text-blue-700">
                  Update: {stats.toUpdate}
                </Badge>
              </div>
            )}
            {stats.toDeprecate > 0 && (
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-red-600" />
                <Badge variant="outline" className="text-red-700">
                  Deprecate: {stats.toDeprecate}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-green-600">No changes needed</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          onClick={onSync}
          disabled={!hasChanges || isLoading}
          className="w-full"
        >
          {isLoading
            ? "Syncing..."
            : hasChanges
              ? `Apply ${totalChanges} changes`
              : "Up to date"}
        </Button>
      </CardContent>
    </Card>
  );
};
