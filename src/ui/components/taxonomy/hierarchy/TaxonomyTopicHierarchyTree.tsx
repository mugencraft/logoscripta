import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { TopicHierarchy } from "@/domain/models/taxonomy/types";

import { Button } from "@/ui/components/core/button";
import { cn } from "@/ui/utils";

interface TaxonomyTopicHierarchyTreeProps {
  hierarchies: TopicHierarchy[];
  selectedTopicId?: number;
  onTopicSelect?: (topicId: number) => void;
  className?: string;
}

export function TaxonomyTopicHierarchyTree({
  hierarchies,
  selectedTopicId,
  onTopicSelect,
  className,
}: TaxonomyTopicHierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleExpanded = (topicId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TopicHierarchy) => {
    const isExpanded = expandedNodes.has(node.topic.id);
    const isSelected = selectedTopicId === node.topic.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.topic.id} className="select-none">
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-accent rounded-sm cursor-pointer",
            isSelected && "bg-accent font-medium",
          )}
          style={{ paddingLeft: `${node.level * 20 + 8}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.topic.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-5 mr-1" />
          )}
          <Button
            className="flex-1 text-sm"
            onClick={() => onTopicSelect?.(node.topic.id)}
          >
            {node.topic.name}
          </Button>
        </div>
        {hasChildren && isExpanded && (
          <div>{node.children.map(renderNode)}</div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-1", className)}>
      {hierarchies.map(renderNode)}
    </div>
  );
}
