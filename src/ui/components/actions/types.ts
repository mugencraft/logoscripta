import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { Button } from "@/ui/components/core/button";

/** contexts where to show the action */
type ActionTargetType = "view" | "row" | "selection";

export interface ActionCallbacks {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface BaseDataProps<TData> {
  data?: TData;
  selected?: TData[];
}

export interface BaseActionProps<TData>
  extends ActionCallbacks,
    BaseDataProps<TData> {}

interface ActionResult<TData> {
  success: boolean;
  data?: TData;
  error?: string[];
  count?: number;
}

export type ActionHandler<TData> = (
  props: BaseActionProps<TData>,
) => Promise<ActionResult<TData>>;

export interface ActionConfig<TData> {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean | ((props: BaseActionProps<TData>) => boolean);
  handler?: ActionHandler<TData>;
  dialog?: {
    title: string;
    content: (props: BaseActionProps<TData>) => ReactNode;
  };
  contexts: ActionTargetType[];
}

export interface ActionProps<TData> extends BaseActionProps<TData> {
  action: ActionConfig<TData>;
  context: ActionTargetType;
}

export interface ActionsProps<TData> extends BaseDataProps<TData> {
  actions: ActionConfig<TData>[];
  context: ActionTargetType;
  onSuccess?: () => void;
}
