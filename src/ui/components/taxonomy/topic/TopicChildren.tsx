import type { TaxonomyTopicWithHierarchy } from "@/domain/models/taxonomy/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface TopicChildrenProps {
  topic: TaxonomyTopicWithHierarchy;
}

export const TopicChildren = ({ topic }: TopicChildrenProps) => {
  if (!topic.children.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Child Topics ({topic.children.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topic.children.map((child) => (
            <div key={child.id} className="border rounded-lg p-4">
              <h4 className="font-medium">{child.name}</h4>
              <p className="text-sm text-muted-foreground">
                Level {child.level}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
