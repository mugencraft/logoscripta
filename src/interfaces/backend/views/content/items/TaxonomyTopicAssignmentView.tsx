import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import {
  TaxonomyTopicManager,
  type TopicAssignmentUpdate,
} from "@/ui/components/taxonomy/assignment/TaxonomyTopicManager";

import { useContentTopicActions } from "../../../actions/content/useContentTopicActions";
import { Route } from "../../../routes/content/items_/$itemId.assignment";

export function TaxonomyTopicAssignmentView() {
  const { contentItem, systems } = Route.useLoaderData();

  const { updateTopicAssignments, getHierarchy } = useContentTopicActions();

  return (
    <ViewContainer
      title={`Topic Assignment: ${contentItem.title || contentItem.identifier}`}
      description="Manage hierarchical topic assignments for this content item"
    >
      <TaxonomyTopicManager
        systems={systems}
        currentAssignments={contentItem.topics}
        onGetHierarchy={getHierarchy}
        onUpdateAssignments={(updates: TopicAssignmentUpdate[]) => {
          updateTopicAssignments(contentItem, updates);
        }}
      />
    </ViewContainer>
  );
}
