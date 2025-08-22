import { startCase } from "@/core/utils/format";
import type { ContentCollection } from "@/domain/models/content/collection";
import {
  COLLECTION_LAYOUTS,
  CONTENT_TYPES,
} from "@/domain/models/content/types";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  contentCollectionFormSchema,
  contentCollectionMetadataSchema,
} from "@/domain/validation/content/collection";
import { useCollectionActions } from "@/interfaces/backend/actions/content/useCollectionActions";

import { Button } from "@/ui/components/core/button";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

export function CollectionForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<ContentCollection>) {
  const { handleCreate, handleUpdate } = useCollectionActions({
    onSuccess,
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      type: "mixed",
      ...data,
      metadata: createMetadata(contentCollectionMetadataSchema, data?.metadata),
    } satisfies Omit<ContentCollection, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack form complains
      onChangeAsync: contentCollectionFormSchema as any,
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

  const typeOptions = CONTENT_TYPES.map((type) => ({
    value: type,
    label: startCase(type),
  }));

  const layoutOptions = COLLECTION_LAYOUTS.map((type) => ({
    value: type,
    label: startCase(type),
  }));

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
            label="Collection Name"
            placeholder="Enter collection name"
            required
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

      <form.AppField name="type">
        {(field) => (
          <field.SelectField
            label="Content Type"
            placeholder="Select content type"
            options={typeOptions}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="metadata.display.layout">
        {(field) => (
          <field.SelectField
            label="Description"
            placeholder="Enter description"
            options={layoutOptions}
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
