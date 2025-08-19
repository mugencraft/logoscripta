import { Users } from "lucide-react";

import type { OwnerWithRepositories } from "@/domain/models/github/types";

import { IconTooltip } from "@/ui/components/extra/icon-tooltip";
import { DigitCell } from "@/ui/components/table/cells/DigitCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

export const getOwnersTable: GetTableConfiguration<OwnerWithRepositories> = (
  actions,
) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Owner Details",
      columns: [
        {
          accessorKey: "avatarUrl",
          header: "Avatar",
          cell: (info) => (
            <img
              src={info.getValue<string>()}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          ),
          enableColumnFilter: false,
        },
        {
          accessorKey: "login",
          header: "Username",
          cell: (info) => (
            <div className="font-medium">{info.getValue<string>()}</div>
          ),
          enableSorting: true,
          enableColumnFilter: true,
          filterFn: "includesString",
        },
      ],
    },
    {
      header: "Statistics",
      columns: [
        {
          accessorKey: "type",
          header: "Type",
          cell: (info) => (
            <div className="text-sm">{info.getValue<string>()}</div>
          ),
          enableSorting: true,
          filterFn: "arrIncludesSome",
        },
        {
          accessorKey: "repoCount",
          header: () => <IconTooltip icon={Users} label="Repository Count" />,
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
        login: true,
        avatarUrl: true,
        type: true,
        repoCount: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        login: true,
        repoCount: true,
      },
    },
  ] as const,
  features: baseTableFeatures,
  selection: getSelectionDef(actions),
});
