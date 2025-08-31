import { Link } from "@tanstack/react-router";

import type { TaxonomySystem } from "@/domain/models/taxonomy/system";

import { Badge } from "@/ui/components/core/badge";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getTaxonomySystemsTable: GetTableConfiguration<TaxonomySystem> = (
  actions,
) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "System Details",
      columns: [
        {
          accessorKey: "name",
          header: "System Name",
          size: 200,
          enableSorting: true,
          cell: ({ row }) => (
            <div>
              <div className="font-medium">
                <Link
                  to="/taxonomy/systems/$systemId"
                  params={{ systemId: String(row.original.id) }}
                  className="hover:underline text-blue-600 dark:text-blue-400"
                >
                  {row.getValue("name")}
                </Link>
              </div>
              {row.original.label && (
                <div className="text-sm text-muted-foreground">
                  {row.original.label}
                </div>
              )}
            </div>
          ),
        },
        {
          accessorKey: "type",
          header: "Type",
          size: 100,
          enableSorting: true,
          cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
        },
        {
          accessorKey: "description",
          header: "Description",
          size: 300,
          enableSorting: false,
          cell: (info) => <BaseCell value={info.getValue()} />,
        },
        {
          accessorKey: "isActive",
          header: "Status",
          size: 80,
          enableSorting: true,
          cell: ({ row }) => (
            <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
              {row.getValue("isActive") ? "Active" : "Inactive"}
            </Badge>
          ),
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
        description: true,
        isActive: true,
        createdAt: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
