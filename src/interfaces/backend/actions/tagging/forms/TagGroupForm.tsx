import { useMemo } from "react";

import type { TagGroup } from "@/domain/models/tagging/group";
import { createMetadata } from "@/domain/services/shared/metadata";
import {
  tagGroupFormSchema,
  tagGroupMetadataSchema,
} from "@/domain/validation/tagging/group";
import { trpc } from "@/interfaces/server-client";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import type { BaseFormProps } from "@/ui/components/forms/types";
import { useAppForm } from "@/ui/components/forms/useAppForm";

import { useTagGroupActions } from "../useTagGroupActions";
import { TagGroupVisualizerManager } from "./visualizer/TagGroupVisualizerManager";

export function TagGroupForm({
  mode,
  data,
  onSuccess,
  onCancel,
}: BaseFormProps<TagGroup>) {
  const { handleCreate, handleUpdate } = useTagGroupActions({
    callbacks: {
      onSuccess,
    },
  });

  const { data: systems } = trpc.tagging.systems.getAll.useQuery();

  const systemsOptions =
    systems?.map((system) => ({
      value: system.id.toString(),
      label: system.name,
    })) || [];

  const defaultValues = useMemo(() => {
    return {
      name: "",
      label: "",
      description: "",
      systemId: 0,
      ...data,
      metadata: createMetadata(tagGroupMetadataSchema, {
        ...data?.metadata,
      }),
    } satisfies Omit<TagGroup, "id">;
  }, [data]);

  const form = useAppForm({
    defaultValues,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: Tanstack form complains
      onChangeAsync: tagGroupFormSchema as any,
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
      <ScrollArea className="h-[calc(80vh)] space-y-4">
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Group Name"
                  placeholder="Enter group name"
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="label">
              {(field) => (
                <field.TextField
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
          </CardContent>
        </Card>

        {/* Display Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Display & Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="metadata.display.icon">
                {(field) => (
                  <field.IconField label="Icon" placeholder="Search icons..." />
                )}
              </form.AppField>

              <form.AppField name="metadata.display.color">
                {(field) => (
                  <field.ColorField
                    label="Display Color"
                    placeholder="Select color"
                  />
                )}
              </form.AppField>
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <form.AppField name="metadata.display.sectionsPerRow">
                {(field) => (
                  <field.NumberField
                    label="Sections Per Row"
                    placeholder="1"
                    min={1}
                    max={4}
                    step={1}
                  />
                )}
              </form.AppField>

              <form.AppField name="metadata.display.showSectionTitles">
                {(field) => <field.CheckboxField label="Show Section Titles" />}
              </form.AppField>
            </div>
          </CardContent>
        </Card>
        {data && (
          <Card>
            <CardHeader>
              <CardTitle>Visual Mapper</CardTitle>
            </CardHeader>
            <CardContent>
              {data && <TagGroupVisualizerManager group={data} />}
            </CardContent>
          </Card>
        )}
      </ScrollArea>

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
