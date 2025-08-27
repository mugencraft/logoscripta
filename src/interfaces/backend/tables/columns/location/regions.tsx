import { Link } from "@tanstack/react-router";

import type { Region } from "@/domain/models/location/region";
import type { RegionWithStats } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

export const getRegionsTable: GetTableConfiguration<Region, RegionWithStats> = (
  actions,
) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Region Details",
      columns: [
        {
          accessorKey: "name",
          header: "Region",
          size: 200,
          enableSorting: true,
          cell: ({ row }) => (
            <div>
              <div className="font-medium">
                <Link
                  to={"/location/regions/$regionCode"}
                  params={{ regionCode: row.original.code }}
                  className="hover:underline"
                >
                  {row.getValue("name")}
                </Link>
              </div>
              <div className="text-xs text-muted-foreground">
                Code: {row.original.code}
              </div>
            </div>
          ),
        },
        {
          accessorKey: "countryCode",
          header: "Country",
          size: 100,
          enableSorting: true,
          cell: ({ row }) => (
            <Link
              to={"/location/countries/$countryCode"}
              params={{ countryCode: row.original.countryCode }}
              className="text-blue-600 hover:underline"
            >
              <Badge variant="outline" className="font-mono">
                {row.getValue("countryCode")}
              </Badge>
            </Link>
          ),
        },
        {
          accessorKey: "nuts1Code",
          header: "NUTS1",
          size: 80,
          enableSorting: false,
          cell: (info) => (
            <span className="font-mono text-xs">{info.getValue() || "—"}</span>
          ),
        },
      ],
    },
    {
      header: "Administrative Statistics",
      columns: [
        {
          header: "Provinces",
          accessorKey: "provincesCount",
          size: 80,
          enableSorting: true,
          cell: ({ row }) => (
            <Link
              to={"/location/provinces"}
              search={{ regionCode: row.original.code }}
              className="text-center font-mono hover:underline"
            >
              {row.getValue("provincesCount")}
            </Link>
          ),
        },
        {
          header: "Communes",
          accessorKey: "communesCount",
          size: 80,
          enableSorting: true,
          cell: (info) => (
            <div className="text-center font-mono">{info.getValue()}</div>
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
        countryCode: true,
        provincesCount: true,
        communesCount: true,
        lastSyncAt: true,
      },
    },
    {
      name: "Statistics",
      columns: {
        "select-col": true,
        name: true,
        provincesCount: true,
        communesCount: true,
        poisCount: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
