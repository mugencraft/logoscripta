import type { LinkPropsType } from "@/ui/components/layout/types";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { RegionDetails } from "@/ui/components/location/region/RegionDetails";
import { RegionOverview } from "@/ui/components/location/region/RegionOverview";
import { RegionProvinces } from "@/ui/components/location/region/RegionProvinces";

import { Route } from "../../routes/location/regions.$regionCode";

export function RegionDetailView() {
  const { region, statistics } = Route.useLoaderData();

  const linkCountry: LinkPropsType = {
    to: "/location/countries/$countryCode",
    params: { countryCode: region.countryCode },
  };

  const linkProvinces: LinkPropsType = {
    to: "/location/provinces",
    search: { regionCode: region.code },
  };

  const provinceLink = (provinceCode: string): LinkPropsType => ({
    to: "/location/provinces/$provinceCode",
    params: { provinceCode },
  });

  return (
    <ViewContainer
      title={region.name}
      description={`Administrative region in ${region.name} with statistics`}
    >
      <div className="space-y-6">
        <RegionOverview
          region={region}
          statistics={statistics}
          link={linkProvinces}
        />

        <RegionDetails region={region} link={linkCountry} />

        <RegionProvinces region={region} linkCallback={provinceLink} />
      </div>
    </ViewContainer>
  );
}
