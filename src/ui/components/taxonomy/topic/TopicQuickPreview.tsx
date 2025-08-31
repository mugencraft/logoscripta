import type { TaxonomyTopicWithChildren } from "@/domain/models/taxonomy/types";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface TopicDetailPanelProps {
  topic: TaxonomyTopicWithChildren;
}
export const TopicQuickPreview = ({ topic }: TopicDetailPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Name</div>
          <p className="text-base">{topic.name}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Level</div>
          <p className="text-base">{topic.level}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Path</div>
          <p className="text-sm text-muted-foreground font-mono">
            {topic.path}
          </p>
        </div>
        {topic.children.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Children
            </div>
            <p className="text-base">{topic.children.length} subtopics</p>
          </div>
        )}
        <div className="flex space-x-2 pt-4">
          <Button variant="outline" size="sm">
            Edit Topic
          </Button>
          <Button variant="outline" size="sm">
            Add Child
          </Button>
          {topic.children.length === 0 && (
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
