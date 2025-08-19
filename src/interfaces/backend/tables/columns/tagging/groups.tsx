import type { TagGroup } from "@/domain/models/tagging/group";
import type { TagGroupWithStats } from "@/domain/models/tagging/types";

import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import { IconCell } from "@/ui/components/table/cells/IconCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getTagGroupsTable: GetTableConfiguration<
  TagGroup,
  TagGroupWithStats
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Group Details",
      columns: [
        {
          accessorKey: "systemName",
          header: "System",
          size: 100,
          cell: (info) => (
            <div className="text-center font-mono">{info.getValue()}</div>
          ),
        },
        {
          accessorKey: "name",
          header: "Group Name",
          cell: ({ row }) => (
            <code className="px-2 py-1 bg-muted text-sm rounded">
              {row.getValue("name")}
            </code>
          ),
        },
        {
          accessorKey: "label",
          header: "Label",
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <IconCell name={row.original.metadata.display?.icon} />
              <span className="font-medium">{row.getValue("label")}</span>
            </div>
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
          size: 500,
          enableSorting: false,
          enableColumnFilter: false,
        },
      ],
    },
    {
      header: "Display",
      columns: [
        {
          header: "Order",
          accessorFn: (row) => row.metadata.display?.order,
          size: 50,
          cell: (info) => (
            <div className="text-center font-mono">
              {info.getValue() || "-"}
            </div>
          ),
        },
        {
          header: "V.",
          accessorFn: (row) => !!row.metadata.display?.visualizer,
          size: 50,
          cell: (info) => <BooleanCell value={info.getValue()} />,
        },
        {
          header: "Color",
          accessorFn: (row) => !!row.metadata.display?.color,
          size: 80,
          cell: (info) => (
            <div className="text-center font-mono">
              {info.getValue() || "-"}
            </div>
          ),
        },
      ],
    },
    {
      header: "Statistics",
      columns: [
        {
          accessorKey: "totalCategories",
          header: "Cat",
          size: 50,
          cell: (info) => (
            <div className="text-center font-mono">
              {info.getValue<number>()}
            </div>
          ),
        },
        {
          header: "Total Tags",
          accessorKey: "totalTags",
          size: 50,
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
  features: baseTableFeatures,
  visibilityPresets: [
    {
      name: "Default",
      columns: {
        "select-col": true,
        label: true,
        description: true,
        categoryCount: true,
        tagCount: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        label: true,
        categoryCount: true,
        tagCount: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
