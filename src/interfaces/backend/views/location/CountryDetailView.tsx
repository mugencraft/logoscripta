import type { LinkParams } from "@/ui/components/layout/types";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { CountryInformation } from "@/ui/components/location/country/CountryInformation";
import { CountryNavigation } from "@/ui/components/location/country/CountryNavigation";
import { CountryOverview } from "@/ui/components/location/country/CountryOverview";

import { Route } from "../../routes/location/countries.$countryCode";
import type { LocationTypes } from "./breadcrumbs";

export function CountryDetailView() {
  const country = Route.useLoaderData();

  const links: Record<Exclude<LocationTypes, "countries">, LinkParams> = {
    regions: {
      label: "Regions",
      link: {
        to: "/location/regions",
        search: { countryCode: country.code },
      },
    },
    provinces: {
      label: "Provinces",
      link: {
        to: "/location/provinces",
        search: { countryCode: country.code },
      },
    },
    communes: {
      label: "Communes",
      link: {
        to: "/location/communes",
        search: { countryCode: country.code },
      },
    },
  };

  return (
    <ViewContainer
      title={country.name}
      description={`${country.officialName} - Administrative country profile`}
    >
      <div className="space-y-6">
        <CountryOverview country={country} link={links.regions.link} />

        <CountryInformation country={country} />

        <CountryNavigation country={country} links={links} />
      </div>
    </ViewContainer>
  );
}
