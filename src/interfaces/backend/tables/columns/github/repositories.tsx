import type { LinkProps, RegisteredRouter } from "@tanstack/react-router";
import {
  Archive,
  Ban,
  Bug,
  Download,
  Eye,
  GitFork,
  HardDrive,
  Info,
  Star,
} from "lucide-react";

import type { Repository } from "@/domain/models/github/repository";
import type {
  RepositoryExtended,
  RepositoryListItemArchived,
} from "@/domain/models/github/types";

import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { GithubCell } from "@/ui/components/github/table/GithubCell";
import { ListIdsCell } from "@/ui/components/github/table/ListIdsCell";
import { OwnerCell } from "@/ui/components/github/table/OwnerCell";
import { TopicsCell } from "@/ui/components/github/table/TopicsCell";
import { ArchivedCell } from "@/ui/components/table/cells/ArchivedCell";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import { LanguageCell } from "@/ui/components/table/cells/LanguageCell";
import { RelativeTimeCell } from "@/ui/components/table/cells/RelativeTimeCell";
import { SizeCell } from "@/ui/components/table/cells/SizeCell";
import { UrlCell } from "@/ui/components/table/cells/UrlCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import { getListItems } from "../../accessors/list-items";
import { getPluginInfo, getPluginStats } from "../../accessors/obsidian-plugin";
import { listIdsSort } from "../../sorting/list-ids";
import { topicsSort } from "../../sorting/topics";
import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

const listLink = (
  listId: string,
): LinkProps<RegisteredRouter["routeTree"]> => ({
  to: "/github/lists/$listId",
  params: { listId },
});

export const getRepositoriesTable: GetTableConfiguration<
  Repository,
  RepositoryExtended
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      id: "info",
      header: () => (
        <span className="inline-flex items-center -ml-2 pl-2 h-full w-[85px]">
          Info
        </span>
      ),
      enableResizing: false,
      columns: [
        {
          id: "owner",
          accessorFn: (row) => row.owner.login,
          header: "Owner",
          cell: (info) => (
            <OwnerCell owner={info.row.original.owner} column={info.column} />
          ),
          filterFn: "includesString",
          enableGlobalFilter: false,
        },
        {
          accessorKey: "fullName",
          header: "Name",
          cell: (info) => <GithubCell fullName={info.getValue()} />,
          filterFn: "includesString",
        },
        {
          id: "title",
          accessorFn: (row) => getPluginInfo(row)?.name || undefined, // sortUndefined
          header: "Title",
          cell: (info) => {
            const title = info.getValue();
            if (!title) return;
            const baseUrl =
              "https://www.moritzjung.dev/obsidian-stats/plugins/";
            const pluginId = getPluginInfo(info.row.original)?.id;

            return <UrlCell label={title} url={baseUrl + pluginId} />;
          },
          filterFn: "includesString",
          sortUndefined: "last",
        },
        {
          accessorKey: "description",
          header: "Description",
          cell: (info) => <BaseCell value={info.getValue()} lines="4" />,
          filterFn: "includesString",
          enableSorting: false,
        },
        {
          accessorKey: "homepage",
          header: "Homepage",
          cell: (info) => <UrlCell url={info.getValue()} />,
          enableColumnFilter: false,
        },
      ],
    },
    {
      header: "Taxonomies",
      enableResizing: false,
      columns: [
        {
          id: "topics",
          accessorFn: (row) => (row.topics.length ? row.topics : undefined), // sortUndefined
          header: () => "Topics",
          cell: (info) => (
            <TopicsCell topics={info.getValue()} column={info.column} />
          ),
          filterFn: "arrIncludesSome",
          sortingFn: topicsSort,
          sortUndefined: "last",
          size: 300,
        },
        {
          id: "listIds",
          accessorFn: getListItems,
          cell: (info) => (
            <ListIdsCell
              lists={info.getValue()}
              column={info.column}
              link={listLink(String(info.row.original.id))}
            />
          ),
          filterFn: "listIdsFilter",
          enableGlobalFilter: false,
          sortingFn: listIdsSort,
          sortUndefined: "last",
          size: 200,
        },
      ],
    },
    {
      header: "Metrics",
      enableResizing: false,
      columns: [
        {
          accessorKey: "stargazersCount",
          header: () => <IconTooltip icon={Star} label="Stargazers Count" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 60,
        },
        {
          accessorKey: "forksCount",
          header: () => <IconTooltip icon={GitFork} label="Fork Count" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 60,
        },
        {
          accessorKey: "subscribersCount",
          header: () => <IconTooltip icon={Eye} label="Watchers Count" />,
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 60,
        },
        {
          accessorKey: "openIssuesCount",
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
      header: "Tech",
      enableResizing: false,
      columns: [
        {
          id: "language",
          accessorFn: (row) => row.language || undefined, // sortUndefined
          header: "Language",
          cell: (info) => (
            <LanguageCell value={info.getValue()} column={info.column} />
          ),
          filterFn: "arrIncludesSome",
          enableGlobalFilter: false,
          sortUndefined: "last",
        },
        {
          id: "licenseName",
          accessorFn: (row) => row.licenseName || undefined, // sortUndefined
          header: "License",
          cell: (info) => <BaseCell value={info.getValue()} />,
          filterFn: "arrIncludesSome",
          enableGlobalFilter: false,
          sortUndefined: "last",
        },
        {
          accessorKey: "size",
          header: () => <IconTooltip icon={HardDrive} label="Size in Bytes" />,
          cell: (info) => <SizeCell bytes={info.getValue<number>()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          enableResizing: false,
        },
      ],
    },
    {
      header: "Obsidian",
      enableResizing: false,
      columns: [
        {
          id: "downloads",
          accessorFn: (row) => getPluginStats(row)?.downloads || undefined, // sortUndefined
          header: () => (
            <IconTooltip icon={Download} label="Plugin Downloads" />
          ),
          cell: (info) => <DigitCell value={info.getValue()} />,
          filterFn: "inNumberRange",
          enableGlobalFilter: false,
          sortUndefined: "last",
          enableResizing: false,
          size: 65,
        },
        {
          id: "lastPluginUpdate",
          accessorFn: (row) => getPluginStats(row)?.updated,
          header: "Version",
          cell: (info) => <RelativeTimeCell date={info.getValue() / 1000} />,
          filterFn: "dateRangeFilter",
          enableGlobalFilter: false,
          sortUndefined: "last",
          enableResizing: false,
          size: 100,
        },
      ],
    },
    {
      header: "Dates",
      enableResizing: false,
      columns: [
        {
          accessorKey: "updatedAt",
          header: "Updated",
          cell: (info) => <RelativeTimeCell date={info.getValue()} />,
          filterFn: "dateRangeFilter",
          enableGlobalFilter: false,
          sortingFn: "datetime",
          sortDescFirst: true,
          enableResizing: false,
          size: 100,
        },
        {
          accessorKey: "createdAt",
          header: "Created",
          cell: (info) => <DateCell date={info.getValue()} />,
          filterFn: "dateRangeFilter",
          enableGlobalFilter: false,
          sortingFn: "datetime",
          sortDescFirst: true,
          enableResizing: false,
          size: 110,
        },
        {
          accessorKey: "snapshotDate",
          header: "Snapshot",
          cell: (info) => <RelativeTimeCell date={info.getValue()} />,
          filterFn: "dateRangeFilter",
          enableGlobalFilter: false,
          sortingFn: "datetime",
          sortDescFirst: true,
          enableResizing: false,
          size: 100,
        },
      ],
    },
    {
      header: "Status",
      enableResizing: false,
      columns: [
        {
          accessorKey: "isDisabled",
          header: () => <IconTooltip icon={Ban} label="Is Disabled" />,
          cell: (info) => <BooleanCell value={info.getValue()} />,
          filterFn: "equals",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 50,
        },
        {
          accessorKey: "isArchived",
          header: () => <IconTooltip icon={Archive} label="Is Archived" />,
          cell: (info) => <BooleanCell value={info.getValue()} />,
          filterFn: "equals",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 50,
        },
        {
          id: "archiveReason",
          accessorFn: (row) => {
            const archivedItem = row.repositoryListItems?.find(
              (item) => item.metadata.system?.systemType === "archived",
            ) as RepositoryListItemArchived | undefined;
            return archivedItem?.metadata.archived?.reason;
          },
          header: () => <IconTooltip icon={Info} label="Archive Reason" />,
          cell: (info) => <ArchivedCell value={info.getValue()} />,
          filterFn: "includesString",
          enableGlobalFilter: false,
          enableResizing: false,
          size: 120,
        },
      ],
    },
  ],
  visibilityPresets: [
    {
      name: "All",
      columns: {
        "select-col": true,
        name: true,
        title: true,
        fullName: true,
        owner: true,
        description: true,
        homepage: true,
        stargazersCount: true,
        downloads: true,
        lastPluginUpdate: true,
        createdAt: true,
        updatedAt: true,
        snapshotDate: true,
        forksCount: true,
        subscribersCount: true,
        openIssuesCount: true,
        licenseName: true,
        size: true,
        isArchived: true,
        isDisabled: true,
        archiveReason: true,
        listIds: true,
        topics: true,
        language: true,
      },
    },
    {
      name: "Overview",
      columns: {
        "select-col": true,
        name: true,
        owner: true,
        description: true,
        stargazersCount: true,
        downloads: true,
        language: true,
        updatedAt: true,
      },
    },
    {
      name: "Plugin Stats",
      columns: {
        "select-col": true,
        title: true,
        owner: true,
        downloads: true,
        lastPluginUpdate: true,
        stargazersCount: true,
        openIssuesCount: true,
        updatedAt: true,
        subscribersCount: true,
        forksCount: true,
      },
    },
    {
      name: "Development",
      columns: {
        "select-col": true,
        name: true,
        language: true,
        openIssuesCount: true,
        forksCount: true,
        size: true,
        licenseName: true,
        updatedAt: true,
      },
    },
    {
      name: "Archive View",
      columns: {
        "select-col": true,
        name: true,
        isArchived: true,
        archiveReason: true,
        updatedAt: true,
      },
    },
    {
      name: "Community",
      columns: {
        "select-col": true,
        name: true,
        owner: true,
        stargazersCount: true,
      },
    },
    {
      name: "List Management",
      columns: {
        "select-col": true,
        name: true,
        listIds: true,
        isArchived: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        stargazersCount: true,
        downloads: true,
        language: true,
        updatedAt: true,
      },
    },
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
