import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";

import type { Commune } from "@/domain/models/location/commune";
import type { CommuneWithStats } from "@/domain/models/location/types";

import { Badge } from "@/ui/components/core/badge";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

export const getCommunesTable: GetTableConfiguration<
  Commune,
  CommuneWithStats
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Commune Details",
      columns: [
        {
          accessorKey: "name",
          header: "Commune",
          size: 200,
          enableSorting: true,
          filterFn: "includesString",
          cell: ({ row }) => (
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={"/location/communes/$communeCode"}
                  params={{ communeCode: row.original.code }}
                  className="font-medium hover:underline"
                >
                  {row.getValue("name")}
                </Link>
                {row.original.isCapital && (
                  <Crown className="h-3 w-3 text-amber-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {row.original.code}
                {row.original.cadastralCode &&
                  ` • ${row.original.cadastralCode}`}
              </div>
            </div>
          ),
        },
        {
          accessorKey: "provinceName",
          header: "Province",
          size: 150,
          enableSorting: true,
          cell: ({ row }) => (
            <Link
              to={"/location/provinces/$provinceCode"}
              params={{ provinceCode: row.original.provinceCode }}
              className="text-blue-600 hover:underline"
            >
              {row.getValue("provinceName")}
            </Link>
          ),
        },
        {
          accessorKey: "regionName",
          header: "Region",
          size: 120,
          enableSorting: true,
          cell: (info) => (
            <span className="text-sm text-muted-foreground">
              {info.getValue()}
            </span>
          ),
        },
      ],
    },
    {
      header: "Statistics",
      columns: [
        {
          header: "POIs",
          accessorKey: "poisCount",
          size: 80,
          enableSorting: true,
          cell: ({ row }) => (
            <Link
              to={"/location/pois"}
              search={{ communeCode: row.original.code }}
              className="text-center font-mono hover:underline"
            >
              {row.getValue("poisCount")}
            </Link>
          ),
        },
      ],
    },
    {
      header: "Administrative Codes",
      columns: [
        {
          accessorKey: "nuts1Code",
          header: "NUTS1",
          size: 80,
          enableSorting: false,
          cell: (info) => (
            <span className="font-mono text-xs">{info.getValue() || "—"}</span>
          ),
        },
        {
          accessorKey: "nuts3Code",
          header: "NUTS3",
          size: 80,
          enableSorting: false,
          cell: (info) => (
            <span className="font-mono text-xs">{info.getValue() || "—"}</span>
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
        provinceName: true,
        poisCount: true,
        lastSyncAt: true,
      },
    },
    {
      name: "Hierarchical",
      columns: {
        "select-col": true,
        name: true,
        provinceName: true,
        regionName: true,
        poisCount: true,
      },
    },
    {
      name: "Administrative",
      columns: {
        "select-col": true,
        name: true,
        nuts1Code: true,
        nuts3Code: true,
        sourceId: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
