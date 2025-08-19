import {
  newRepositoryListSchema,
  type RepositoryList,
} from "@/domain/models/github/repository-list";
import { createMetadata } from "@/domain/services/shared/metadata";
import { repositoryListMetadataSchema } from "@/domain/validation/github/repository-list";

import { Button } from "@/ui/components/core/button";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useGithubActions } from "../useGithubActions";

export function ListForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<RepositoryList>) {
  const { handleCreateList, handleUpdateList } = useGithubActions({
    onSuccess,
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      readOnly: false,
      sourceType: "user",
      sourceVersion: "1.0",
      ...data,
      metadata: createMetadata(repositoryListMetadataSchema, data?.metadata),
    },
    validators: { onChange: newRepositoryListSchema.required() },
    onSubmit: async ({ value }) => {
      !data
        ? await handleCreateList({ data: value })
        : await handleUpdateList({
            data: {
              ...value,
              id: data.id,
            },
          });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="List Name"
            placeholder="Enter list name"
            required
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextAreaField
            label="Description"
            placeholder="Enter description (optional)"
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
