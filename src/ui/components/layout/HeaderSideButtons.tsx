import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/ui/components/core/button";
import { useLayout } from "@/ui/hooks/useLayout";
import { ThemeToggle } from "@/ui/theme/ThemeProvider";

export const HeaderSideButtons = () => {
  const { isSidebarCollapsed, setSidebarCollapsed, headerButtons } =
    useLayout();

  return (
    <div className="flex items-center gap-4">
      {headerButtons}
      <ThemeToggle />
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? (
          <PanelLeftOpen className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};
