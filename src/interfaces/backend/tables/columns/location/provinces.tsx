import { Link } from "@tanstack/react-router";

import type { Province } from "@/domain/models/location/province";
import type { ProvinceWithStats } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

export const getProvincesTable: GetTableConfiguration<
  Province,
  ProvinceWithStats
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Province Details",
      columns: [
        {
          accessorKey: "name",
          header: "Province",
          size: 200,
          enableSorting: true,
          cell: ({ row }) => (
            <div>
              <div className="font-medium">
                <Link
                  to={"/location/provinces/$provinceCode"}
                  params={{ provinceCode: row.original.code }}
                  className="hover:underline"
                >
                  {row.getValue("name")}
                </Link>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {row.original.code}
                {row.original.abbreviation && ` • ${row.original.abbreviation}`}
              </div>
            </div>
          ),
        },
        {
          accessorKey: "regionName",
          header: "Region",
          size: 150,
          enableSorting: true,
          cell: ({ row }) => (
            <Link
              to={"/location/regions/$regionCode"}
              params={{ regionCode: row.original.regionCode }}
              className="text-blue-600 hover:underline"
            >
              {row.getValue("regionName")}
            </Link>
          ),
        },
        {
          accessorKey: "capital",
          header: "Capital",
          size: 120,
          enableSorting: false,
          cell: (info) => (
            <span className="text-sm">{info.getValue() || "—"}</span>
          ),
        },
      ],
    },
    {
      header: "Administrative Statistics",
      columns: [
        {
          header: "Communes",
          accessorKey: "communesCount",
          size: 80,
          enableSorting: true,
          cell: ({ row }) => (
            <Link
              to={"/location/communes"}
              search={{ provinceCode: row.original.code }}
              className="text-center font-mono hover:underline"
            >
              {row.getValue("communesCount")}
            </Link>
          ),
        },
        {
          header: "POIs",
          accessorKey: "poisCount",
          size: 80,
          enableSorting: true,
          cell: (info) => (
            <div className="text-center font-mono">{info.getValue()}</div>
          ),
        },
      ],
    },
    {
      header: "Sync Info",
      columns: [
        {
          accessorKey: "sourceId",
          header: "Source",
          size: 100,
          enableSorting: false,
          cell: (info) => (
            <Badge variant="secondary" className="text-xs">
              {info.getValue()}
            </Badge>
          ),
        },
        {
          accessorKey: "lastSyncAt",
          header: "Last Sync",
          size: 120,
          enableSorting: true,
          cell: ({ row }) => {
            const lastSync = row.getValue("lastSyncAt") as string;
            return lastSync ? (
              <DateCell date={new Date(lastSync)} />
            ) : (
              <span className="text-sm text-muted-foreground">Never</span>
            );
          },
        },
      ],
    },
  ],
  features: baseTableFeatures,
  visibilityPresets: [
    {
      name: "Default",
      columns: {
        "select-col": true,
        name: true,
        regionName: true,
        communesCount: true,
        lastSyncAt: true,
      },
    },
    {
      name: "Administrative",
      columns: {
        "select-col": true,
        name: true,
        regionName: true,
        capital: true,
        communesCount: true,
        poisCount: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
