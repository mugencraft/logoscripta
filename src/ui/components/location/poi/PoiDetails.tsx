import { Edit, Info, MapPin } from "lucide-react";

import type { POI } from "@/domain/models/location/poi";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Label } from "@/ui/components/core/label";

interface PoiDetailsProps {
  poi: POI;
  setIsEditMode: (isEditMode: boolean) => void;
}

export const PoiDetails = ({ poi, setIsEditMode }: PoiDetailsProps) => {
  // Generate map link if coordinates are available
  const getMapLink = () => {
    if (poi.latitude && poi.longitude) {
      return `https://www.openstreetmap.org/?mlat=${poi.latitude}&mlon=${poi.longitude}&zoom=16`;
    }
    return null;
  };

  const mapLink = getMapLink();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            POI Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Name
              </Label>
              <p className="font-medium">{poi.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Type
              </Label>
              <p>
                <Badge variant="outline" className="capitalize">
                  {poi.type}
                </Badge>
              </p>
            </div>
          </div>

          {poi.address && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Address
              </Label>
              <p>{poi.address}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => setIsEditMode(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit POI
            </Button>
            {mapLink && (
              <Button variant="outline" size="sm" asChild>
                <a href={mapLink} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {poi.latitude && poi.longitude ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Latitude
                </Label>
                <p className="font-mono">{poi.latitude.toFixed(6)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Longitude
                </Label>
                <p className="font-mono">{poi.longitude.toFixed(6)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No coordinates available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
