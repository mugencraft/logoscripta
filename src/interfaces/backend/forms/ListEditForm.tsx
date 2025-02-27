import { useListOperations } from "@/interfaces/backend/hooks/useListOperations";
import { Button } from "@/ui/components/core/button";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import type { StepProps } from "@/ui/components/table/types";
import { useForm } from "@tanstack/react-form";

interface ListEditFormProps extends StepProps<string> {
	listId: number;
	initialName: string;
	initialDescription?: string;
}

export function ListEditForm({
	listId,
	initialName,
	initialDescription = "",
	onCancel,
}: ListEditFormProps) {
	const { updateList } = useListOperations();

	const form = useForm({
		defaultValues: {
			name: initialName,
			description: initialDescription,
		},
		onSubmit: async ({ value }) => {
			await updateList({
				listId,
				data: value,
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Enter list name"
						/>
						{field.state.meta.errors && (
							<span className="text-destructive">
								{field.state.meta.errors.join(", ")}
							</span>
						)}
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Input
							id="description"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Enter list description"
						/>
					</div>
				)}
			</form.Field>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={!form.state.canSubmit || form.state.isSubmitting}
				>
					{form.state.isSubmitting ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
