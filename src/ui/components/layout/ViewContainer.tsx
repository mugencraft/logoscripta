import { Button } from "@/ui/components/core/button";
import { useLayout } from "@/ui/components/layout/useLayout";
import type { LucideIcon } from "lucide-react";
import { type PropsWithChildren, type ReactNode, useEffect } from "react";

interface ViewAction {
	label: string;
	onClick?: () => void;
	element?: ReactNode;
	icon?: LucideIcon;
	variant?:
		| "link"
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| null
		| undefined;
}

interface ViewContainerProps extends PropsWithChildren {
	title: string;
	description?: string;
	actions?: ViewAction[];
}

export const ViewContainer = ({
	title,
	description,
	actions,
	children,
}: ViewContainerProps) => {
	const { setHeaderContent, setHeaderButtons } = useLayout();

	useEffect(() => {
		const headerContent = (
			<div className="ml-4 flex gap-2">
				<p className="font-bold">{title}</p>
				<p className="text-muted-foreground">{description}</p>
			</div>
		);
		setHeaderContent(headerContent);

		// Clean up on unmount
		return () => {
			setHeaderContent(null);
		};
	}, [title, description, setHeaderContent]);

	useEffect(() => {
		if (!actions || actions.length === 0) return;
		const headerButtons = (
			<div className="flex gap-2">
				{actions.map((action, index) => (
					<Button
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						variant={action.variant || "outline"}
						onClick={action.element ? undefined : action.onClick}
						className="cursor-pointer"
						title={action.label}
					>
						{action.icon ? (
							<action.icon />
						) : action.element ? (
							action.element
						) : (
							action.label
						)}
					</Button>
				))}
			</div>
		);

		setHeaderButtons(headerButtons);

		// Clean up on unmount
		return () => {
			setHeaderButtons(null);
		};
	}, [actions, setHeaderButtons]);

	return <div className="space-y-4">{children}</div>;
};
