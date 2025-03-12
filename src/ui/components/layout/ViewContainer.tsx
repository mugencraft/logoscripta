import { ActionGroup } from "@/ui/components/actions/ActionGroup";
import type { ActionConfig } from "@/ui/components/actions/types";
import { type PropsWithChildren, useEffect } from "react";
import { useLayout } from "./useLayout";

interface ViewContainerProps<TData> extends PropsWithChildren {
	title: string;
	description?: string;
	actions?: ActionConfig<TData>[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data?: any;
}

export const ViewContainer = <TData,>({
	title,
	description,
	actions = [],
	data,
	children,
}: ViewContainerProps<TData>) => {
	const { setHeaderContent, setHeaderButtons } = useLayout();

	useEffect(() => {
		const headerContent = (
			<div className="ml-4 flex gap-2">
				<p className="font-bold">{title}</p>
				<p className="text-muted-foreground">{description}</p>
			</div>
		);
		setHeaderContent(headerContent);

		return () => {
			setHeaderContent(null);
		};
	}, [title, description, setHeaderContent]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: setHeaderButtons
	useEffect(() => {
		if (!actions || actions.length === 0) return;

		const headerButtons = (
			<ActionGroup actions={actions} context="view" data={data} />
		);

		setHeaderButtons(headerButtons);

		return () => {
			setHeaderButtons(null);
		};
	}, [actions, data]);

	return <div className="space-y-4">{children}</div>;
};
