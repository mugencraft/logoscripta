import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { EntityBreadcrumb } from "@/ui/components/layout/EntityBreadcrumb";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { PoiDetails } from "@/ui/components/location/poi/PoiDetails";
import { PoiHistorical } from "@/ui/components/location/poi/PoiHistorical";
import { SystemMetadata } from "@/ui/components/metadata/SystemMetadata";

import { POIForm } from "../../actions/location/forms/POIForm";
import { Route } from "../../routes/location/pois.$poiId";
import { parseBreadcrumbFromPath } from "./breadcrumbs";

export function POIDetailView() {
  const poi = Route.useLoaderData();
  const [isEditMode, setIsEditMode] = useState(false);
  // TODO: implement update in form
  // const { handleUpdate } = usePOIActions({isDetailView: true, callbacks: {
  //   onSuccess: () => setIsEditMode(false),
  // }});

  const breadcrumbItems = parseBreadcrumbFromPath(
    poi.codesPath,
    poi.namesPath,
    {
      name: poi.name,
      isActive: true,
    },
  );

  return (
    <ViewContainer
      title={poi.name}
      description={`${poi.type} in ${poi.namesPath}`}
    >
      {isEditMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit POI</CardTitle>
            <CardDescription>Update point of interest details</CardDescription>
          </CardHeader>
          <CardContent>
            <POIForm
              mode="edit"
              data={poi}
              onSuccess={() => setIsEditMode(false)}
              onCancel={() => setIsEditMode(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <EntityBreadcrumb items={breadcrumbItems} />

          <PoiDetails poi={poi} setIsEditMode={setIsEditMode} />

          <PoiHistorical poi={poi} />

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemMetadata metadata={poi.metadata} />
            </CardContent>
          </Card>
        </div>
      )}
    </ViewContainer>
  );
}
