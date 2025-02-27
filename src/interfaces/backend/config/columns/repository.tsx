import { getArchiveMetadata } from "@/interfaces/backend/config/accessors/archived";
import { getListItems } from "@/interfaces/backend/config/accessors/list-items";
import {
	getPluginInfo,
	getPluginStats,
} from "@/interfaces/backend/config/accessors/obsidian-plugin";
import {
	controlColumnGroup,
	getListSelection,
} from "@/interfaces/backend/config/columns/common";
import { baseTableFeatures } from "@/interfaces/backend/config/columns/common";
import { listIdsSort } from "@/interfaces/backend/config/sorting/list-ids";
import { topicsSort } from "@/interfaces/backend/config/sorting/topics";
import type { RepositoryExtended } from "@/interfaces/server-client";
import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { ArchivedCell } from "@/ui/components/table/cells/ArchivedCell";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import { GithubCell } from "@/ui/components/table/cells/GithubCell";
import { LanguageCell } from "@/ui/components/table/cells/LanguageCell";
import { ListIdsCell } from "@/ui/components/table/cells/ListIdsCell";
import { OwnerCell } from "@/ui/components/table/cells/OwnerCell";
import { RelativeTimeCell } from "@/ui/components/table/cells/RelativeTimeCell";
import { SizeCell } from "@/ui/components/table/cells/SizeCell";
import { TopicsCell } from "@/ui/components/table/cells/TopicsCell";
import { UrlCell } from "@/ui/components/table/cells/UrlCell";
import type { TableConfiguration } from "@/ui/components/table/types";
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

export const repositoryConfig: TableConfiguration<RepositoryExtended, string> =
	{
		columns: [
			controlColumnGroup,
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
						cell: (info) => <BaseCell text={info.getValue()} />,
						filterFn: "includesString",
						sortUndefined: "last",
					},
					{
						accessorKey: "description",
						header: "Description",
						cell: (info) => <BaseCell text={info.getValue()} lines="4" />,
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
							<ListIdsCell lists={info.getValue()} column={info.column} />
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
						cell: (info) => <BaseCell text={info.getValue()} />,
						filterFn: "arrIncludesSome",
						enableGlobalFilter: false,
						sortUndefined: "last",
					},
					{
						accessorKey: "size",
						header: () => (
							<IconTooltip icon={HardDrive} label="Size in Bytes" />
						),
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
						accessorFn: (row) =>
							getArchiveMetadata(row.repositoryListItems)?.reason,
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
		],
		features: baseTableFeatures,
		selection: getListSelection(),
	};
