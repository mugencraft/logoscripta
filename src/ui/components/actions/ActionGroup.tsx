import type { Table } from "@tanstack/react-table";
import { Action } from "./Action";
import type { ActionConfig, ActionTargetType } from "./types";

interface ActionGroupProps<TData> {
	actions: ActionConfig<TData>[];
	context: ActionTargetType;
	data?: TData;
	selected?: TData[];
	table?: Table<TData>;
	onActionComplete?: () => void;
}

export function ActionGroup<TData>({
	actions,
	context,
	data,
	selected,
	table,
	onActionComplete,
}: ActionGroupProps<TData>) {
	return (
		<div className="flex items-center gap-2">
			{actions.map((action) => (
				<Action
					key={action.id}
					action={action}
					context={context}
					data={data}
					selected={selected}
					table={table}
					onComplete={onActionComplete}
				/>
			))}
		</div>
	);
}
