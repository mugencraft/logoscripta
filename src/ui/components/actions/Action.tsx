import { useState } from "react";

import { Button } from "@/ui/components/core/button";
import { DialogStyled } from "@/ui/components/extra/dialog-styled";

import type { ActionProps } from "./types";

export function Action<TData>({
  action,
  context,
  data,
  selected,
  onSuccess,
}: ActionProps<TData>) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Skip rendering if action doesn't apply to this context
  if (action.contexts && !action.contexts.includes(context)) {
    return null;
  }

  const handleActionSuccess = () => {
    setDialogOpen(false);
    onSuccess?.();
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (action.dialog) {
      setDialogOpen(true);
    } else if (action.handler) {
      const contextValue = {
        data,
        selected,
      };
      await action.handler(contextValue);
      onSuccess?.();
    }
  };

  // Handle disabled state
  const isDisabled =
    typeof action.disabled === "function"
      ? action.disabled({ data, selected })
      : action.disabled;

  return (
    <>
      <Button
        size={action.icon && !action.label ? "icon" : "sm"}
        variant={action.variant || "ghost"}
        title={action.label}
        disabled={isDisabled}
        onClick={handleClick}
      >
        {action.icon && <action.icon className="h-4 w-4" />}
        {context === "view" && <span className="ml-2">{action.label}</span>}
      </Button>

      {action.dialog && dialogOpen && (
        <DialogStyled
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={action.dialog.title}
        >
          {action.dialog.content({
            data,
            selected,
            onSuccess: handleActionSuccess,
            onCancel: () => setDialogOpen(false),
          })}
        </DialogStyled>
      )}
    </>
  );
}
