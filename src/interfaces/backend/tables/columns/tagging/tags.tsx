import { Zap } from "lucide-react";

import type { Tag } from "@/domain/models/tagging/tag";
import type { TagWithStats } from "@/domain/models/tagging/types";

import { Badge } from "@/ui/components/core/badge";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getTagsTable: GetTableConfiguration<Tag, TagWithStats> = (
  actions,
) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Tag Details",
      columns: [
        {
          accessorKey: "name",
          header: "Tag Name",
          size: 150,
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {row.getValue("name")}
              </Badge>
              {row.getValue<boolean>("isQuickSelection") && (
                <Zap className="h-3 w-3 text-amber-500" />
              )}
            </div>
          ),
        },
        {
          accessorKey: "label",
          header: "Label",
          size: 150,
          cell: (info) => (
            <BaseCell value={info.getValue()} noneText="Same as name" />
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
          size: 250,
          enableSorting: false,
          enableColumnFilter: false,
          cell: (info) => <BaseCell value={info.getValue()} />,
        },
      ],
    },
    {
      header: "Properties",
      columns: [
        {
          accessorKey: "isQuickSelection",
          header: "Quick",
          size: 80,
          cell: ({ row }) => (
            <BaseCell
              centered
              value={
                row.getValue("isQuickSelection") ? (
                  <Zap className="h-4 w-4 text-amber-500 mx-auto" />
                ) : null
              }
            />
          ),
        },
        {
          header: "Usage",
          accessorKey: "usageCount",
          size: 80,
          cell: (info) => (
            <BaseCell centered value={info.getValue<number>()} noneText="0" />
          ),
        },
        {
          header: "Categories",
          accessorKey: "categoryCount",
          size: 80,
          cell: (info) => (
            <BaseCell centered value={info.getValue<number>()} noneText="0" />
          ),
        },
        {
          header: "Systems",
          accessorKey: "systemCount",
          size: 80,
          cell: (info) => (
            <BaseCell centered value={info.getValue<number>()} noneText="0" />
          ),
        },
      ],
    },
    {
      header: "Validation",
      columns: [
        {
          id: "isDisabled",
          header: "Disabled",
          accessorFn: (row) => !!row.metadata.validation?.isDisabled,
          size: 80,
          cell: (info) => <BooleanCell value={info.getValue()} />,
        },
        {
          id: "isDeprecated",
          header: "Deprecated",
          accessorFn: (row) => !!row.metadata.validation?.isDeprecated,
          size: 80,
          cell: (info) => <BooleanCell value={info.getValue()} />,
        },
        {
          id: "replacedBy",
          header: "Replaced",
          accessorFn: (row) => row.metadata.validation?.replacedBy,
          size: 80,
          cell: (info) => <BaseCell value={info.getValue()} />,
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
        label: true,
        description: true,
        isQuickSelection: true,
        relationshipCount: true,
        usageCount: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        label: true,
        isQuickSelection: true,
        usageCount: true,
      },
    },
    {
      name: "Management",
      columns: {
        "select-col": true,
        name: true,
        isQuickSelection: true,
        relationshipCount: true,
      },
    },
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
