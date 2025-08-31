import * as z from "zod";

import {
  newTaxonomySystemSchema,
  taxonomySystemSchema,
} from "../../models/taxonomy/system";
import { createMetadataSchema, sharedSchema } from "../shared";

const { entityId } = sharedSchema;

// ROUTES
export const taxonomySystemRoutesSchema = {
  createSystem: newTaxonomySystemSchema,
  updateSystem: z.object({
    id: entityId,
    data: taxonomySystemSchema,
  }),
  getSystemHierarchy: z.object({
    systemId: entityId,
    maxDepth: z.number().min(1).max(10).optional(),
  }),
};

// METADATA
export const taxonomySystemMetadataSchema = createMetadataSchema(
  "taxonomy-system",
  {
    configuration: z
      .object({
        maxDepth: z.number().min(1).max(10).default(5),
        allowMultipleParents: z.boolean().default(false), // Future: DAG support
        weightingEnabled: z.boolean().default(true),
      })
      .optional(),
    editorial: z
      .object({
        approvalRequired: z.boolean().default(false),
        editorNotes: z.string().optional(),
      })
      .optional(),
  },
);

export type TaxonomySystemMetadata = z.infer<
  typeof taxonomySystemMetadataSchema
>;

// FORM
export const taxonomySystemFormSchema = newTaxonomySystemSchema.extend({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name must be at most 255 characters"),
});
