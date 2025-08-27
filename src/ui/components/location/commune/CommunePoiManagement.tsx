import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import type { CommuneWithPOIs } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkPropsType } from "@/ui/components/layout/types";

import type { PoiAnalytics } from "./types";

interface CommunePoiManagementProps {
  commune: CommuneWithPOIs;
  poiAnalytics: PoiAnalytics;
  poiCallback: (poiId: string) => LinkPropsType;
}

export const CommunePoiManagement = ({
  commune,
  poiAnalytics,
  poiCallback,
}: CommunePoiManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Points of Interest Management</CardTitle>
        <CardDescription>
          Cultural sites, services, and landmarks within {commune.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {commune.pois.length > 0 ? (
          <div className="space-y-4">
            {/* POI Type Distribution Summary */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(poiAnalytics.typeDistribution).map(
                ([type, count]) => (
                  <Badge key={type} variant="outline" className="capitalize">
                    {type}: {count}
                  </Badge>
                ),
              )}
            </div>

            {/* POI Grid Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {commune.pois.map((poi) => (
                <Link key={poi.id} {...poiCallback(String(poi.id))}>
                  <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <div className="font-medium truncate">{poi.name}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize mb-1"
                    >
                      {poi.type}
                    </Badge>
                    {poi.address && (
                      <div className="text-xs text-muted-foreground truncate">
                        {poi.address}
                      </div>
                    )}
                    {poi.latitude && poi.longitude && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No points of interest registered for {commune.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
