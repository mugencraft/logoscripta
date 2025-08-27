import { EntityBreadcrumb } from "@/ui/components/layout/EntityBreadcrumb";
import type { LinkPropsType } from "@/ui/components/layout/types";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { ProvinceCommunes } from "@/ui/components/location/province/ProvinceCommunes";
import { ProvinceInformation } from "@/ui/components/location/province/ProvinceInformation";
import { ProvinceStatistics } from "@/ui/components/location/province/ProvinceStatistics";

import { Route } from "../../routes/location/provinces.$provinceCode";
import { parseBreadcrumbFromPath } from "./breadcrumbs";

export function ProvinceDetailView() {
  const province = Route.useLoaderData();

  const breadcrumbItems = parseBreadcrumbFromPath(
    province.codesPath,
    province.namesPath,
    {
      name: province.name,
      isActive: true,
    },
  );

  const communeCallback = (communeCode: string): LinkPropsType => ({
    to: "/location/communes/$communeCode",
    params: { communeCode },
  });

  const communesLink: LinkPropsType = {
    to: "/location/communes",
    search: { provinceCode: province.code },
  };

  const regionLink: LinkPropsType = {
    to: "/location/regions/$regionCode",
    params: { regionCode: province.regionCode },
  };

  // Administrative efficiency metrics
  const calculateMetrics = () => {
    const communeCount = province.communes.length;
    const capitalCommune = province.communes.find((c) => c.isCapital);

    return {
      communeCount,
      hasCapitalData: Boolean(capitalCommune),
      capitalId: capitalCommune?.code,
    };
  };

  const metrics = calculateMetrics();

  return (
    <ViewContainer
      title={province.name}
      description={`Administrative province in ${province.region.name}`}
    >
      <div className="space-y-6">
        <EntityBreadcrumb items={breadcrumbItems} />

        <ProvinceStatistics
          province={province}
          metrics={metrics}
          regionLink={regionLink}
          communesLink={communesLink}
          communeCallback={communeCallback}
        />

        <ProvinceInformation province={province} />

        <ProvinceCommunes
          province={province}
          communeCallback={communeCallback}
        />
      </div>
    </ViewContainer>
  );
}
