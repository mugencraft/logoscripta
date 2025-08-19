import type { RepositoryListItemArchived } from "@/domain/models/github/types";

import { DateCell } from "@/ui/components/table/cells/DateCell";
import { GithubCell } from "@/ui/components/table/cells/GithubCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getArchivedTable: GetTableConfiguration<
  RepositoryListItemArchived
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Archive Details",
      enableResizing: false,
      columns: [
        {
          accessorKey: "fullName",
          header: "Repo Name",
          cell: (info) => <GithubCell fullName={info.getValue()} />,
          filterFn: "includesString",
        },
        {
          id: "sourceType",
          header: "Original List",
          accessorFn: (row) => row.metadata.archived?.sourceType,
          cell: (info) => info.getValue<string>() || "-",
          filterFn: "arrIncludesSome",
        },
        {
          id: "reason",
          header: "Archive Reason",
          accessorFn: (row) => row.metadata.archived?.reason,
          cell: (info) => info.getValue<string>() || "-",
          filterFn: "arrIncludesSome",
        },
        {
          id: "archivedDate",
          header: "Archived On",
          accessorFn: (row) => row.metadata.archived?.removedAt,
          cell: (info) => <DateCell date={info.getValue()} />,
          filterFn: "dateRangeFilter",
          enableGlobalFilter: false,
          sortingFn: "datetime",
          sortDescFirst: true,
          enableResizing: false,
          size: 110,
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
        fullName: true,
        sourceType: true,
        reason: true,
        archivedDate: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        fullName: true,
        archivedDate: true,
      },
    },
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
