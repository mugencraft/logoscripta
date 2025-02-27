import { TableRow } from "@/ui/components/core/table";
import { cn } from "@/ui/utils";
import type { Row } from "@tanstack/react-table";

interface SelectableRowProps<TData> {
	row: Row<TData>;
	children: React.ReactNode;
	enableRowSelection?: boolean;
}

export function SelectableRow<TData>({
	row,
	children,
	enableRowSelection,
}: SelectableRowProps<TData>) {
	const handleMouseUp = () => {
		if (!enableRowSelection) return;

		// If there's selected text, user was selecting content, not the row
		if (window.getSelection()?.toString()) return;

		row.toggleSelected();
	};

	return (
		<TableRow
			data-state={row.getIsSelected() && "selected"}
			onMouseUp={handleMouseUp}
			className={cn(
				"bg-[var(--color-mono-50)] hover:bg-[var(--color-mono-100)]",
				row.getIsSelected() &&
					"data-[state=selected]:bg-[var(--color-primary-50)] data-[state=selected]:hover:bg-[var(--color-mono-100)]",
			)}
		>
			{children}
		</TableRow>
	);
}
