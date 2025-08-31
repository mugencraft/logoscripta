import type { TaxonomyTopicWithHierarchy } from "@/domain/models/taxonomy/types";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface TopicDetailsProps {
  topic: TaxonomyTopicWithHierarchy;
}

export const TopicDetails = ({ topic }: TopicDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Topic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Name
            </div>
            <p className="text-lg font-semibold">{topic.name}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Level
            </div>
            <Badge variant="outline">Level {topic.level}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Path
            </div>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              {topic.path}
            </p>
          </div>
          {topic.parent && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Parent
              </div>
              <p>{topic.parent.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hierarchy Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Children
            </div>
            <p className="text-2xl font-bold">{topic.children.length}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Ancestors
            </div>
            <p className="text-2xl font-bold">{topic.ancestors.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
