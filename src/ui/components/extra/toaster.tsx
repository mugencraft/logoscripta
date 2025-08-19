import { Toaster as SonnerToaster } from "sonner";

import { useTheme } from "@/ui/theme/ThemeProvider";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      theme={theme as "light" | "dark" | undefined}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "font-sans border border-border rounded-md",
          title: "text-base font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/90",
          success: "bg-background border-success text-foreground",
          error: "bg-background border-destructive text-foreground",
          warning: "bg-background border-amber-500 text-foreground",
          info: "bg-background text-foreground",
        },
      }}
    />
  );
}
