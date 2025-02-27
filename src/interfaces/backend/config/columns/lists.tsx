import {
	baseTableFeatures,
	controlColumnGroup,
} from "@/interfaces/backend/config/columns/common";
import type { List } from "@/interfaces/server-client";
import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import { RelativeTimeCell } from "@/ui/components/table/cells/RelativeTimeCell";
import type { TableConfiguration } from "@/ui/components/table/types";
import { Link } from "@tanstack/react-router";
import { Calendar, Lock } from "lucide-react";

export const listsConfig: TableConfiguration<List, List> = {
	columns: [
		controlColumnGroup,
		{
			header: "List Details",
			columns: [
				{
					id: "itemCount",
					header: "Items",
					// @ts-expect-error
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
								to="/lists/$id"
								params={{ id: linkParam }}
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
					cell: (info) => <BaseCell text={info.getValue()} lines="2" />,
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
				{
					accessorKey: "createdAt",
					header: () => <IconTooltip icon={Calendar} label="Created Date" />,
					cell: (info) => <RelativeTimeCell date={info.getValue()} />,
					filterFn: "dateRangeFilter",
					enableSorting: true,
					sortingFn: "datetime",
				},
			],
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
	],
	features: baseTableFeatures,
	selection: {
		actions: [],
		getSelectedIds: (rows) => rows.map((row) => row.original),
	},
};
