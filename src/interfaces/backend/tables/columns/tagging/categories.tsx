import type { TagCategory } from "@/domain/models/tagging/category";
import type { TagCategoryWithStats } from "@/domain/models/tagging/types";

import { Badge } from "@/ui/components/core/badge";
import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import { IconCell } from "@/ui/components/table/cells/IconCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getTagCategoriesTable: GetTableConfiguration<
  TagCategory,
  TagCategoryWithStats
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),

    {
      header: "Category Details",
      columns: [
        {
          accessorKey: "groupName",
          header: "Group",
          size: 100,
          filterFn: "includesString",
          cell: (info) => (
            <div className="text-center font-mono">{info.getValue()}</div>
          ),
        },
        {
          accessorKey: "name",
          header: "Category Name",
          size: 150,
          cell: ({ row }) => (
            <code className="px-2 py-1 bg-muted text-sm rounded">
              {row.getValue("name")}
            </code>
          ),
        },
        {
          accessorKey: "label",
          header: "Label",
          size: 200,
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
          size: 250,
          enableSorting: false,
          enableColumnFilter: false,
        },
        {
          accessorKey: "systemId",
          header: "System",
          size: 100,
          enableSorting: false,
          cell: (info) => (
            <div className="text-center font-mono">{info.getValue()}</div>
          ),
        },
      ],
    },
    {
      header: "Rules",
      columns: [
        {
          header: "One of Kind",
          accessorFn: (row) => row.metadata.rules?.oneOfKind,
          cell: (info) => <BooleanCell value={info.getValue()} />,
        },
        {
          header: "Toggled By",
          accessorFn: (row) => row.metadata.rules?.toggledBy,
          cell: (info) =>
            info.getValue() ? (
              <Badge variant="outline" className="text-xs">
                {info.getValue()}
              </Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            ),
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
          header: "Layout",
          size: 100,
          accessorFn: (row) => row.metadata.display?.layoutType,
          cell: (info) => (
            <div className="text-center font-mono">
              {info.getValue() || "-"}
            </div>
          ),
        },
        {
          header: "Color",
          size: 80,
          accessorFn: (row) => row.metadata.display?.color,
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
        name: true,
        label: true,
        description: true,
        oneOfKind: true,
        tagCount: true,
        quickSelectionCount: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        label: true,
        tagCount: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
