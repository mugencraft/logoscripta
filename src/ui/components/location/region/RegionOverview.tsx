import { Link } from "@tanstack/react-router";
import { Building, Home, MapPin } from "lucide-react";

import type {
  RegionStatistics,
  RegionWithProvinces,
} from "@/domain/models/location/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkPropsType } from "@/ui/components/layout/types";

interface RegionOverviewProps {
  region: RegionWithProvinces;
  statistics: RegionStatistics;
  link: LinkPropsType;
}

export const RegionOverview = ({
  region,
  statistics,
  link,
}: RegionOverviewProps) => {
  const getEfficiencyMetrics = () => {
    const avgCommunesPerProvince =
      region.provinces.length > 0
        ? (statistics.communesCount / region.provinces.length).toFixed(1)
        : "0";

    const avgPOIsPerCommune =
      statistics.communesCount > 0
        ? (statistics.poisCount / statistics.communesCount).toFixed(1)
        : "0";

    return { avgCommunesPerProvince, avgPOIsPerCommune };
  };

  const metrics = getEfficiencyMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building className="h-4 w-4" />
            Provinces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.provincesCount}</div>
          <Link
            to={link.to}
            search={link.search}
            className="text-xs text-blue-600 hover:underline"
          >
            View all provinces
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4" />
            Communes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.communesCount}</div>
          <p className="text-xs text-muted-foreground">
            Avg {metrics.avgCommunesPerProvince} per province
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Points of Interest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.poisCount}</div>
          <p className="text-xs text-muted-foreground">
            Avg {metrics.avgPOIsPerCommune} per commune
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Administrative Density
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {((statistics.poisCount / statistics.communesCount) * 100).toFixed(
              0,
            )}
            %
          </div>
          <p className="text-xs text-muted-foreground">POI Coverage</p>
        </CardContent>
      </Card>
    </div>
  );
};
