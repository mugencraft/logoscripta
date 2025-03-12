import type { BaseMetadata } from "@/domain/value-objects/metadata/base";
import type { ListItemExtended } from "@/interfaces/server-client";
import { useEffect, useState } from "react";

type StatusValue = "new" | "reviewing" | "active" | "archived" | "favorite";

export function useMetadataEditor(
	items: ListItemExtended[],
	isSingleItem: boolean,
) {
	const [metadata, setMetadata] = useState<BaseMetadata>({
		notes: "",
		category: "",
		tags: [],
		rating: 0,
		status: "new" as StatusValue,
		lastReviewDate: new Date().toISOString(),
		relatedItems: [],
	});

	const [modifiedFields, setModifiedFields] = useState<Set<keyof BaseMetadata>>(
		new Set(),
	);

	const [hasVariedValues, setHasVariedValues] = useState<
		Partial<Record<keyof BaseMetadata, boolean>>
	>({});

	const [tagInput, setTagInput] = useState("");
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize metadata from items
	useEffect(() => {
		if (items.length === 0 || isInitialized) return;

		// For single item, simply copy the metadata
		if (isSingleItem) {
			const baseMetadata = items[0]?.metadata?.base || {};
			setMetadata({
				notes: baseMetadata.notes || "",
				category: baseMetadata.category || "",
				tags: baseMetadata.tags || [],
				rating: baseMetadata.rating || 0,
				status: baseMetadata.status || "new",
				lastReviewDate: baseMetadata.lastReviewDate || new Date().toISOString(),
				relatedItems: baseMetadata.relatedItems || [],
			});

			// Set tags input for single item
			if (baseMetadata.tags) {
				setTagInput(baseMetadata.tags.join(", "));
			}
			setIsInitialized(true);
			return;
		}

		// For multiple items, find common values or mark fields as varied
		const varied: Partial<Record<keyof BaseMetadata, boolean>> = {};
		const commonValues: Partial<BaseMetadata> = {};

		// Check each field across all items
		for (const field of ["notes", "category", "rating", "status"] as const) {
			const values = new Set();

			// Collect unique values for this field
			for (const item of items) {
				const value = item.metadata?.base?.[field];
				if (value !== undefined) {
					values.add(typeof value === "object" ? JSON.stringify(value) : value);
				}
			}

			if (values.size === 1) {
				// All items have the same value for this field
				const value = items[0]?.metadata?.base?.[field];
				// @ts-expect-error
				commonValues[field] = value !== undefined ? value : "";
			} else {
				// Items have different values for this field
				varied[field] = true;

				// Initialize with empty/default value
				if (field === "rating") {
					commonValues[field] = 0;
				} else if (field === "status") {
					commonValues[field] = "new";
				} else {
					commonValues[field] = "";
				}
			}
		}

		// Handle tags separately (array comparison)
		const allTags = items.map((item) => item.metadata?.base?.tags || []);
		if (allTags.length > 0) {
			const firstTags = JSON.stringify(allTags[0]);
			const tagsMatch = allTags.every(
				(tags) => JSON.stringify(tags) === firstTags,
			);

			if (tagsMatch) {
				commonValues.tags = allTags[0];
				if (allTags[0]) setTagInput(allTags[0].join(", "));
			} else {
				varied.tags = true;
				commonValues.tags = [];
				setTagInput("");
			}
		}

		setHasVariedValues(varied);
		setMetadata((prev) => ({
			...prev,
			...commonValues,
		}));
		setIsInitialized(true);
	}, [items, isSingleItem, isInitialized]);

	// Update a field and mark it as modified
	const updateField = <K extends keyof BaseMetadata>(
		field: K,
		value: BaseMetadata[K],
	) => {
		setMetadata((prev) => ({
			...prev,
			[field]: value,
		}));

		// Track this field as modified
		if (!isSingleItem) {
			setModifiedFields((prev) => {
				const newSet = new Set(prev);
				newSet.add(field);
				return newSet;
			});
		}
	};

	// Process metadata for submission
	const getSubmissionMetadata = () => {
		const processedMetadata: BaseMetadata = {
			...metadata,
		};

		// Handle tags separately because of the input field
		if (modifiedFields.has("tags") || isSingleItem) {
			processedMetadata.tags = tagInput
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag);
		}

		// For multiple items, only include fields that were modified
		const metadataToUpdate: Partial<BaseMetadata> = isSingleItem
			? processedMetadata
			: Object.fromEntries(
					Array.from(modifiedFields).map((field) => [
						field,
						processedMetadata[field],
					]),
				);

		return metadataToUpdate as BaseMetadata;
	};

	return {
		metadata,
		hasVariedValues,
		tagInput,
		setTagInput,
		updateField,
		getSubmissionMetadata,
		markTagsModified: () => {
			if (!isSingleItem) {
				setModifiedFields((prev) => {
					const newSet = new Set(prev);
					newSet.add("tags");
					return newSet;
				});
			}
		},
	};
}
