import { useStore } from "@tanstack/react-form";

import { startCase } from "@/core/utils/format";
import type { POI } from "@/domain/models/location/poi";
import {
  POI_TYPES,
  POI_TYPES_HISTORICAL,
} from "@/domain/models/location/types";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  poiFormSchema,
  poiMetadataSchema,
} from "@/domain/validation/location/poi";
import { CommuneCombobox } from "@/interfaces/backend/actions/location/forms/CommuneCombobox.tsx";

import { Button } from "@/ui/components/core/button";
import { Label } from "@/ui/components/core/label";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { usePOIActions } from "../usePOIActions";

export function POIForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<POI>) {
  const { handleCreate, handleUpdate } = usePOIActions({
    callbacks: {
      onSuccess,
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      type: "landmark" as const,
      communeCode: "",
      codesPath: "",
      namesPath: "",
      latitude: null,
      longitude: null,
      address: "",
      ...data,
      metadata: createMetadata(poiMetadataSchema, data?.metadata),
    } satisfies Omit<POI, "id">,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack form complains
      onChangeAsync: poiFormSchema as any,
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

  const poiTypeOptions = POI_TYPES.map((type) => ({
    value: type,
    label: startCase(type),
  }));

  const type = useStore(form.store, (state) => state.values.type);

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
            label="POI Name"
            placeholder="Enter point of interest name"
            required
          />
        )}
      </form.AppField>

      <form.AppField name="type">
        {(field) => (
          <field.SelectField
            label="POI Type"
            placeholder="Select POI type"
            options={poiTypeOptions}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="communeCode">
        {(field) => {
          return (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Commune *
              </Label>
              <CommuneCombobox
                // TODO: improve, now shows commune.code, not commune.name or commune.namesPath
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  // Update codesPath and namesPath
                  // const selectedCommune =  /* logica per trovare il comune */;
                  // if (selectedCommune) {
                  //   form.setFieldValue("codesPath", selectedCommune.codesPath);
                  //   form.setFieldValue(
                  //     "namesPath",
                  //     `${selectedCommune.namesPath}/${form.getFieldValue("name")}`,
                  //   );
                  // }
                }}
                placeholder="Search and select commune"
              />
            </div>
          );
        }}
      </form.AppField>

      <form.AppField name="address">
        {(field) => (
          <field.TextAreaField
            label="Address"
            placeholder="Enter address (optional)"
          />
        )}
      </form.AppField>

      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="latitude">
          {(field) => (
            <field.NumberField label="Latitude" placeholder="e.g. 40.7128" />
          )}
        </form.AppField>

        <form.AppField name="longitude">
          {(field) => (
            <field.NumberField label="Longitude" placeholder="e.g. -74.0060" />
          )}
        </form.AppField>
      </div>

      {/* Metadata fields for additional information */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Additional Information</h3>

        {/* Historical information for relevant POI types */}
        {POI_TYPES_HISTORICAL.includes(type) && (
          <div className="space-y-3">
            <form.AppField name="metadata.historical.periods">
              {(field) => (
                <field.TextField
                  label="Historical Periods"
                  placeholder="e.g. Medieval, Renaissance (comma separated)"
                />
              )}
            </form.AppField>
          </div>
        )}
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
