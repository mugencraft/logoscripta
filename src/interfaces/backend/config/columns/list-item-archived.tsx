import type { ListItemArchived } from "@/interfaces/server-client";
import { DateCell } from "@/ui/components/table/cells/DateCell";
import { GithubCell } from "@/ui/components/table/cells/GithubCell";
import type { TableConfiguration } from "@/ui/components/table/types";
import _ from "lodash";
import {
	baseTableFeatures,
	controlColumnGroup,
	getListSelection,
} from "./common";

export const archivedConfig: TableConfiguration<ListItemArchived> = {
	columns: [
		controlColumnGroup,
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
					accessorFn: (row) => row.metadata?.archived.sourceType,
					cell: (info) => info.getValue<string>() || "-",
					filterFn: "arrIncludesSome",
				},
				{
					id: "reason",
					header: "Archive Reason",
					accessorFn: (row) => row.metadata?.archived.reason,
					cell: (info) => info.getValue<string>() || "-",
					filterFn: "arrIncludesSome",
				},
				{
					id: "archivedDate",
					header: "Archived On",
					accessorFn: (row) => row.metadata?.archived.removedAt,
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
	],
	features: baseTableFeatures,
	selection: getListSelection<ListItemArchived>(),
};
