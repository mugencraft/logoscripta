import { Link } from "@tanstack/react-router";

import type { Country } from "@/domain/models/location/country";

import { Badge } from "@/ui/components/core/badge";
import { BaseCell } from "@/ui/components/table/cells/BaseCell";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

export const getCountriesTable: GetTableConfiguration<Country> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Country Details",
      columns: [
        {
          accessorKey: "name",
          header: "Country",
          size: 200,
          enableSorting: true,
          cell: ({ row }) => (
            <div>
              <div className="font-medium">
                <Link
                  to={"/location/countries/$countryCode"}
                  params={{ countryCode: row.original.code }}
                  className="hover:underline"
                >
                  {row.getValue("name")}
                </Link>
              </div>
              <div className="text-xs text-muted-foreground">
                {row.original.officialName}
              </div>
            </div>
          ),
        },
        {
          accessorKey: "code",
          header: "Code",
          size: 80,
          enableSorting: true,
          cell: (info) => (
            <Badge variant="outline" className="font-mono">
              {info.getValue()}
            </Badge>
          ),
        },
        {
          accessorKey: "region",
          header: "Region",
          size: 120,
          enableSorting: true,
          cell: (info) => <BaseCell value={info.getValue()} />,
        },
        {
          accessorKey: "subregion",
          header: "Subregion",
          size: 150,
          enableSorting: true,
          cell: (info) => <BaseCell value={info.getValue()} />,
        },
        {
          accessorKey: "capital",
          header: "Capital",
          size: 120,
          enableSorting: false,
          cell: (info) => <BaseCell value={info.getValue()} />,
        },
      ],
    },
  ],
  features: baseTableFeatures,
  visibilityPresets: [
    {
      name: "Default",
      columns: {
        "select-col": true,
        name: true,
        code: true,
        region: true,
        capital: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        code: true,
        region: true,
      },
    },
    {
      name: "Full Details",
      columns: {
        "select-col": true,
        name: true,
        code: true,
        region: true,
        subregion: true,
        capital: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
