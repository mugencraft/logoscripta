import { Button } from "@/ui/components/core/button";
import { useLayout } from "@/ui/components/layout/useLayout";
import { ThemeToggle } from "@/ui/theme/ThemeProvider";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

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
