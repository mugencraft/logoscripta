import type { TagSystem } from "@/domain/models/tagging/system";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  tagSystemFormSchema,
  tagSystemMetadataSchema,
} from "@/domain/validation/tagging/system";

import { Button } from "@/ui/components/core/button";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useTagSystemActions } from "../useTagSystemActions";

export function TagSystemForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<TagSystem>) {
  const { handleCreate, handleUpdate } = useTagSystemActions({
    onSuccess,
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      label: "",
      description: "",
      ...data,
      metadata: createMetadata(tagSystemMetadataSchema, data?.metadata),
    } satisfies Omit<TagSystem, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack form complains
      onChangeAsync: tagSystemFormSchema as any,
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
            label="Tag System Name"
            placeholder="Enter tag system name"
            required
          />
        )}
      </form.AppField>

      <form.AppField name="label">
        {(field) => (
          <field.TextAreaField
            label="Label"
            placeholder="Enter display label"
          />
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
