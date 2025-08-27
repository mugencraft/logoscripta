import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Tag, TagCategoryAssociation } from "@/domain/models/tagging/tag";
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

interface TagCategoryAssociationsManagerProps {
  tag: Tag;
  onUpdate?: () => void;
}

const initialAssociationState = {
  categoryId: 0,
};

export function TagCategoryAssociationsManager({
  tag,
  onUpdate,
}: TagCategoryAssociationsManagerProps) {
  const [isAddingAssociation, setIsAddingAssociation] = useState(false);
  const [newAssociation, setNewAssociation] = useState(initialAssociationState);

  const { data: associations = [] } =
    trpc.tagging.tags.getAssociationsForTag.useQuery(tag.id);

  const { data: systemCategories = [] } =
    trpc.tagging.categories.getAll.useQuery(tag.systemId);

  const { handleCreateAssociation, handleDeleteAssociation } = useTagActions(
    {},
  );

  const resetForm = () => {
    setIsAddingAssociation(false);
    setNewAssociation(initialAssociationState);
  };

  const handleCreate = async () => {
    if (newAssociation.categoryId) {
      const result = await handleCreateAssociation({
        data: {
          tagId: tag.id,
          categoryId: newAssociation.categoryId,
        },
      });
      if (result.success) {
        resetForm();
        onUpdate?.();
      }
    }
  };

  const handleDelete = async (association: TagCategoryAssociation) => {
    const result = await handleDeleteAssociation({
      data: {
        tagId: association.tagId,
        categoryId: association.categoryId,
      },
    });
    if (result.success) {
      onUpdate?.();
    }
  };

  // Filter out categories that are already associated
  const unassociatedCategories = systemCategories.filter(
    (category) =>
      !associations.some((assoc) => assoc.categoryId === category.id),
  );

  // Get category names for display
  const getCategoryDisplay = (categoryId: number) => {
    const category = systemCategories.find((c) => c.id === categoryId);
    return {
      name: category?.name || `Category ${categoryId}`,
      groupName: "Current System",
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Category Associations</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAddingAssociation(true)}
          disabled={isAddingAssociation || unassociatedCategories.length === 0}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Category
        </Button>
      </div>

      {/* Existing associations */}
      <div className="space-y-2">
        {associations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No category associations defined
          </p>
        ) : (
          associations.map((association) => {
            const categoryDisplay = getCategoryDisplay(association.categoryId);
            return (
              <Card
                key={`${association.tagId}-${association.categoryId}`}
                className="p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{categoryDisplay.name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      in {categoryDisplay.groupName}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(association)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add new association form */}
      {isAddingAssociation && (
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={newAssociation.categoryId.toString()}
                onValueChange={(value) =>
                  setNewAssociation((prev) => ({
                    ...prev,
                    categoryId: Number(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {unassociatedCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        (ID: {category.id})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newAssociation.categoryId}
              >
                Add Association
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {unassociatedCategories.length === 0 && !isAddingAssociation && (
        <p className="text-xs text-muted-foreground text-center py-2">
          All available categories are already associated with this tag
        </p>
      )}
    </div>
  );
}
