import {
	baseTableFeatures,
	controlColumnGroup,
} from "@/interfaces/backend/config/columns/common";
import type { Topic } from "@/interfaces/server-client";
import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import type { TableConfiguration } from "@/ui/components/table/types";
import { Hash } from "lucide-react";

export const topicsConfig: TableConfiguration<Topic> = {
	columns: [
		controlColumnGroup,
		{
			header: "Topic Details",
			columns: [
				{
					accessorKey: "topic",
					header: () => <IconTooltip icon={Hash} label="Topic Name" />,
					cell: (info) => (
						<div className="font-medium">{info.getValue<string>()}</div>
					),
					enableSorting: true,
					enableColumnFilter: true,
					filterFn: "includesString",
				},
				{
					accessorKey: "repositoryCount",
					header: "Repositories",
					cell: (info) => <DigitCell value={info.getValue<number>()} />,
					enableSorting: true,
					filterFn: "inNumberRange",
				},
			],
		},
	],
	visibilityPresets: [
		{
			name: "Default",
			columns: {
				"select-col": true,
				topic: true,
				repositoryCount: true,
			},
		},
		{
			name: "Compact",
			columns: {
				topic: true,
				repositoryCount: true,
			},
		},
	],
	features: baseTableFeatures,
	selection: {
		actions: [],
		getSelectedIds: (rows) => rows.map((row) => row.id),
	},
};
