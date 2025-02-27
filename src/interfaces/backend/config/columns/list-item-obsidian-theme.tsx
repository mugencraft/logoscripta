import {
	baseTableFeatures,
	controlColumnGroup,
	getListSelection,
	getSystemTimestampColumns,
} from "@/interfaces/backend/config/columns/common";
import type { ListItemObsidianTheme } from "@/interfaces/server-client";
import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { BooleanCell } from "@/ui/components/table/cells/BooleanCell";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import { GithubCell } from "@/ui/components/table/cells/GithubCell";
import { ImageCell } from "@/ui/components/table/cells/ImageCell";
import type { TableConfiguration } from "@/ui/components/table/types";
import _ from "lodash";
import { Bug, Eye, GitFork, GitMerge, Star } from "lucide-react";

const getPreviewUrl = (themeName: string, fullName: string) =>
	`https://raw.githubusercontent.com/${fullName}/HEAD/${themeName}`;

export const obsidianThemeConfig: TableConfiguration<
	ListItemObsidianTheme,
	string
> = {
	columns: [
		controlColumnGroup,
		{
			id: "info",
			header: () => (
				<span className="inline-flex items-center -ml-2 pl-2 h-full w-[200px]">
					Theme Details
				</span>
			),
			enableResizing: false,
			columns: [
				{
					id: "themeAuthor",
					header: "Author",
					accessorFn: (row) => row.metadata?.theme.author,
					cell: (info) => info.getValue<string>() || "-",
					filterFn: "includesString",
				},
				{
					id: "themeName",
					header: "Name",
					accessorFn: (row) => row.metadata?.theme.name,
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
					id: "modes",
					header: "Modes",
					accessorFn: (row) => row.metadata?.theme.modes,
					cell: (info) => {
						const modes = info.getValue<string[]>();
						return modes ? modes.join(", ") : "-";
					},
					filterFn: "arrIncludesSome",
					enableResizing: false,
					size: 100,
				},
				{
					id: "screenshot",
					header: "Preview",
					accessorFn: (row) => row.metadata?.theme.screenshot,
					cell: (info) => (
						<ImageCell
							src={getPreviewUrl(info.getValue(), info.row.original.fullName)}
							alt="Preview"
						/>
					),
					enableSorting: false,
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
			columns: getSystemTimestampColumns<ListItemObsidianTheme>(),
		},
	],
	visibilityPresets: [
		{
			name: "Default",
			columns: {
				"select-col": true,
				themeAuthor: true,
				themeName: true,
				fullName: true,
				modes: true,
				screenshot: true,
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
				themeName: true,
			},
		},
	],
	features: baseTableFeatures,
	selection: getListSelection<ListItemObsidianTheme>(),
};
