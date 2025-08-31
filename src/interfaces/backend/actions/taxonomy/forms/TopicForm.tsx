import { useState } from "react";

import type { TaxonomyTopic } from "@/domain/models/taxonomy/topic";
import type { TopicHierarchy } from "@/domain/models/taxonomy/types";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  taxonomyTopicFormSchema,
  taxonomyTopicMetadataSchema,
} from "@/domain/validation/taxonomy/topic";
import { trpc } from "@/interfaces/server-client";

import { Button } from "@/ui/components/core/button";
import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useTopicActions } from "../useTopicActions";

export function TopicForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<TaxonomyTopic>) {
  const { handleCreate, handleUpdate } = useTopicActions({
    callbacks: { onSuccess },
  });

  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(
    data?.systemId || null,
  );

  const { data: systems } = trpc.taxonomy.systems.getAll.useQuery();

  const { data: hierarchies = [] } = trpc.taxonomy.topics.getHierarchy.useQuery(
    // biome-ignore lint/style/noNonNullAssertion: systemId is not nullable
    selectedSystemId!,
    {
      enabled: !!selectedSystemId,
    },
  );

  const form = useAppForm({
    defaultValues: {
      name: "",
      systemId: 0,
      parentId: null,
      level: 0,
      path: "",
      ...data,
      metadata: createMetadata(taxonomyTopicMetadataSchema, data?.metadata),
    } satisfies Omit<TaxonomyTopic, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack Form complains
      onChangeAsync: taxonomyTopicFormSchema as any,
      onChangeAsyncDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
      const submitData = {
        ...value,
        // biome-ignore lint/style/noNonNullAssertion: systemId is not nullable
        systemId: selectedSystemId!,
      };

      !data
        ? await handleCreate({ data: submitData })
        : await handleUpdate({
            data: {
              ...submitData,
              id: data.id,
            },
          });
    },
  });

  // Flatten hierarchy for parent selection, excluding self and descendants
  const flattenForParentSelection = (
    nodes: TopicHierarchy[],
    excludeId?: number,
  ): Array<{ id: number; name: string; level: number }> => {
    const result: Array<{ id: number; name: string; level: number }> = [];

    for (const node of nodes) {
      if (node.topic.id !== excludeId) {
        result.push({
          id: node.topic.id,
          name: node.topic.name,
          level: node.level,
        });
        // Only include children if not editing the current topic (to prevent circular refs)
        if (!data || !isDescendant(node, data.id)) {
          result.push(...flattenForParentSelection(node.children, excludeId));
        }
      }
    }
    return result;
  };

  // Check if a node is descendant of the given topic ID
  const isDescendant = (node: TopicHierarchy, topicId: number): boolean => {
    if (node.topic.id === topicId) return true;
    return node.children.some((child) => isDescendant(child, topicId));
  };

  const parentOptions = selectedSystemId
    ? flattenForParentSelection(hierarchies, data?.id)
    : [];

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Topic Name"
            placeholder="Enter topic name"
            required
          />
        )}
      </form.AppField>

      {/* System Selection - disabled in edit mode */}
      <div className="space-y-2">
        <Label>Taxonomy System</Label>
        <Select
          value={selectedSystemId?.toString() || ""}
          onValueChange={(value) => setSelectedSystemId(Number(value))}
          disabled={mode === "edit"} // Cannot change system in edit mode
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a taxonomy system" />
          </SelectTrigger>
          <SelectContent>
            {systems?.map((system) => (
              <SelectItem key={system.id} value={system.id.toString()}>
                {system.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Parent Topic Selection */}
      {selectedSystemId && (
        <form.AppField name="parentId">
          {(field) => (
            <div className="space-y-2">
              <Label>Parent Topic (Optional)</Label>
              <Select
                value={field.state.value?.toString() || "root"}
                onValueChange={(value) =>
                  field.handleChange(value === "root" ? null : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root Level</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id.toString()}>
                      {"─".repeat(option.level * 2)} {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.AppField>
      )}

      <form.AppField name="metadata.editorial.description">
        {(field) => (
          <field.TextAreaField
            label="Description"
            placeholder="Enter topic description"
          />
        )}
      </form.AppField>

      <form.AppField name="metadata.editorial.keywords">
        {(field) => (
          <field.TextField
            label="Keywords"
            placeholder="Enter comma-separated keywords"
          />
        )}
      </form.AppField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <form.AppForm>
          <form.SubmitButton mode={mode} disabled={!selectedSystemId} />
        </form.AppForm>
      </div>
    </form>
  );
}
