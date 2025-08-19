import { Hash } from "lucide-react";

import type { TopicWithCount } from "@/domain/models/github/types";

import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

export const getTopicsTable: GetTableConfiguration<TopicWithCount> = (
  actions,
) => ({
  columns: [
    getControlColumnGroup(actions),
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
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
