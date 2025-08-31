import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { TaxonomyTopicPath } from "@/ui/components/taxonomy/hierarchy/TaxonomyTopicPath";
import { TopicChildren } from "@/ui/components/taxonomy/topic/TopicChildren";
import { TopicDetails } from "@/ui/components/taxonomy/topic/TopicDetails";

import { getTopicsActions } from "../../actions/taxonomy/buttons/topics";
import { Route } from "../../routes/taxonomy/systems_/$systemId.topics_.$topicId";

export function TopicDetailView() {
  const { system, topic, path } = Route.useLoaderData();

  const actions = getTopicsActions(true);

  return (
    <ViewContainer
      title={`Topic: ${topic.name}`}
      description={`Topic details in ${system.name} taxonomy`}
      actions={actions}
    >
      <div className="space-y-6">
        <TaxonomyTopicPath path={path} />

        <TopicDetails topic={topic} />

        <TopicChildren topic={topic} />
      </div>
    </ViewContainer>
  );
}
