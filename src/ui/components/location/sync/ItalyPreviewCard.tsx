import { AlertCircle, CheckCircle } from "lucide-react";

import type { PreviewStats } from "@/domain/models/location/types";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface ItalyPreviewStats {
  regions: PreviewStats;
  provinces: PreviewStats;
  communes: PreviewStats;
}

interface ItalyPreviewCardProps {
  stats: ItalyPreviewStats;
  onSync: () => void;
  isLoading?: boolean;
  error?: string;
}

export const ItalyPreviewCard = ({
  stats,
  onSync,
  isLoading,
  error,
}: ItalyPreviewCardProps) => {
  const totalChanges = Object.values(stats).reduce(
    (sum, level) => sum + level.toAdd + level.toUpdate + level.toDeprecate,
    0,
  );
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
          Italy Administrative Data
        </CardTitle>
        <CardDescription>
          Regional hierarchy: regions, provinces, and communes (capitals only in
          preview)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.regions.toAdd + stats.regions.toUpdate}
            </div>
            <div className="text-sm text-muted-foreground">Regions</div>
            {stats.regions.toDeprecate > 0 && (
              <div className="text-xs text-red-600">
                -{stats.regions.toDeprecate} deprecated
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.provinces.toAdd + stats.provinces.toUpdate}
            </div>
            <div className="text-sm text-muted-foreground">Provinces</div>
            {stats.provinces.toDeprecate > 0 && (
              <div className="text-xs text-red-600">
                -{stats.provinces.toDeprecate} deprecated
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {stats.communes.toAdd + stats.communes.toUpdate}
            </div>
            <div className="text-sm text-muted-foreground">Communes</div>
            <div className="text-xs text-muted-foreground">
              (showing capitals + major cities in preview)
            </div>
            {stats.communes.toDeprecate > 0 && (
              <div className="text-xs text-red-600">
                -{stats.communes.toDeprecate} deprecated
              </div>
            )}
          </div>
        </div>

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
