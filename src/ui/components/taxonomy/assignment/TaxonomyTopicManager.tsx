import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";

import type { TaxonomySystem } from "@/domain/models/taxonomy/system";
import type {
  ContentTaxonomyTopicWithTopic,
  TopicHierarchy,
} from "@/domain/models/taxonomy/types";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import { Checkbox } from "@/ui/components/core/checkbox";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";

interface SystemTopicState {
  systemId: number;
  system: TaxonomySystem;
  hierarchy: TopicHierarchy[];
  selectedTopicIds: Set<number>;
  originalTopicIds: Set<number>; // Track original state for diff
}

interface TaxonomyTopicManagerProps {
  systems: TaxonomySystem[];
  currentAssignments: ContentTaxonomyTopicWithTopic[];
  onGetHierarchy: (systemId: number) => Promise<TopicHierarchy[]>;
  onUpdateAssignments: (updates: TopicAssignmentUpdate[]) => void;
}

export interface TopicAssignmentUpdate {
  systemId: number;
  toAdd: number[];
  toRemove: number[];
}

export function TaxonomyTopicManager({
  systems,
  currentAssignments,
  onGetHierarchy,
  onUpdateAssignments,
}: TaxonomyTopicManagerProps) {
  const [systemStates, setSystemStates] = useState<
    Map<number, SystemTopicState>
  >(new Map());
  const [availableSystems, setAvailableSystems] = useState<TaxonomySystem[]>(
    [],
  );
  const [selectedSystemToAdd, setSelectedSystemToAdd] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with systems that already have assignments
  // biome-ignore lint/correctness/useExhaustiveDependencies: loadSystemHierarchy
  useEffect(() => {
    const usedSystemIds = new Set(currentAssignments.map((a) => a.systemId));
    const usedSystems = systems.filter((s) => usedSystemIds.has(s.id));
    const unusedSystems = systems.filter((s) => !usedSystemIds.has(s.id));

    setAvailableSystems(unusedSystems);

    // Load hierarchies for used systems
    for (const system of usedSystems) {
      loadSystemHierarchy(system);
    }
  }, [systems, currentAssignments]);

  const loadSystemHierarchy = async (system: TaxonomySystem) => {
    setIsLoading(true);
    try {
      const hierarchy = await onGetHierarchy(system.id);
      const assignedTopicIds = new Set(
        currentAssignments
          .filter((a) => a.systemId === system.id)
          .map((a) => a.topicId),
      );

      setSystemStates((prev) =>
        new Map(prev).set(system.id, {
          systemId: system.id,
          system,
          hierarchy,
          selectedTopicIds: new Set(assignedTopicIds),
          originalTopicIds: new Set(assignedTopicIds), // Clone for diff
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSystem = async () => {
    if (!selectedSystemToAdd) return;

    const systemId = Number(selectedSystemToAdd);
    const system = systems.find((s) => s.id === systemId);
    if (!system) return;

    await loadSystemHierarchy(system);

    // Update available systems
    setAvailableSystems((prev) => prev.filter((s) => s.id !== systemId));
    setSelectedSystemToAdd("");
  };

  const handleTopicToggle = (
    systemId: number,
    topicId: number,
    checked: boolean,
  ) => {
    setSystemStates((prev) => {
      const newMap = new Map(prev);
      const state = newMap.get(systemId);
      if (!state) return prev;

      const newSelectedIds = new Set(state.selectedTopicIds);
      if (checked) {
        newSelectedIds.add(topicId);
      } else {
        newSelectedIds.delete(topicId);
      }

      newMap.set(systemId, {
        ...state,
        selectedTopicIds: newSelectedIds,
      });

      return newMap;
    });
  };

  const calculateUpdates = (): TopicAssignmentUpdate[] => {
    const updates: TopicAssignmentUpdate[] = [];

    for (const state of systemStates.values()) {
      const toAdd = Array.from(state.selectedTopicIds).filter(
        (id) => !state.originalTopicIds.has(id),
      );
      const toRemove = Array.from(state.originalTopicIds).filter(
        (id) => !state.selectedTopicIds.has(id),
      );

      if (toAdd.length > 0 || toRemove.length > 0) {
        updates.push({
          systemId: state.systemId,
          toAdd,
          toRemove,
        });
      }
    }

    return updates;
  };

  const handleSave = async () => {
    const updates = calculateUpdates();
    if (updates.length === 0) return;

    setIsLoading(true);
    try {
      onUpdateAssignments(updates);

      // Update original state to match current selections
      setSystemStates((prev) => {
        const newMap = new Map(prev);
        for (const update of updates) {
          const state = newMap.get(update.systemId);
          if (state) {
            newMap.set(update.systemId, {
              ...state,
              originalTopicIds: new Set(state.selectedTopicIds),
            });
          }
        }
        return newMap;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTopicHierarchy = (
    nodes: TopicHierarchy[],
    systemId: number,
    level = 0,
  ) => {
    const state = systemStates.get(systemId);
    if (!state) return null;

    return nodes.map((node) => (
      <div key={node.topic.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center space-x-2 py-1">
          <Checkbox
            checked={state.selectedTopicIds.has(node.topic.id)}
            onCheckedChange={(checked) =>
              handleTopicToggle(systemId, node.topic.id, checked as boolean)
            }
          />
          <span className="text-sm">{node.topic.name}</span>
          <Badge variant="outline" className="text-xs">
            L{node.topic.level}
          </Badge>
        </div>
        {node.children.length > 0 &&
          renderTopicHierarchy(node.children, systemId, level + 1)}
      </div>
    ));
  };

  const hasChanges = calculateUpdates().length > 0;

  return (
    <div className="space-y-6">
      {/* Add System Section */}
      {availableSystems.length > 0 && (
        <div className="flex space-x-2 p-4 border rounded-lg bg-muted/10">
          <div className="flex-1">
            <Select
              value={selectedSystemToAdd}
              onValueChange={setSelectedSystemToAdd}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add taxonomy system..." />
              </SelectTrigger>
              <SelectContent>
                {availableSystems.map((system) => (
                  <SelectItem key={system.id} value={system.id.toString()}>
                    {system.name} ({system.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddSystem} disabled={!selectedSystemToAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add System
          </Button>
        </div>
      )}

      {/* System Topic Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from(systemStates.values()).map((state) => (
          <div key={state.systemId} className="border rounded-lg">
            <div className="p-4 border-b bg-muted/5">
              <h3 className="font-medium">{state.system.name}</h3>
              <p className="text-sm text-muted-foreground">
                {state.selectedTopicIds.size} topics selected
              </p>
            </div>
            <ScrollArea className="h-80">
              <div className="p-4">
                {renderTopicHierarchy(state.hierarchy, state.systemId)}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>

      {/* Save Changes */}
      {hasChanges && (
        <div className="flex justify-end p-4 border-t">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
