import { X } from "lucide-react";

import type { ContentTaxonomyTopicWithTopic } from "@/domain/models/taxonomy/types";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface TaxonomyTopicAssignmentsProps {
  assignments: ContentTaxonomyTopicWithTopic[];
  onRemove?: (topicId: number) => void;
  onWeightChange?: (topicId: number, weight: number) => void;
  showWeights?: boolean;
}

export function TaxonomyTopicAssignments({
  assignments,
  onRemove,
  // onWeightChange,
  showWeights = false,
}: TaxonomyTopicAssignmentsProps) {
  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No topics assigned
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Assigned Topics ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {assignments.map((assignment) => (
          <div
            key={assignment.topicId}
            className="flex items-center justify-between p-2 border rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{assignment.topic.name}</Badge>
              {showWeights && (
                <span className="text-xs text-muted-foreground">
                  Weight: {assignment.weight}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {assignment.source}
              </Badge>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onRemove(assignment.topicId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
