import { Bug, Eye, GitFork, GitMerge, Sparkles, Star } from "lucide-react";

import type { RepositoryListItem } from "@/domain/models/github/repository-list";
import type { RepositoryListItemWithRelations } from "@/domain/models/github/types";

import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import { GithubCell } from "@/ui/components/table/cells/GithubCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

export const getListItemsTable: GetTableConfiguration<
  RepositoryListItem,
  RepositoryListItemWithRelations
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      id: "info",
      header: () => (
        <span className="inline-flex items-center -ml-2 pl-2 h-full w-[200px]">
          Repository Details
        </span>
      ),
      enableResizing: false,
      columns: [
        {
          id: "isLinked",
          accessorKey: "repositoryId",
          header: () => <IconTooltip icon={GitMerge} label="Repository ID" />,
          cell: (info) => <BooleanCell value={!!info.getValue<number>()} />,
          filterFn: "equals",
        },
        {
          accessorKey: "fullName",
          header: "Name",
          cell: (info) => <GithubCell fullName={info.getValue()} />,
          filterFn: "includesString",
        },
        {
          id: "description",
          accessorFn: (row) => row.repository?.description,
          header: "Description",
          cell: (info) => <BaseCell value={info.getValue()} lines="2" />,
          filterFn: "includesString",
          enableSorting: false,
        },
      ],
    },
    {
      header: "Metadata",
      enableResizing: false,
      columns: [
        {
          id: "rating",
          accessorFn: (row) => row.metadata.user?.rating,
          header: () => <IconTooltip icon={Sparkles} label="Rating" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 60,
        },
        {
          id: "category",
          accessorFn: (row) => row.metadata.user?.category,
          header: "Category",
          cell: (info) => <BaseCell value={info.getValue()} />,
          filterFn: "arrIncludesSome",
        },
        {
          id: "notes",
          accessorFn: (row) => row.metadata.user?.notes,
          header: "Notes",
          cell: (info) => <BaseCell value={info.getValue()} lines="2" />,
          filterFn: "includesString",
        },
        {
          id: "tags",
          accessorFn: (row) => row.metadata.user?.tags,
          header: "Tags",
          cell: (info) => <BaseCell value={info.getValue()?.join(", ")} />,
          filterFn: "arrIncludesSome",
        },
        {
          id: "status",
          accessorFn: (row) => row.metadata.user?.status,
          header: "Status",
          cell: (info) => <BaseCell value={info.getValue()} />,
          filterFn: "arrIncludesSome",
          enableGlobalFilter: false,
        },
      ],
    },
    {
      header: "Metrics",
      enableResizing: false,
      columns: [
        {
          id: "stargazersCount",
          accessorFn: (row) => row.repository?.stargazersCount,
          header: () => <IconTooltip icon={Star} label="Stargazers Count" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 60,
        },
        {
          id: "forksCount",
          accessorFn: (row) => row.repository?.forksCount,
          header: () => <IconTooltip icon={GitFork} label="Fork Count" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 60,
        },
        {
          id: "subscribersCount",
          accessorFn: (row) => row.repository?.subscribersCount,
          header: () => <IconTooltip icon={Eye} label="Watchers Count" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 60,
        },
        {
          id: "openIssuesCount",
          accessorFn: (row) => row.repository?.openIssuesCount,
          header: () => <IconTooltip icon={Bug} label="Open Issues Count" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          invertSorting: true,
          enableResizing: false,
          size: 60,
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
        edit: true,
        fullName: true,
        isLinked: true,
        description: true,
        stargazersCount: true,
        forksCount: true,
        subscribersCount: true,
        openIssuesCount: true,
        addedAt: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        edit: true,
        fullName: true,
        stargazersCount: true,
        addedAt: true,
      },
    },
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
