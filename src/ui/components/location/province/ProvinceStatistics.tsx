import { Link } from "@tanstack/react-router";
import { Building, Home, Shield } from "lucide-react";

import type { ProvinceWithCommunes } from "@/domain/models/location/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkPropsType } from "@/ui/components/layout/types";

type ProvinceStatisticsMetrics = {
  communeCount: number;
  hasCapitalData: boolean;
  capitalId: string | undefined;
};

interface ProvinceStatisticsProps {
  province: ProvinceWithCommunes;
  metrics: ProvinceStatisticsMetrics;
  regionLink: LinkPropsType;
  communesLink: LinkPropsType;
  communeCallback: (communeCode: string) => LinkPropsType;
}

export const ProvinceStatistics = ({
  province,
  metrics,
  regionLink,
  communesLink,
  communeCallback,
}: ProvinceStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4" />
            Communes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.communeCount}</div>
          <Link
            {...communesLink}
            className="text-xs text-blue-600 hover:underline"
          >
            View all communes
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Capital
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* <div className="font-medium">
            {province.capital || "Not specified"}
          </div> */}
          {metrics.hasCapitalData && metrics.capitalId && (
            <Link
              {...communeCallback(metrics.capitalId)}
              className="text-xs text-blue-600 hover:underline"
            >
              View capital details
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building className="h-4 w-4" />
            Region
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            {...regionLink}
            className="font-medium text-blue-600 hover:underline"
          >
            {province.region.name}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
