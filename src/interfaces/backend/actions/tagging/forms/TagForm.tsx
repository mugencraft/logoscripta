import { useRouter } from "@tanstack/react-router";

import type { Tag } from "@/domain/models/tagging/tag";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  tagFormSchema,
  tagMetadataSchema,
} from "@/domain/validation/tagging/tag";
import { trpc } from "@/interfaces/server-client";

import { Button } from "@/ui/components/core/button";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useTagActions } from "../useTagActions";
import { TagCategoryAssociationsManager } from "./relations/TagCategoryAssociationsManager";
import { TagRelationshipsManager } from "./relations/TagRelationshipsManager";

export function TagForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<Tag>) {
  const router = useRouter();
  const { handleCreate, handleUpdate } = useTagActions({
    onSuccess,
  });

  const { data: systems } = trpc.tagging.systems.getAll.useQuery();
  const { data: tags } = trpc.tagging.tags.getAll.useQuery();

  const systemsOptions =
    systems?.map((system) => ({
      value: system.id.toString(),
      label: system.name,
    })) || [];

  const tagOptions =
    tags?.map((tag) => ({
      value: tag.name,
      label: tag.name,
    })) || [];

  const form = useAppForm({
    defaultValues: {
      name: "",
      label: "",
      description: "",
      systemId: 0,
      isQuickSelection: false,
      ...data,
      metadata: createMetadata(tagMetadataSchema, data?.metadata),
    } satisfies Omit<Tag, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack form complains
      onChangeAsync: tagFormSchema as any,
      onChangeAsyncDebounceMs: 500,
    },
    onSubmit: async ({ value }) => {
      !data
        ? await handleCreate({ data: value })
        : await handleUpdate({
            data: {
              ...value,
              id: data.id,
            },
          });
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              label="Tag Name"
              placeholder="Enter tag name"
              required
            />
          )}
        </form.AppField>

        <form.AppField name="label">
          {(field) => (
            <field.TextField label="Label" placeholder="Enter display label" />
          )}
        </form.AppField>

        <form.AppField name="description">
          {(field) => (
            <field.TextAreaField
              label="Description"
              placeholder="Enter description"
            />
          )}
        </form.AppField>

        <form.AppField name="systemId">
          {(field) => (
            <field.RelationSelectField
              label="Tag System"
              placeholder="Select system..."
              required
              options={systemsOptions}
            />
          )}
        </form.AppField>

        <form.AppField name="isQuickSelection">
          {(field) => <field.CheckboxField label="Quick Selection" />}
        </form.AppField>

        <form.AppField name="metadata.validation.isDisabled">
          {(field) => <field.CheckboxField label="Is Disabled" />}
        </form.AppField>

        <form.AppField name="metadata.validation.isDeprecated">
          {(field) => <field.CheckboxField label="Is Deprecated" />}
        </form.AppField>

        <form.AppField name="metadata.validation.replacedBy">
          {(field) => (
            <field.RelationSelectField
              label="Replaced By"
              placeholder="Select tag..."
              options={tagOptions}
            />
          )}
        </form.AppField>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <form.AppForm>
            <form.SubmitButton mode={mode} />
          </form.AppForm>
        </div>
      </form>
      {/* Relationships manager */}
      {mode === "edit" && data && (
        <div>
          <TagRelationshipsManager
            tag={data}
            // relationships={data.relationships}
            onUpdate={() => router.invalidate()}
          />
          <TagCategoryAssociationsManager
            tag={data}
            onUpdate={() => router.invalidate()}
          />
        </div>
      )}
    </div>
  );
}
