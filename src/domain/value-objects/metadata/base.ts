import { z } from "zod";

export const baseSystemMetadataSchema = z.object({
	systemType: z.literal("user-managed"),
	version: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime().optional(),
});

export type BaseSystemMetadata = z.infer<typeof baseSystemMetadataSchema>;

export const listMetadataSchema = z
	.object({
		system: baseSystemMetadataSchema,
	})
	.and(z.record(z.string(), z.unknown())); // Allow additional properties

export type ListMetadata = z.infer<typeof listMetadataSchema>;

export const baseMetadataSchema = z.object({
	notes: z.string().optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	rating: z.number().min(0).max(5).optional(),
	status: z
		.enum(["new", "reviewing", "active", "archived", "favorite"])
		.optional(),
	lastReviewDate: z.string().datetime().optional(),
	mentionsLinks: z.array(z.string()).optional(),
	relatedItems: z
		.array(
			z.object({
				fullName: z.string(),
				// E.g., "alternative", "dependency", "inspiration"
				relationship: z.string(),
			}),
		)
		.optional(),
});

export type BaseMetadata = z.infer<typeof baseMetadataSchema>;

export const listItemMetadataSchema = z
	.object({
		system: baseSystemMetadataSchema,
		metadataTypes: z.union([z.literal("base"), z.string()]).array(),
		base: baseMetadataSchema,
	})
	.and(z.record(z.string(), z.unknown())); // Allow additional properties

export type ListItemMetadata = z.infer<typeof listItemMetadataSchema>;
