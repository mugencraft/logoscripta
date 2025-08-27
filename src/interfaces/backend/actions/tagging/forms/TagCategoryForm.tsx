import { startCase } from "@/core/utils/format";
import type { TagCategory } from "@/domain/models/tagging/category";
import { TAG_LAYOUTS } from "@/domain/models/tagging/types";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  tagCategoryFormSchema,
  tagCategoryMetadataSchema,
} from "@/domain/validation/tagging/category";
import { trpc } from "@/interfaces/server-client";

import { Button } from "@/ui/components/core/button";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useTagCategoryActions } from "../useTagCategoryActions";

export function TagCategoryForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<TagCategory>) {
  const { handleCreate, handleUpdate } = useTagCategoryActions({
    callbacks: {
      onSuccess,
    },
  });

  const { data: systems } = trpc.tagging.systems.getAll.useQuery();
  const { data: groups } = trpc.tagging.groups.getAll.useQuery();
  const { data: tags } = trpc.tagging.tags.getAll.useQuery();

  const systemOptions =
    systems?.map((system) => ({
      value: system.id.toString(),
      label: system.name,
    })) || [];

  const groupOptions =
    groups?.map((group) => ({
      value: group.id.toString(),
      label: group.name,
    })) || [];

  const tagOptions =
    tags?.map((tag) => ({
      value: tag.name,
      label: tag.name,
    })) || [];

  const layoutOptions = TAG_LAYOUTS.map((layout) => ({
    value: layout,
    label: startCase(layout),
  }));

  const form = useAppForm({
    defaultValues: {
      name: "",
      label: "",
      description: "",
      groupId: 0,
      systemId: 0,
      ...data,
      metadata: createMetadata(tagCategoryMetadataSchema, data?.metadata),
    } satisfies Omit<TagCategory, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack form complains
      onChangeAsync: tagCategoryFormSchema as any,
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
            label="Category Name"
            placeholder="Enter category name"
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

      <form.AppField name="groupId">
        {(field) => (
          <field.RelationSelectField
            label="Tag Group"
            placeholder="Select group..."
            options={groupOptions}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="systemId">
        {(field) => (
          <field.RelationSelectField
            label="Tag System"
            placeholder="Select system..."
            options={systemOptions}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="metadata.display.icon">
        {(field) => (
          <field.IconField label="Icon" placeholder="Search icons..." />
        )}
      </form.AppField>

      <form.AppField name="metadata.display.color">
        {(field) => (
          <field.ColorField label="Display Color" placeholder="Select color" />
        )}
      </form.AppField>

      <form.AppField name="metadata.display.order">
        {(field) => (
          <field.NumberField
            label="Display Order"
            placeholder="0"
            min={0}
            step={1}
          />
        )}
      </form.AppField>

      <form.AppField name="metadata.display.layoutType">
        {(field) => (
          <field.SelectField label="Layout" options={layoutOptions} />
        )}
      </form.AppField>

      <form.AppField name="metadata.display.sectionGroup">
        {(field) => (
          <field.TextField
            label="Section Group"
            placeholder="e.g. primary, upper-body, effects"
          />
        )}
      </form.AppField>

      <form.AppField name="metadata.display.sectionOrder">
        {(field) => (
          <field.NumberField
            label="Section Order"
            placeholder="0"
            min={0}
            step={1}
          />
        )}
      </form.AppField>

      <form.AppField name="metadata.rules.oneOfKind">
        {(field) => <field.CheckboxField label="One of Kind" />}
      </form.AppField>

      <form.AppField name="metadata.rules.toggledBy">
        {(field) => (
          <field.RelationSelectField
            label="Toggled By Tag"
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
  );
}
