import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";

import type { ActionConfig } from "@/ui/components/actions/types";

import { ExportMenu } from "./ExportMenu";
import type { DownloadOptions } from "./utils";

export const getExportAction = <TData,>(
  table: Table<TData>,
  defaultOptions: DownloadOptions = {},
) => {
  const action: ActionConfig<TData> = {
    id: "export-data",
    label: "Export",
    icon: Download,
    contexts: ["view", "selection"],
    dialog: {
      title: "Export Data",
      content: ({ selected, onSuccess }) =>
        selected && (
          <ExportMenu<TData>
            table={table}
            data={selected}
            fileName={defaultOptions.fileName}
            onSuccess={onSuccess}
          />
        ),
    },
  };

  return action;
};
