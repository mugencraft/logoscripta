import { Button } from "@/ui/components/core/button";

import { useFormContext } from "../context";

export const SubmitButton = ({ mode }: { mode: "create" | "edit" }) => {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isDirty, state.isSubmitting]}
    >
      {([canSubmit, isDirty, isSubmitting]) => (
        <Button
          type="submit"
          disabled={isDisabled(canSubmit, isDirty, isSubmitting)}
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      )}
    </form.Subscribe>
  );
};

const isDisabled = (
  canSubmit?: boolean,
  isDirty?: boolean,
  isSubmitting?: boolean,
) => {
  if (
    undefined === canSubmit ||
    undefined === isDirty ||
    undefined === isSubmitting
  )
    return true;
  return !canSubmit || !isDirty || isSubmitting;
};
