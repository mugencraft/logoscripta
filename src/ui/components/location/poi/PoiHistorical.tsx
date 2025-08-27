import { Clock } from "lucide-react";

import type { POI } from "@/domain/models/location/poi";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Label } from "@/ui/components/core/label";

interface PoiHistoricalProps {
  poi: POI;
}

export const PoiHistorical = ({ poi }: PoiHistoricalProps) => {
  if (!poi.metadata?.historical) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historical Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {poi.metadata.historical.periods &&
          poi.metadata.historical.periods.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Historical Periods
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {poi.metadata.historical.periods.map((period) => (
                  <Badge key={period} variant="outline" className="text-xs">
                    {period}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {poi.metadata.historical.cultures &&
          poi.metadata.historical.cultures.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Associated Cultures
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {poi.metadata.historical.cultures.map((culture) => (
                  <Badge key={culture} variant="outline" className="text-xs">
                    {culture}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
};
