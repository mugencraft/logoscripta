import { Button } from "@/ui/components/core/button";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import type { InteractionProps } from "@/ui/components/table/types";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useListActions } from "../hooks/useListActions";

export function NewListForm({ onSuccess, onCancel }: InteractionProps<number>) {
	const { handleCreateList } = useListActions({ onSuccess });
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			const list = await handleCreateList(value.name, value.description);
			if (!list) {
				toast.error("Failed to create list");
				onCancel?.();
				return;
			}

			toast.success(`List ${list.name} created successfully`);

			navigate({
				to: "/lists/$id",
				params: { id: list.id.toString() },
			});
		},
	});

	const onCancelClick = () => {
		if (onCancel) {
			onCancel();
		} else {
			navigate({ to: "/lists" });
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-4 max-w-xl"
		>
			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="name">List Name</Label>
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
							placeholder="Enter list description (optional)"
						/>
					</div>
				)}
			</form.Field>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancelClick}>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={!form.state.canSubmit || form.state.isSubmitting}
				>
					{form.state.isSubmitting ? "Creating..." : "Create List"}
				</Button>
			</div>
		</form>
	);
}
