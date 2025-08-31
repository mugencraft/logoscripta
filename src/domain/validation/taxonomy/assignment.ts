import * as z from "zod";

import { newContentTaxonomyTopicSchema } from "../../models/taxonomy/assignment";
import { TAXONOMY_SOURCES } from "../../models/taxonomy/types";
import { sharedSchema } from "../shared";

const { entityId } = sharedSchema;

// ROUTES
export const taxonomyAssignmentRoutesSchema = {
  assignTopic: newContentTaxonomyTopicSchema,
  unassignTopic: z.object({
    contentId: entityId,
    topicId: entityId,
  }),
  updateAssignment: z.object({
    contentId: entityId,
    topicId: entityId,
    data: z.object({
      weight: z.number().min(0).max(1).optional(),
      source: z.enum(TAXONOMY_SOURCES).optional(),
    }),
  }),
  bulkAssignTopics: z.array(newContentTaxonomyTopicSchema),
  getContentTopics: z.object({
    contentId: entityId,
    systemId: entityId.optional(),
  }),
};
