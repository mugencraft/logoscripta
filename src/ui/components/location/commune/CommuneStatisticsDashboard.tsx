import { Crown, MapPin } from "lucide-react";

import type { Commune } from "@/domain/models/location/commune";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

import type { PoiAnalytics } from "./types";

interface CommuneStatisticsDashboardProps {
  commune: Commune;
  poiAnalytics: PoiAnalytics;
}

export const CommuneStatisticsDashboard = ({
  commune,
  poiAnalytics,
}: CommuneStatisticsDashboardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Points of Interest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{poiAnalytics.totalPOIs}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Administrative Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {commune.isCapital ? (
              <>
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Province Capital</span>
              </>
            ) : (
              <span className="text-muted-foreground">Municipal Commune</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Dominant POI Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="capitalize font-medium">
            {poiAnalytics.mostCommonType.type !== "none" ? (
              <>
                {poiAnalytics.mostCommonType.type}
                <div className="text-xs text-muted-foreground">
                  {poiAnalytics.mostCommonType.count} locations
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">No POIs</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
