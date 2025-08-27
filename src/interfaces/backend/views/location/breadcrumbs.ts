import type { LinkProps, RegisteredRouter } from "@tanstack/react-router";

import type { BreadcrumbItem } from "@/ui/components/layout/EntityBreadcrumb";

export type LocationTypes = "countries" | "regions" | "provinces" | "communes";

const LOCATION_ROUTES: Record<
  LocationTypes,
  (code: string) => LinkProps<RegisteredRouter["routeTree"]>
> = {
  countries: (countryCode) => ({
    to: "/location/countries/$countryCode",
    params: { countryCode },
  }),
  regions: (regionCode) => ({
    to: "/location/regions/$regionCode",
    params: { regionCode },
  }),
  provinces: (provinceCode) => ({
    to: "/location/provinces/$provinceCode",
    params: { provinceCode },
  }),
  communes: (communeCode) => ({
    to: "/location/communes/$communeCode",
    params: { communeCode },
  }),
};

export const parseBreadcrumbFromPath = (
  codesPath: string,
  namesPath: string,
  currentEntity?: { name: string; isActive?: boolean },
): BreadcrumbItem[] => {
  const codes = codesPath.split("/").filter(Boolean);
  const names = namesPath.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = codes.map((code, index) => {
    const level = getLevelFromPosition(index);

    if (!level) {
      return { label: names[index] || code, isActive: true };
    }

    const routeFactory = LOCATION_ROUTES[level];

    return {
      label: names[index] || code,
      link: routeFactory(code),
    };
  });

  if (currentEntity) {
    items.push({
      label: currentEntity.name,
      isActive: currentEntity.isActive ?? true,
    });
  }

  return items;
};

function getLevelFromPosition(index: number): LocationTypes | undefined {
  const levels: LocationTypes[] = [
    "countries",
    "regions",
    "provinces",
    "communes",
  ];
  return levels[index];
}
