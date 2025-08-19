import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import type { RepositoryList } from "@/domain/models/github/repository-list";
import type { RepositoryListWithItems } from "@/domain/models/github/types";

import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getListsTable: GetTableConfiguration<
  RepositoryList,
  RepositoryListWithItems
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "List Details",
      columns: [
        {
          id: "itemCount",
          header: "Items",
          accessorFn: (row) => row.items?.length || 0,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableSorting: true,
        },
        {
          accessorKey: "name",
          header: "Name",
          cell: (info) => {
            const list = info.row.original;
            const linkParam = list.sourceType || list.id.toString();
            return (
              <Link
                to="/github/lists/$listId"
                params={{ listId: linkParam }}
                className="font-medium hover:underline"
              >
                {info.getValue<string>()}
              </Link>
            );
          },
          filterFn: "includesString",
          enableSorting: true,
        },
        {
          accessorKey: "description",
          header: "Description",
          cell: (info) => <BaseCell value={info.getValue()} lines="2" />,
          filterFn: "includesString",
          enableSorting: true,
        },
      ],
    },
    {
      header: "Properties",
      columns: [
        {
          accessorKey: "sourceType",
          header: "Type",
          cell: (info) => {
            const sourceType = info.getValue<string>();
            return sourceType ? (
              <div className="text-sm font-medium">{sourceType}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Custom List</div>
            );
          },
          filterFn: "arrIncludesSome",
          enableSorting: true,
        },
        {
          id: "readOnly",
          accessorKey: "readOnly",
          header: () => <IconTooltip icon={Lock} label="Access Type" />,
          cell: (info) => (
            <div className="text-sm">
              {info.getValue<boolean>() ? "Read Only" : "Read/Write"}
            </div>
          ),
          filterFn: "equals",
          enableSorting: true,
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
        sourceType: true,
        readOnly: true,
        createdAt: true,
        itemCount: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        sourceType: true,
        itemCount: true,
      },
    },
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
