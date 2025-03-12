import type { Table } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

export type ActionTargetType = "view" | "row" | "selection";

interface ActionContext<TData> {
	data?: TData;
	selected?: TData[];
	table?: Table<TData>;
}

export interface ActionConfig<TData> {
	id: string;
	label: string;
	icon?: LucideIcon;
	variant?:
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| "primary";
	disabled?: boolean | ((context: ActionContext<TData>) => boolean);
	handler?: (context: ActionContext<TData>) => void | Promise<void>;
	dialog?: {
		title: string;
		content: (props: ActionDialogProps<TData>) => ReactNode;
	};
	component?: ComponentType<ActionComponentProps<TData>>;
	element?: ReactNode;
	contexts?: ActionTargetType[];
}

interface ActionDialogProps<TData> {
	data?: TData;
	selected?: TData[];
	table?: Table<TData>;
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface ActionComponentProps<TData> extends ActionDialogProps<TData> {
	table?: Table<TData>;
}
