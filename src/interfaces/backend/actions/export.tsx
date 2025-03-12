import type { DownloadOptions } from "@/core/serialization/export";
import type { ActionConfig } from "@/ui/components/actions/types";
import { ExportMenu } from "@/ui/components/table/controls/data-export/ExportMenu";
import { Download } from "lucide-react";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const createExportActions = <TData extends Record<string, any>>(
	defaultOptions: DownloadOptions = {},
) => {
	const actions: ActionConfig<TData>[] = [
		{
			id: "export-data",
			label: "Export",
			icon: Download,
			contexts: ["view", "selection"],
			dialog: {
				title: "Export Data",
				content: ({ data, selected, onSuccess, table }) => (
					<ExportMenu
						data={selected || (data ? [data] : [])}
						fileName={defaultOptions.fileName}
						table={table}
						onComplete={onSuccess}
					/>
				),
			},
		},
	];

	return actions;
};
