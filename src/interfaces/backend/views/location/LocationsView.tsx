import { MapPin, Upload } from "lucide-react";

import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import {
  AdministrativeNavigation,
  type LocationLink,
} from "@/ui/components/location/AdministrativeNavigation";
import {
  type LocationAction,
  PoiActions,
} from "@/ui/components/location/poi/PoiActions";
import { LocationSync } from "@/ui/components/location/sync/LocationSync";

import { useImportExportActions } from "../../actions/location/useImportExportActions";
import { useSyncActions } from "../../actions/location/useSyncActions";

export function LocationsView() {
  const {
    previewCountriesSync,
    syncCountries,
    previewItalySync,
    syncItaly,
    isCountriesLoading,
    isItalyLoading,
    countriesError,
    italyError,
  } = useSyncActions();

  const { exportPOIs } = useImportExportActions();

  const quickActions: LocationAction[] = [
    {
      id: "manage-pois",
      title: "Manage Points of Interest",
      description: "Add, edit, and organize POIs within communes",
      icon: MapPin,
      href: "/location/pois",
    },
    {
      id: "import-export",
      title: "Import/Export POIs",
      description: "Bulk import POI data or export for backup",
      icon: Upload,
      action: () => exportPOIs(),
    },
  ];

  const links: LocationLink[] = [
    { path: "/location/countries", label: "Countries" },
    { path: "/location/regions", label: "Regions" },
    { path: "/location/provinces", label: "Provinces" },
    { path: "/location/communes", label: "Communes" },
  ];

  return (
    <ViewContainer
      title="Location Management"
      description="Manage geographic hierarchy and points of interest"
    >
      <div className="space-y-6">
        <LocationSync
          isCountriesLoading={isCountriesLoading}
          isItalyLoading={isItalyLoading}
          countriesError={countriesError?.message}
          italyError={italyError?.message}
          previewCountriesSync={previewCountriesSync}
          previewItalySync={previewItalySync}
          syncCountries={syncCountries}
          syncItaly={syncItaly}
        />

        <PoiActions quickActions={quickActions} />

        <AdministrativeNavigation links={links} />
      </div>
    </ViewContainer>
  );
}
