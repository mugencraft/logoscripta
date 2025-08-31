import { Link } from "@tanstack/react-router";

import type { TaxonomyTopic } from "@/domain/models/taxonomy/topic";
import type { TaxonomyTopicWithHierarchy } from "@/domain/models/taxonomy/types";

import { Badge } from "@/ui/components/core/badge";
import type { GetTableConfiguration } from "@/ui/components/table/types";

import {
  baseTableFeatures,
  getControlColumnGroup,
  getSelectionDef,
} from "../commons";

export const getTopicsTable: GetTableConfiguration<
  TaxonomyTopic,
  TaxonomyTopicWithHierarchy
> = (actions) => ({
  columns: [
    getControlColumnGroup(actions),
    {
      header: "Topic Details",
      columns: [
        {
          accessorKey: "name",
          header: "Topic Name",
          size: 250,
          enableSorting: true,
          cell: ({ row }) => {
            const topic = row.original;
            // Visual hierarchy indication with indentation
            const indentLevel = topic.level * 20;

            return (
              <div style={{ paddingLeft: `${indentLevel}px` }}>
                <div className="flex items-center gap-2">
                  {topic.level > 0 && (
                    <span className="text-muted-foreground">└─</span>
                  )}
                  <Link
                    to="/taxonomy/systems/$systemId/topics/$topicId"
                    params={{
                      systemId: String(topic.systemId),
                      topicId: String(topic.id),
                    }}
                    className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {topic.name}
                  </Link>
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "level",
          header: "Level",
          size: 80,
          enableSorting: true,
          cell: ({ row }) => (
            <Badge variant="outline">L{row.getValue("level")}</Badge>
          ),
        },
        {
          accessorKey: "path",
          header: "Path",
          size: 200,
          enableSorting: false,
          cell: (info) => (
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {info.getValue()}
            </code>
          ),
        },
        {
          id: "childrenCount",
          header: "Children",
          size: 80,
          enableSorting: true,
          cell: ({ row }) => (
            <div className="text-center font-mono">
              {row.original.children?.length || 0}
            </div>
          ),
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
        level: true,
        path: true,
        childrenCount: true,
      },
    },
    {
      name: "Compact",
      columns: {
        "select-col": true,
        name: true,
        level: true,
      },
    },
  ] as const,
  selection: getSelectionDef(actions),
});
