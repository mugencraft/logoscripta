import { ChevronRight } from "lucide-react";

import type { TopicPath } from "@/domain/models/taxonomy/types";

import { Badge } from "@/ui/components/core/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface TaxonomyTopicPathProps {
  path: TopicPath | null;
  onNavigate?: (topicId: number) => void;
}

export function TaxonomyTopicPath({
  path,
  onNavigate,
}: TaxonomyTopicPathProps) {
  if (!path) return null;
  const allTopics = [...path.ancestors, path.topic];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Path</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {allTopics.map((topic, index) => (
            <div key={topic.id} className="flex items-center space-x-2">
              {index > 0 && <ChevronRight className="h-3 w-3" />}
              <Badge
                variant={index === allTopics.length - 1 ? "default" : "outline"}
                className={onNavigate ? "cursor-pointer hover:bg-accent" : ""}
                onClick={() => onNavigate?.(topic.id)}
              >
                {topic.name}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
