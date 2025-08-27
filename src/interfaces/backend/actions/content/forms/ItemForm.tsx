import { startCase } from "@/core/utils/format";
import type { ContentItem } from "@/domain/models/content/item";
import { CONTENT_TYPES } from "@/domain/models/content/types";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  contentItemFormSchema,
  contentItemMetadataSchema,
} from "@/domain/validation/content/item";

import { Button } from "@/ui/components/core/button";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useItemActions } from "../../../actions/content/useItemActions";

export function ItemForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<ContentItem>) {
  const { handleCreate, handleUpdate } = useItemActions({
    callbacks: {
      onSuccess,
    },
  });

  const form = useAppForm({
    defaultValues: {
      identifier: "",
      title: "",
      contentType: "image",
      collectionId: 0,
      rawTags: "",
      ...data,
      metadata: createMetadata(contentItemMetadataSchema, data?.metadata),
    } satisfies Omit<ContentItem, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack form complains
      onChangeAsync: contentItemFormSchema as any,
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

  const contentTypeOptions = CONTENT_TYPES.map((type) => ({
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
      <form.AppField name="identifier">
        {(field) => (
          <field.TextField
            label="Identifier"
            placeholder="Enter unique identifier"
            required
          />
        )}
      </form.AppField>

      <form.AppField name="title">
        {(field) => (
          <field.TextField label="Title" placeholder="Enter title (optional)" />
        )}
      </form.AppField>

      <form.AppField name="contentType">
        {(field) => (
          <field.SelectField
            label="Content Type"
            placeholder="Select content type"
            options={contentTypeOptions}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="rawTags">
        {(field) => (
          <field.TextAreaField
            label="Raw Tags"
            placeholder="Enter comma-separated tags"
          />
        )}
      </form.AppField>

      {/* <form.AppField name="collectionId">
				{(field) => (
					<field.CollectionSelectField
						label="Collection"
						placeholder="Select collection..."
						required
					/>
				)}
			</form.AppField> */}

      {/* <form.AppField name="tagIds">
				{(field) => (
					<field.MultiTagSelectField
						label="Tags"
						placeholder="Select tags..."
						// collectionId={formData.collectionId} // Filter relevant tags
					/>
				)}
			</form.AppField> */}

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
