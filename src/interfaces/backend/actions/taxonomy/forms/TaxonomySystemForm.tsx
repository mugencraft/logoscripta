import { startCase } from "@/core/utils/format";
import type { TaxonomySystem } from "@/domain/models/taxonomy/system";
import { TAXONOMY_SYSTEM_TYPES } from "@/domain/models/taxonomy/types";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  taxonomySystemFormSchema,
  taxonomySystemMetadataSchema,
} from "@/domain/validation/taxonomy/system";

import { Button } from "@/ui/components/core/button";
import { Label } from "@/ui/components/core/label";
import { Switch } from "@/ui/components/core/switch";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useSystemActions } from "../useSystemActions";

export function TaxonomySystemForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<TaxonomySystem>) {
  const { handleCreate, handleUpdate } = useSystemActions({
    callbacks: { onSuccess },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      label: "",
      description: "",
      type: "editorial",
      isActive: true,
      ...data,
      metadata: createMetadata(taxonomySystemMetadataSchema, data?.metadata),
    } satisfies Omit<TaxonomySystem, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack Form complains
      onChangeAsync: taxonomySystemFormSchema as any,
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

  const typeOptions = TAXONOMY_SYSTEM_TYPES.map((type) => ({
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
            label="System Name"
            placeholder="Enter unique system name"
            required
          />
        )}
      </form.AppField>

      <form.AppField name="label">
        {(field) => (
          <field.TextField
            label="Display Label"
            placeholder="Enter display label (optional)"
          />
        )}
      </form.AppField>

      <form.AppField name="type">
        {(field) => (
          <field.SelectField
            label="System Type"
            placeholder="Select system type"
            options={typeOptions}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.TextAreaField
            label="Description"
            placeholder="Describe the purpose and scope of this taxonomy system"
          />
        )}
      </form.AppField>

      <form.AppField name="isActive">
        {(field) => (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.state.value}
              onCheckedChange={field.handleChange}
            />
            <Label className="text-sm font-medium">System is active</Label>
          </div>
        )}
      </form.AppField>

      {/* Advanced Configuration Section */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-sm">Configuration</h4>

        <form.AppField name="metadata.configuration.maxDepth">
          {(field) => (
            <field.NumberField
              label="Maximum Depth"
              placeholder="5"
              min={1}
              max={10}
              description="Maximum hierarchy levels allowed (1-10)"
            />
          )}
        </form.AppField>

        <form.AppField name="metadata.configuration.allowMultipleParents">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
              <Label className="text-sm">Allow multiple parents</Label>
            </div>
          )}
        </form.AppField>

        <form.AppField name="metadata.configuration.weightingEnabled">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
              <Label className="text-sm">Enable topic weighting</Label>
            </div>
          )}
        </form.AppField>
      </div>

      {/* Editorial Settings */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium text-sm">Editorial Settings</h4>

        <form.AppField name="metadata.editorial.approvalRequired">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
              <Label className="text-sm">Require approval for changes</Label>
            </div>
          )}
        </form.AppField>

        <form.AppField name="metadata.editorial.editorNotes">
          {(field) => (
            <field.TextAreaField
              label="Editor Notes"
              placeholder="Internal notes for editors"
            />
          )}
        </form.AppField>
      </div>

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
