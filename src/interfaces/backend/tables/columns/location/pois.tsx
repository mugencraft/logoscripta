import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import type { POI } from "@/domain/models/location/poi";
import type { POIWithLocation } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getPOIsTable: GetTableConfiguration<POI, POIWithLocation> = (
  actions,
) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "POI Details",
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          size: 200,
          enableSorting: true,
          cell: ({ row }) => (
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <Link
                  to={"/location/pois/$poiId"}
                  params={{ poiId: String(row.original.id) }}
                  className="font-medium hover:underline"
                >
                  {row.getValue("name")}
                </Link>
              </div>
              {row.original.address && (
                <div className="text-xs text-muted-foreground mt-1">
                  {row.original.address}
                </div>
              )}
            </div>
          ),
        },
        {
          accessorKey: "type",
          header: "Type",
          size: 120,
          enableSorting: true,
          enableColumnFilter: true,
          cell: ({ row }) => {
            const type = row.getValue("type") as string;
            // Color coding based on POI type for better visual distinction
            const getVariant = (type: string) => {
              switch (type) {
                case "museum":
                case "cultural":
                  return "default";
                case "restaurant":
                  return "secondary";
                case "landmark":
                case "church":
                  return "outline";
                default:
                  return "outline";
              }
            };
            return (
              <Badge variant={getVariant(type)} className="capitalize">
                {type}
              </Badge>
            );
          },
        },
      ],
    },
    {
      header: "Location Hierarchy",
      columns: [
        {
          accessorKey: "communeName",
          header: "Commune",
          size: 150,
          enableSorting: true,
          enableColumnFilter: true,
          cell: ({ row }) => (
            <Link
              to={"/location/communes/$communeCode"}
              params={{ communeCode: row.original.communeCode }}
              className="text-blue-600 hover:underline text-sm"
            >
              {row.getValue("communeName")}
            </Link>
          ),
        },
        {
          accessorKey: "provinceName",
          header: "Province",
          size: 120,
          enableSorting: true,
          cell: (info) => (
            <span className="text-sm text-muted-foreground">
              {info.getValue()}
            </span>
          ),
        },
        {
          accessorKey: "regionName",
          header: "Region",
          size: 100,
          enableSorting: true,
          cell: (info) => (
            <span className="text-xs text-muted-foreground">
              {info.getValue()}
            </span>
          ),
        },
      ],
    },
    {
      header: "Geographic Coordinates",
      columns: [
        {
          accessorKey: "latitude",
          header: "Lat",
          size: 80,
          enableSorting: false,
          cell: (info) => {
            const lat = info.getValue() as number | null;
            return lat ? (
              <span className="font-mono text-xs">{lat.toFixed(4)}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            );
          },
        },
        {
          accessorKey: "longitude",
          header: "Lng",
          size: 80,
          enableSorting: false,
          cell: (info) => {
            const lng = info.getValue() as number | null;
            return lng ? (
              <span className="font-mono text-xs">{lng.toFixed(4)}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            );
          },
        },
      ],
    },
    {
      header: "Timestamps",
      enableResizing: false,
      columns: getSystemTimestampColumns(),
    },
  ],
  features: baseTableFeatures,
  visibilityPresets: [
    {
      name: "Default",
      columns: {
        "select-col": true,
        name: true,
        type: true,
        communeName: true,
        provinceName: true,
        updatedAt: true,
      },
    },
    {
      name: "Geographic",
      columns: {
        "select-col": true,
        name: true,
        type: true,
        latitude: true,
        longitude: true,
        communeName: true,
      },
    },
    {
      name: "Hierarchical",
      columns: {
        "select-col": true,
        name: true,
        type: true,
        communeName: true,
        provinceName: true,
        regionName: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
