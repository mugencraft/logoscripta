import { Action } from "./Action";
import type { ActionsProps } from "./types";

export function ActionGroup<TData>({
  actions,
  context,
  data,
  selected,
  onSuccess,
}: ActionsProps<TData>) {
  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <Action
          key={action.id}
          action={action}
          context={context}
          data={data}
          selected={selected}
          onSuccess={onSuccess}
        />
      ))}
    </div>
  );
}
