import { Link } from "@tanstack/react-router";

import type { TagSystem } from "@/domain/models/tagging/system";
import type { TagSystemWithStats } from "@/domain/models/tagging/types";

import { Badge } from "@/ui/components/core/badge";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getTagSystemsTable: GetTableConfiguration<
  TagSystem,
  TagSystemWithStats
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "System Details",
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          size: 200,
          enableSorting: true,
          cell: ({ row }) => (
            <Link
              to="/tagging/systems/$systemId"
              params={{ systemId: row.original.id.toString() }}
            >
              <span className="font-medium">{row.getValue("name")}</span>
            </Link>
          ),
        },
        {
          accessorKey: "label",
          header: "Label",
          size: 200,
          cell: (info) => (
            <div className="flex items-center gap-2">
              <span className="font-medium">{info.getValue()}</span>
            </div>
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
          size: 300,
          enableSorting: false,
        },
        {
          id: "version",
          accessorFn: (row) => row.metadata.system.version,
          header: "Version",
          size: 100,
          enableSorting: true,
          cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
        },
      ],
    },
    {
      header: "Statistics",
      columns: [
        {
          accessorKey: "totalGroups",
          header: "Groups",
          size: 80,
          enableSorting: true,
          cell: (info) => (
            <div className="text-center font-mono">
              {info.getValue<number>()}
            </div>
          ),
        },
        {
          header: "Categories",
          accessorKey: "totalCategories",
          size: 100,
          enableSorting: true,
          cell: (info) => (
            <div className="text-center font-mono">
              {info.getValue<number>()}
            </div>
          ),
        },
        {
          header: "Tags",
          size: 80,
          accessorKey: "totalTags",
          enableSorting: true,
          cell: (info) => (
            <div className="text-center font-mono">
              {info.getValue<number>()}
            </div>
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
  visibilityPresets: [
    {
      name: "Default",
      columns: {
        "select-col": true,
        name: true,
        description: true,
        version: true,
        createdAt: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        version: true,
      },
    },
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
