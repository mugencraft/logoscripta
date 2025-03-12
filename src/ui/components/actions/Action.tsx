import { Button } from "@/ui/components/core/button";
import { DialogStyled } from "@/ui/components/extra/dialog-styled";
import type { Table } from "@tanstack/react-table";
import { Fragment, useState } from "react";
import type { ActionConfig, ActionTargetType } from "./types";

interface ActionProps<TData> {
	action: ActionConfig<TData>;
	context: ActionTargetType;
	data?: TData;
	selected?: TData[];
	table?: Table<TData>;
	onComplete?: () => void;
}

export function Action<TData>({
	action,
	context,
	data,
	selected,
	table,
	onComplete,
}: ActionProps<TData>) {
	const [dialogOpen, setDialogOpen] = useState(false);

	// Skip rendering if action doesn't apply to this context
	if (action.contexts && !action.contexts.includes(context)) {
		return null;
	}

	const handleActionComplete = () => {
		setDialogOpen(false);
		onComplete?.();
	};

	const handleClick = async () => {
		if (action.dialog) {
			setDialogOpen(true);
		} else if (action.handler) {
			const contextValue = {
				data,
				selected,
				table,
			};
			await action.handler(contextValue);
			onComplete?.();
		}
	};

	// Handle disabled state
	const isDisabled =
		typeof action.disabled === "function"
			? action.disabled({ data, selected, table })
			: action.disabled;

	if (action.component && data) {
		return (
			<action.component
				data={data}
				selected={selected}
				table={table}
				onSuccess={handleActionComplete}
				onCancel={() => setDialogOpen(false)}
			/>
		);
	}

	return (
		<Fragment>
			<Button
				size={action.icon && !action.label ? "icon" : "sm"}
				variant={action.variant || "ghost"}
				title={action.label}
				disabled={isDisabled}
				onClick={handleClick}
			>
				{action.icon && <action.icon className="h-4 w-4" />}
				{context === "view" && <span className="ml-2">{action.label}</span>}
			</Button>

			{action.dialog && dialogOpen && (
				<DialogStyled
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					title={action.dialog.title}
				>
					{action.dialog.content({
						data,
						selected,
						onSuccess: handleActionComplete,
						onCancel: () => setDialogOpen(false),
					})}
				</DialogStyled>
			)}
		</Fragment>
	);
}
