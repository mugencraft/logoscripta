import { Link } from "@tanstack/react-router";

import type { ContentCollection } from "@/domain/models/content/collection";
import type { ContentCollectionWithStats } from "@/domain/models/content/types";

import { Badge } from "@/ui/components/core/badge";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getCollectionsTable: GetTableConfiguration<
  ContentCollection,
  ContentCollectionWithStats
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Collection Details",
      columns: [
        {
          accessorKey: "name",
          header: "Collection Name",
          size: 200,
          enableSorting: true,
          cell: ({ row }) => (
            <div>
              <div className="font-medium">
                <Link
                  to={"/content/collections/$collectionId"}
                  params={{ collectionId: String(row.original.id) }}
                >
                  {row.getValue("name")}
                </Link>{" "}
                (
                <Link
                  to={"/content/collections/$collectionId/analysis"}
                  params={{ collectionId: String(row.original.id) }}
                >
                  Analysis
                </Link>
                )
              </div>
              {row.original.description && (
                <div className="text-sm text-muted-foreground">
                  {row.original.description}
                </div>
              )}
            </div>
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
          size: 300,
          enableSorting: false,
          enableColumnFilter: false,
          cell: (info) => <BaseCell value={info.getValue()} />,
        },
        {
          accessorKey: "type",
          header: "Type",
          size: 100,
          enableSorting: true,
          cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
        },
        {
          accessorKey: "sourcePath",
          header: "Source Path",
          size: 250,
          enableSorting: false,
          cell: (info) => {
            const sourcePath = info.getValue();
            return sourcePath ? (
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {sourcePath}
              </code>
            ) : (
              <span className="text-sm text-muted-foreground">N/A</span>
            );
          },
        },
      ],
    },
    {
      header: "Statistics",
      columns: [
        {
          header: "Items",
          accessorKey: "totalItems",
          size: 80,
          enableSorting: true,
          cell: ({ row }) => (
            <div className="text-center font-mono">
              <Link
                to={"/content/collections/$collectionId/items"}
                params={{ collectionId: String(row.original.id) }}
              >
                {row.getValue("totalItems")}
              </Link>
            </div>
          ),
        },
        {
          header: "Tagged",
          accessorKey: "totalTags",
          size: 80,
          enableSorting: true,
          cell: (info) => (
            <div className="text-center font-mono">{info.getValue()}</div>
          ),
        },
      ],
    },
    {
      header: "Timestamps",
      enableResizing: false,
      columns: [
        ...getSystemTimestampColumns(),
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
        description: true,
        sourcePath: true,
        createdAt: true,
        lastSyncAt: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        sourcePath: true,
        lastSyncAt: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
