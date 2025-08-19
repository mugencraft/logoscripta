import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Tag } from "@/domain/models/tagging/tag";
import type {
  RelationshipType,
  TagRelationshipWithTags,
} from "@/domain/models/tagging/types";
import { RELATIONSHIP_TYPES } from "@/domain/models/tagging/types";
import { trpc } from "@/interfaces/server-client";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import { Card } from "@/ui/components/core/card";
import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";

import { useTagActions } from "../../useTagActions";

interface TagRelationshipsManagerProps {
  tag: Tag;
  onUpdate?: () => void;
}

const initialRelationshipState = {
  targetTagId: 0,
  relationshipType: "" as RelationshipType,
};

export function TagRelationshipsManager({
  tag,
  onUpdate,
}: TagRelationshipsManagerProps) {
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [newRelationship, setNewRelationship] = useState(
    initialRelationshipState,
  );

  const { data: relationships = [] } =
    trpc.tagging.tags.getRelationships.useQuery(tag.id);

  const { data: availableTags = [] } = trpc.tagging.tags.search.useQuery({
    systemId: tag.systemId,
  });

  const { handleCreateRelationship, handleDeleteRelationship } =
    useTagActions();

  const resetForm = () => {
    setIsAddingRelationship(false);
    setNewRelationship(initialRelationshipState);
  };

  const handleCreate = async () => {
    if (newRelationship.targetTagId && newRelationship.relationshipType) {
      const result = await handleCreateRelationship({
        data: {
          sourceTagId: tag.id,
          targetTagId: newRelationship.targetTagId,
          relationshipType: newRelationship.relationshipType,
          metadata: {
            system: {
              systemType: "tag-relationship",
              version: "1.0",
              createdAt: new Date(),
            },
          },
        },
      });

      if (result.success) {
        resetForm();
        onUpdate?.();
      }
    }
  };

  const handleDelete = async (relationship: TagRelationshipWithTags) => {
    const result = await handleDeleteRelationship({
      data: relationship,
    });

    if (result.success) {
      onUpdate?.();
    }
  };

  const getRelationshipTypeLabel = (type: string) => {
    const labels = {
      implies: "Implies",
      conflicts: "Conflicts with",
      requires: "Requires",
      opposite: "Opposite of",
      invalidates: "Invalidates",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getRelationshipVariant = (
    type: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    const variants = {
      implies: "default",
      conflicts: "destructive",
      requires: "secondary",
      opposite: "outline",
      invalidates: "destructive",
    } as const;

    return variants[type as keyof typeof variants] || "outline";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Tag Relationships</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingRelationship(true)}
          disabled={isAddingRelationship}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Relationship
        </Button>
      </div>

      {/* Existing relationships */}
      <div className="space-y-2">
        {relationships.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No relationships defined
          </p>
        ) : (
          relationships.map((relationship) => (
            <Card
              key={`${relationship.sourceTagId}-${relationship.targetTagId}-${relationship.relationshipType}`}
              className="p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getRelationshipVariant(
                      relationship.relationshipType,
                    )}
                  >
                    {getRelationshipTypeLabel(relationship.relationshipType)}
                  </Badge>
                  <span className="text-sm font-medium">
                    {relationship.tag?.name ||
                      `Tag ${relationship.targetTagId}`}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(relationship)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add new relationship form */}
      {isAddingRelationship && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Relationship Type</Label>
                <Select
                  value={newRelationship.relationshipType}
                  onValueChange={(value) =>
                    setNewRelationship((prev) => ({
                      ...prev,
                      relationshipType: value as RelationshipType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getRelationshipTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Target Tag</Label>
                <Select
                  value={newRelationship.targetTagId.toString()}
                  onValueChange={(value) =>
                    setNewRelationship((prev) => ({
                      ...prev,
                      targetTagId: Number(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      ?.filter((t) => t.id !== tag.id)
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={
                  !newRelationship.targetTagId ||
                  !newRelationship.relationshipType
                }
              >
                Add Relationship
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
