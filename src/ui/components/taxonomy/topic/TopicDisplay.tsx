import type {
  TaxonomyTopicWithChildren,
  TaxonomyTopicWithHierarchy,
} from "@/domain/models/taxonomy/types";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

type TopicWithRelations =
  | TaxonomyTopicWithChildren
  | TaxonomyTopicWithHierarchy;

interface TopicDisplayProps {
  topic: TopicWithRelations;
  mode: "preview" | "detail";
  showActions?: boolean;
  onEdit?: () => void;
  onAddChild?: () => void;
  onDelete?: () => void;
}

function hasHierarchyInfo(
  topic: TopicWithRelations,
): topic is TaxonomyTopicWithHierarchy {
  return "parent" in topic && "ancestors" in topic;
}

export const TopicDisplay = ({
  topic,
  mode,
  showActions = false,
  onEdit,
  onAddChild,
  onDelete,
}: TopicDisplayProps) => {
  const isDetailMode = mode === "detail";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isDetailMode ? "Topic Details" : topic.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div
          className={
            isDetailMode ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-2"
          }
        >
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Name
            </div>
            <p className={isDetailMode ? "text-lg font-semibold" : "text-base"}>
              {topic.name}
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Level
            </div>
            <Badge variant="outline">Level {topic.level}</Badge>
          </div>

          {isDetailMode && (
            <>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Path
                </div>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {topic.path}
                </p>
              </div>

              {hasHierarchyInfo(topic) && topic.parent && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Parent
                  </div>
                  <p>{topic.parent.name}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Hierarchy Stats */}
        {isDetailMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Children
              </div>
              <p className="text-2xl font-bold">{topic.children.length}</p>
            </div>

            {hasHierarchyInfo(topic) && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Ancestors
                </div>
                <p className="text-2xl font-bold">{topic.ancestors.length}</p>
              </div>
            )}
          </div>
        )}

        {/* Children Preview in preview mode */}
        {!isDetailMode && topic.children.length > 0 && (
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Children
            </div>
            <p className="text-base">{topic.children.length} subtopics</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-4 border-t">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit Topic
              </Button>
            )}
            {onAddChild && (
              <Button variant="outline" size="sm" onClick={onAddChild}>
                Add Child
              </Button>
            )}
            {onDelete && topic.children.length === 0 && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
