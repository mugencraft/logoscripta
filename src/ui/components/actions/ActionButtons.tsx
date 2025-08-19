import { ActionGroup } from "./ActionGroup";
import type { ActionsProps } from "./types";

export const ActionButtons = <TData,>({
  actions,
  selected,
  context,
  onSuccess,
}: ActionsProps<TData>) => {
  return (
    <ActionGroup
      actions={actions}
      context={context}
      selected={selected}
      onSuccess={onSuccess}
    />
  );
};
