import { type PropsWithChildren, useEffect } from "react";

import { ActionGroup } from "@/ui/components/actions/ActionGroup";
import type { ActionConfig } from "@/ui/components/actions/types";

import { useLayout } from "../../hooks/useLayout";

interface ViewContainerProps<TData, TTableData extends TData = TData>
  extends PropsWithChildren {
  title: string;
  description?: string;
  actions?: ActionConfig<TData>[];
  selected?: TTableData[];
  data?: TData;
}

export const ViewContainer = <TData, TTableData extends TData = TData>({
  title,
  description,
  actions = [],
  selected,
  data,
  children,
}: ViewContainerProps<TData, TTableData>) => {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: setHeaderButtons is not needed
  useEffect(() => {
    if (actions.length === 0) return;

    const headerButtons = (
      <ActionGroup
        actions={actions}
        context="view"
        data={data}
        selected={selected}
      />
    );

    setHeaderButtons(headerButtons);

    return () => {
      setHeaderButtons(null);
    };
  }, [actions, data, selected]);

  return <div className="space-y-4">{children}</div>;
};
