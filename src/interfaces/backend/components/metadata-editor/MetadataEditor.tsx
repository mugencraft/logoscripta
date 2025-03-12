import type { ListItemExtended } from "@/interfaces/server-client";
import { Button } from "@/ui/components/core/button";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import { RadioGroup, RadioGroupItem } from "@/ui/components/core/radio-group";
import { Textarea } from "@/ui/components/core/textarea";
import { CategoryPanel } from "@/ui/components/extra/category-panel/CategoryPanel";
import type { InteractionProps } from "@/ui/components/table/types";
import { Rating } from "@smastrom/react-rating";
import { useMemo } from "react";
import { pluginCategories } from "../../config/categories";
import { useListActions } from "../../hooks/useListActions";
import { MetadataFormField } from "./MetadataFormField";
import { useMetadataEditor } from "./useMetadataEditor";

type MetadataEditorProps = InteractionProps<ListItemExtended> & {
	listId: number;
};

const statusOptions = [
	{ value: "new", label: "New" },
	{ value: "reviewing", label: "Reviewing" },
	{ value: "active", label: "Active" },
	{ value: "archived", label: "Archived" },
	{ value: "favorite", label: "Favorite" },
] as const;

type StatusValue = (typeof statusOptions)[number]["value"];

export function MetadataEditor({
	listId,
	onSuccess,
	onCancel,
	...props
}: MetadataEditorProps) {
	// Determine if we're handling a single row or multiple selections
	const isSingleItem = !!props.row;

	// Create a stable reference to the items array
	const items = useMemo(
		() =>
			isSingleItem ? (props.row ? [props.row] : []) : props.selected || [],
		[isSingleItem, props.row, props.selected],
	);

	const {
		metadata,
		hasVariedValues,
		tagInput,
		setTagInput,
		updateField,
		getSubmissionMetadata,
		markTagsModified,
	} = useMetadataEditor(items, isSingleItem);

	const { handleAddToList } = useListActions();

	const handleSubmit = async () => {
		if (items.length === 0) return;

		const metadataToUpdate = getSubmissionMetadata();

		for (const item of items) {
			await handleAddToList(listId, [item.fullName], {
				base: metadataToUpdate,
			});
		}

		onSuccess?.();
	};

	return (
		<div className="space-y-4">
			<MetadataFormField
				id="notes"
				label="Notes"
				hasVariedValues={hasVariedValues.notes}
			>
				<Textarea
					id="notes"
					value={metadata.notes || ""}
					onChange={(e) => updateField("notes", e.target.value)}
					placeholder={
						hasVariedValues.notes
							? "Items have different notes - editing will update all selected items"
							: "Add notes about this repository"
					}
					className="h-24"
				/>
			</MetadataFormField>

			<MetadataFormField
				id="category"
				label="Category"
				hasVariedValues={hasVariedValues.category}
			>
				<CategoryPanel
					value={metadata.category || ""}
					onChange={(value) => updateField("category", value)}
					groups={pluginCategories}
					placeholder={
						hasVariedValues.category
							? "Multiple categories selected"
							: "Select a category"
					}
					// allowCustomValues={true}
					// recentKey="recentCategories"
				/>
			</MetadataFormField>

			<MetadataFormField
				id="tags"
				label="Tags"
				hasVariedValues={hasVariedValues.tags}
			>
				<Input
					placeholder={
						hasVariedValues.tags
							? "Items have different tags - editing will update all selected items"
							: "Add some tags (comma separated)"
					}
					value={tagInput}
					onChange={(e) => {
						setTagInput(e.target.value);
						markTagsModified();
					}}
				/>
			</MetadataFormField>

			<MetadataFormField
				id="rating"
				label="Rating (1-5)"
				hasVariedValues={hasVariedValues.rating}
			>
				<Rating
					id="rating"
					style={{ maxWidth: 180 }}
					value={metadata.rating || 0}
					onChange={(value: number) => updateField("rating", value)}
				/>
			</MetadataFormField>

			<MetadataFormField
				label="Status"
				hasVariedValues={hasVariedValues.status}
			>
				<RadioGroup
					value={metadata.status || "new"}
					onValueChange={(value: StatusValue) => updateField("status", value)}
					className="flex space-x-2"
				>
					{statusOptions.map((option) => (
						<div key={option.value} className="flex items-center space-x-1">
							<RadioGroupItem
								value={option.value}
								id={`status-${option.value}`}
							/>
							<Label htmlFor={`status-${option.value}`}>{option.label}</Label>
						</div>
					))}
				</RadioGroup>
			</MetadataFormField>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={handleSubmit}>
					{isSingleItem
						? "Update Metadata"
						: `Update Metadata for ${items.length} Items`}
				</Button>
			</div>
		</div>
	);
}
