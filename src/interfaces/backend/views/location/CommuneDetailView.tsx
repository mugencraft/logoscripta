import { Link } from "@tanstack/react-router";

import { EntityBreadcrumb } from "@/ui/components/layout/EntityBreadcrumb";
import type { LinkPropsType } from "@/ui/components/layout/types";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { CommuneCodes } from "@/ui/components/location/commune/CommuneCodes";
import { CommunePoiManagement } from "@/ui/components/location/commune/CommunePoiManagement";
import { CommuneStatisticsDashboard } from "@/ui/components/location/commune/CommuneStatisticsDashboard";

import { Route } from "../../routes/location/communes.$communeCode";
import { parseBreadcrumbFromPath } from "./breadcrumbs";

export function CommuneDetailView() {
  const commune = Route.useLoaderData();

  const breadcrumbItems = parseBreadcrumbFromPath(
    commune.codesPath,
    commune.namesPath,
    {
      name: commune.name,
      isActive: true,
    },
  );

  const poiCallback = (poiId: string): LinkPropsType => ({
    to: "/location/pois/$poiId",
    params: { poiId },
  });

  // POI analytics for municipal planning insights
  const analyzePOIs = () => {
    const totalPOIs = commune.pois.length;
    const typeDistribution = commune.pois.reduce(
      (acc, poi) => {
        acc[poi.type] = (acc[poi.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostCommonType = Object.entries(typeDistribution).reduce(
      (max, [type, count]) => (count > max.count ? { type, count } : max),
      { type: "none", count: 0 },
    );

    return { totalPOIs, typeDistribution, mostCommonType };
  };

  const poiAnalytics = analyzePOIs();

  return (
    <ViewContainer
      title={commune.name}
      description={`Municipal commune in ${commune.province.name}, ${commune.province.region.name}`}
    >
      <div className="space-y-6">
        <EntityBreadcrumb items={breadcrumbItems} />
        <Link
          to="/location/pois"
          search={{ communeCode: commune.code }}
          className="text-xs text-blue-600 hover:underline"
        >
          Manage POIs
        </Link>

        <CommuneStatisticsDashboard
          commune={commune}
          poiAnalytics={poiAnalytics}
        />

        <CommuneCodes commune={commune} />

        <CommunePoiManagement
          commune={commune}
          poiAnalytics={poiAnalytics}
          poiCallback={poiCallback}
        />
      </div>
    </ViewContainer>
  );
}
