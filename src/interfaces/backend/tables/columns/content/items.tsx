import { Link } from "@tanstack/react-router";

import type { ContentItem } from "@/domain/models/content/item";
import type { ContentItemWithStats } from "@/domain/models/content/types";

import type { ActionConfig } from "@/ui/components/actions/types";
import { PreviewCell } from "@/ui/components/content/table/PreviewCell";
import { Badge } from "@/ui/components/core/badge";
import type { TableConfiguration } from "@/ui/components/table/types";

import { getItemDetailLink } from "../../../views/content/items/utils";
import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
  getSystemTimestampColumns,
} from "../commons";

interface ItemsConfigOptions {
  actions: ActionConfig<ContentItem>[];
  linkToCollection?: boolean;
  items?: ContentItemWithStats[];
}

export function getItemsTable({
  actions,
  linkToCollection,
}: ItemsConfigOptions): TableConfiguration<ContentItem, ContentItemWithStats> {
  return {
    columns: [
      getControlColumnGroup(actions),
      {
        header: "Content",
        columns: [
          {
            accessorKey: "preview",
            header: "Preview",
            size: 80,
            enableSorting: false,
            enableColumnFilter: false,
            cell: ({ row }) => <PreviewCell item={row.original} />,
          },
          {
            accessorKey: "identifier",
            header: "Identifier",
            size: 200,
            enableSorting: true,
            enableColumnFilter: true,
            cell: ({ row }) => {
              const item = row.original;

              return (
                <div>
                  <Link
                    to={getItemDetailLink(item, linkToCollection)}
                    className="font-mono text-sm hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {row.getValue("identifier")}
                  </Link>

                  {item.title && (
                    <div className="text-xs text-muted-foreground">
                      {item.title}
                    </div>
                  )}
                  <Link
                    to={"/content/collections/$collectionId"}
                    params={{ collectionId: String(item.collectionId) }}
                    className="text-xs text-green-600 dark:text-green-400 hover:underline"
                  >
                    Collection: {item.collectionId}
                  </Link>
                </div>
              );
            },
          },
          {
            accessorKey: "contentType",
            header: "Type",
            size: 100,
            enableSorting: true,
            enableColumnFilter: true,
            cell: ({ row }) => (
              <Badge variant="outline">{row.getValue("contentType")}</Badge>
            ),
          },
          {
            accessorKey: "rawTags",
            header: "Raw Tags",
            size: 200,
            enableSorting: false,
            enableColumnFilter: true,
            cell: ({ row }) => (
              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                {row.getValue("rawTags")}
              </div>
            ),
          },
        ],
      },
      {
        header: "Tagging",
        columns: [
          {
            header: "Tags",
            accessorKey: "totalTags",
            enableSorting: true,
            cell: (info) => (
              <div className="text-center font-mono">{info.getValue()}</div>
            ),
          },
        ],
      },
      {
        header: "Timestamps",
        enableResizing: false,
        columns: getSystemTimestampColumns(),
      },
    ],
    visibilityPresets: [
      {
        name: "Default",
        columns: {
          "select-col": true,
          preview: true,
          identifier: true,
          contentType: true,
          rawTags: true,
          tags: true,
          tagCount: true,
          updatedAt: true,
        },
      },
      {
        name: "Compact",
        columns: {
          "select-col": true,
          preview: true,
          identifier: true,
          tags: true,
          tagCount: true,
        },
      },
      {
        name: "Detailed",
        columns: {
          "select-col": true,
          preview: true,
          identifier: true,
          contentType: true,
          tags: true,
          tagCount: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    ],
    features: baseTableFeatures,
    selection: getSelectionDef(actions),
  };
}
