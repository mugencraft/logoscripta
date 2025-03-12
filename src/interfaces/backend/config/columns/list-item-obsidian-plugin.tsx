import type { ListItemObsidianPlugin } from "@/interfaces/server-client";
import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import { GithubCell } from "@/ui/components/table/cells/GithubCell";
import { RelativeTimeCell } from "@/ui/components/table/cells/RelativeTimeCell";
import type { TableConfiguration } from "@/ui/components/table/types";
import _ from "lodash";
import { Bug, Eye, GitFork, GitMerge, Star } from "lucide-react";
import {
	baseTableFeatures,
	controlColumnGroup,
	getListSelection,
	getSystemTimestampColumns,
} from "./common";

export const obsidianPluginConfig: TableConfiguration<ListItemObsidianPlugin> =
	{
		columns: [
			controlColumnGroup,
			{
				id: "info",
				header: () => (
					<span className="inline-flex items-center -ml-2 pl-2 h-full w-[200px]">
						Plugin Details
					</span>
				),
				enableResizing: false,
				columns: [
					{
						id: "pluginAuthor",
						header: "Author",
						accessorFn: (row) => row.metadata?.plugin.author,
						cell: (info) => info.getValue<string>() || "-",
						filterFn: "includesString",
					},
					{
						id: "pluginName",
						header: "Name",
						accessorFn: (row) => row.metadata?.plugin.name,
						cell: (info) => info.getValue<string>() || "-",
						filterFn: "includesString",
					},
					{
						accessorKey: "fullName",
						header: "Repo Name",
						cell: (info) => <GithubCell fullName={info.getValue()} />,
						filterFn: "includesString",
					},
					{
						id: "description",
						accessorFn: (row) => row.repository?.description,
						header: "Description",
						cell: (info) => <BaseCell text={info.getValue()} lines="2" />,
						filterFn: "includesString",
						enableSorting: false,
					},
					{
						id: "downloads",
						header: "Downloads",
						accessorFn: (row) => row.metadata?.stats.downloads,
						cell: (info) => info.getValue<number>()?.toLocaleString() || "-",
						filterFn: "inNumberRange",
						enableGlobalFilter: false,
						enableResizing: false,
						size: 60,
					},
					{
						id: "lastUpdate",
						header: "Last Update",
						accessorFn: (row) => row.metadata?.stats.updated,
						cell: (info) => <RelativeTimeCell date={info.getValue() / 1000} />,
						filterFn: "dateRangeFilter",
						enableGlobalFilter: false,
						sortUndefined: "last",
						enableResizing: false,
						size: 100,
					},
					{
						id: "isLinked",
						accessorKey: "repositoryId",
						header: () => <IconTooltip icon={GitMerge} label="Repository ID" />,
						cell: (info) => <BooleanCell value={!!info.getValue<number>()} />,
						filterFn: "equals",
						enableResizing: false,
						size: 60,
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
				columns: getSystemTimestampColumns<ListItemObsidianPlugin>(),
			},
		],
		visibilityPresets: [
			{
				name: "Default",
				columns: {
					"select-col": true,
					pluginAuthor: true,
					pluginName: true,
					fullName: true,
					description: true,
					downloads: true,
					lastUpdate: true,
					isLinked: true,
					stargazersCount: true,
					forksCount: true,
					subscribersCount: true,
					openIssuesCount: true,
					createdAt: true,
					updatedAt: true,
				},
			},
			{
				name: "Compact",
				columns: {
					"select-col": true,
					fullName: true,
					downloads: true,
					lastUpdate: true,
				},
			},
		],
		features: baseTableFeatures,
		selection: getListSelection<ListItemObsidianPlugin>(),
	};
