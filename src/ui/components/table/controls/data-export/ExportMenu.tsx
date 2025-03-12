import type { ExportFormat } from "@/core/serialization/export";
import { Button } from "@/ui/components/core/button";
import type { Table } from "@tanstack/react-table";
import {
	Copy,
	Download,
	FileJson,
	FileSpreadsheet,
	FileText,
} from "lucide-react";
import { useState } from "react";
import { useDataExport } from "./useDataExport";

interface ExportMenuProps<T> {
	data: T[];
	title?: string;
	fileName?: string;
	table?: Table<T>;
	onComplete?: () => void;
}

export function ExportMenu<T extends Record<string, unknown>>({
	data,
	title = "Export Data",
	fileName = "export",
	onComplete,
	table,
}: ExportMenuProps<T>) {
	const [isCopying, setIsCopying] = useState(false);

	const { exportData, copyData, isExporting } = useDataExport({
		data,
		defaultOptions: { fileName },
	});

	// filter data to only include visible columns
	const getFilteredData = () => {
		if (!table) return data;

		const visibleColumns = table.getVisibleLeafColumns();

		return data.map((row) => {
			const filteredRow: Record<string, unknown> = {};

			for (const column of visibleColumns) {
				const colId = column.id;

				// Skip utility columns like selection columns
				if (colId === "select-col") continue;
				// Handle columns with accessor functions
				if ("accessorFn" in column.columnDef) {
					try {
						filteredRow[colId] = (
							column.columnDef as {
								accessorFn: (row: T, index: number) => unknown;
							}
						).accessorFn(row, 0);
					} catch (e) {
						// Skip if accessor function fails
					}
				}
				// Handle columns with accessorKey
				else if (
					"accessorKey" in column.columnDef &&
					typeof column.columnDef.accessorKey === "string"
				) {
					filteredRow[colId] = row[column.columnDef.accessorKey];
				}
				// Direct property access if no accessor is defined
				else if (Object.prototype.hasOwnProperty.call(row, colId)) {
					filteredRow[colId] = row[colId];
				}
			}

			return filteredRow;
		});
	};

	const handleExport = async (format: ExportFormat) => {
		const filteredData = getFilteredData();
		// @ts-expect-error
		await exportData(format, {}, filteredData);
		onComplete?.();
	};

	const handleCopy = async (format: ExportFormat) => {
		setIsCopying(true);
		const filteredData = getFilteredData();
		// @ts-expect-error
		await copyData(format, {}, filteredData);
		setIsCopying(false);
		onComplete?.();
	};

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-medium">{title}</h3>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{/* CSV Option */}
				<div className="border rounded-md p-4">
					<div className="flex justify-between items-start">
						<div className="flex flex-col">
							<FileSpreadsheet className="h-8 w-8 mb-2" />
							<span className="font-medium">CSV</span>
							<span className="text-sm text-muted-foreground">
								Spreadsheet format
							</span>
						</div>
						<div className="space-y-2">
							<Button
								size="sm"
								onClick={() => handleExport("csv")}
								disabled={isExporting}
							>
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleCopy("csv")}
								disabled={isCopying}
							>
								<Copy className="h-4 w-4 mr-2" />
								Copy
							</Button>
						</div>
					</div>
				</div>

				{/* JSON Option */}
				<div className="border rounded-md p-4">
					<div className="flex justify-between items-start">
						<div className="flex flex-col">
							<FileJson className="h-8 w-8 mb-2" />
							<span className="font-medium">JSON</span>
							<span className="text-sm text-muted-foreground">
								Structured data
							</span>
						</div>
						<div className="space-y-2">
							<Button
								size="sm"
								onClick={() => handleExport("json")}
								disabled={isExporting}
							>
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleCopy("json")}
								disabled={isCopying}
							>
								<Copy className="h-4 w-4 mr-2" />
								Copy
							</Button>
						</div>
					</div>
				</div>

				{/* Markdown Option */}
				<div className="border rounded-md p-4">
					<div className="flex justify-between items-start">
						<div className="flex flex-col">
							<FileText className="h-8 w-8 mb-2" />
							<span className="font-medium">Markdown</span>
							<span className="text-sm text-muted-foreground">
								Table format
							</span>
						</div>
						<div className="space-y-2">
							<Button
								size="sm"
								onClick={() => handleExport("markdown")}
								disabled={isExporting}
							>
								<Download className="h-4 w-4 mr-2" />
								Export
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleCopy("markdown")}
								disabled={isCopying}
							>
								<Copy className="h-4 w-4 mr-2" />
								Copy
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
