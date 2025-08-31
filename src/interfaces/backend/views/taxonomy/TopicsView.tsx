import { FolderTree, Table } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import type { TaxonomyTopic } from "@/domain/models/taxonomy/topic";
import type {
  TaxonomyTopicWithChildren,
  TaxonomyTopicWithHierarchy,
  TopicHierarchy,
} from "@/domain/models/taxonomy/types";
import { trpcBase } from "@/interfaces/server-client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { DataTable } from "@/ui/components/table/DataTable";
import { TaxonomyTopicHierarchyTree } from "@/ui/components/taxonomy/hierarchy/TaxonomyTopicHierarchyTree";
import { TopicQuickPreview } from "@/ui/components/taxonomy/topic/TopicQuickPreview";
import { TopicStatistics } from "@/ui/components/taxonomy/topic/TopicStatistics";

import { getTopicsActions } from "../../actions/taxonomy/buttons/topics";
import { Route } from "../../routes/taxonomy/systems/$systemId";
import { getTopicsTable } from "../../tables/columns/taxonomy/topics";
import { useDataTable } from "../../tables/useDataTable";

type ViewMode = "table" | "hierarchy";

export function TopicsView() {
  const { system, hierarchies, statistics } = Route.useLoaderData();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedTopic, setSelectedTopic] =
    useState<TaxonomyTopicWithChildren | null>(null);

  // Flatten hierarchy for table view
  const flatTopics = useMemo(
    () => hierarchies.flatMap((h) => flattenHierarchy(h)),
    [hierarchies],
  );

  const handleTopicSelect = useCallback(async (topicId: number) => {
    try {
      const topic =
        await trpcBase.taxonomy.topics.getTopicWithChildren.query(topicId);
      setSelectedTopic(topic);
    } catch (error) {
      console.error("Failed to load topic:", error);
      setSelectedTopic(null);
    }
  }, []);

  const handleViewModeToggle = useCallback(() => {
    const newMode = viewMode === "table" ? "hierarchy" : "table";
    setViewMode(newMode);

    if (newMode === "table") {
      setSelectedTopic(null);
    }

    return Promise.resolve({ success: true });
  }, [viewMode]);

  const actions = [
    ...getTopicsActions(),
    {
      id: "toggle-view",
      label: viewMode === "table" ? "Hierarchy View" : "Table View",
      icon: viewMode === "table" ? FolderTree : Table,
      variant: "outline" as const,
      contexts: ["view" as const],
      handler: handleViewModeToggle,
    },
  ];

  const dataTable = useDataTable<TaxonomyTopic, TaxonomyTopicWithHierarchy>({
    data: flatTopics,
    config: getTopicsTable(actions),
    tableId: "topics-table",
  });

  return (
    <ViewContainer
      title={`Topics: ${system.name}`}
      description={`Manage topics in ${system.name} taxonomy system`}
      actions={actions}
    >
      <div className="space-y-6">
        <TopicStatistics statistics={statistics} />

        {/* Content View */}
        {viewMode === "hierarchy" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Topic Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <TaxonomyTopicHierarchyTree
                  hierarchies={hierarchies}
                  selectedTopicId={selectedTopic?.id}
                  onTopicSelect={handleTopicSelect}
                />
              </CardContent>
            </Card>
            {selectedTopic && <TopicQuickPreview topic={selectedTopic} />}
          </div>
        ) : (
          <DataTable {...dataTable} />
        )}
      </div>
    </ViewContainer>
  );
}

// Helper function to flatten hierarchy for table view
function flattenHierarchy(node: TopicHierarchy): TaxonomyTopicWithHierarchy[] {
  const result: TaxonomyTopicWithHierarchy[] = [];

  const flatten = (
    currentNode: TopicHierarchy,
    allNodes: TopicHierarchy[] = [],
  ) => {
    const topicWithHierarchy: TaxonomyTopicWithHierarchy = {
      ...currentNode.topic,
      parent: null, // Will be resolved by the queries adapter when needed
      children: currentNode.children.map((child) => child.topic),
      ancestors: [], // Will be resolved by the queries adapter when needed
    };

    result.push(topicWithHierarchy);

    // Recursively flatten children
    for (const child of currentNode.children) {
      flatten(child, allNodes);
    }
  };

  flatten(node);
  return result;
}
