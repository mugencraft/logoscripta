import { Button } from "@/ui/components/core/button";
import { DialogStyled } from "@/ui/components/extra/dialog-styled";
import type {
	SelectionAction,
	SelectionConfiguration,
	TableProps,
} from "@/ui/components/table/types";
import type { Row } from "@tanstack/react-table";
import { Fragment, useState } from "react";

interface ActionButtonsProps<TData, T> extends TableProps<TData> {
	selectedRows: Row<TData>[];
	selection?: SelectionConfiguration<TData, T>;
}

export const ActionButtons = <TData, T>({
	table,
	selectedRows,
	selection,
}: ActionButtonsProps<TData, T>) => {
	const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

	const selectedIds = selection?.getSelectedIds(selectedRows) as T[];

	const handleActionComplete = () => {
		setOpenDialogIndex(null);
		table.toggleAllRowsSelected(false);
	};

	const onClick = (action: SelectionAction<T>, index: number) => {
		if (action.dialog) {
			setOpenDialogIndex(index);
		} else {
			action.onClick?.(selectedIds);
			handleActionComplete();
		}
	};

	return (
		<Fragment>
			{selection?.actions.map((action, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				<Fragment key={index}>
					{action.component ? (
						<action.component
							selectedIds={selectedIds}
							onSuccess={handleActionComplete}
							onCancel={() => setOpenDialogIndex(null)}
						/>
					) : (
						<Fragment>
							<Button
								className="flex-1 cursor-pointer"
								variant="outline"
								size={action.icon ? "icon" : "sm"}
								title={action.label}
								onClick={() => onClick(action, index)}
							>
								{action.icon ? <action.icon /> : action.label}
							</Button>
							{action.dialog && openDialogIndex === index && (
								<DialogStyled
									open={true}
									onOpenChange={() => setOpenDialogIndex(null)}
									title={action.dialog.title}
									description="Actions"
								>
									{action.dialog.content({
										selectedIds,
										onSuccess: handleActionComplete,
										onCancel: () => setOpenDialogIndex(null),
									})}
								</DialogStyled>
							)}
						</Fragment>
					)}
				</Fragment>
			))}
		</Fragment>
	);
};
