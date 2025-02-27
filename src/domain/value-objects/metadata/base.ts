import { z } from "zod";

// Base Metadata
export interface BaseSystemMetadata {
	systemType: string;
	version: string;
	createdAt: string;
	updatedAt?: string;
}

export interface ListMetadata {
	system: BaseSystemMetadata;
	[key: string]: unknown; // System-specific metadata
}

export interface ListItemMetadata {
	system: BaseSystemMetadata;
	metadataTypes: string[]; // Registered metadata types
	[key: string]: unknown; // Type-specific metadata
}

export const baseSystemMetadataSchema = z.object({
	systemType: z.string(),
	version: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime().optional(),
});
