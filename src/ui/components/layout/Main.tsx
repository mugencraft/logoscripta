import { SidebarNavigation } from "@/ui/components/layout/Sidebar";
import { useLayout } from "@/ui/components/layout/useLayout";
import { cn } from "@/ui/utils";
import { Outlet } from "@tanstack/react-router";

export const MainContent = () => {
	const { isSidebarCollapsed, setSidebarCollapsed } = useLayout();

	if (isSidebarCollapsed === undefined || !setSidebarCollapsed) {
		return null;
	}

	return (
		<div className="flex flex-1 overflow-hidden relative">
			<div
				className={cn(
					"absolute top-0 bottom-0 z-10  transition-all duration-300 ease-in-out",
					isSidebarCollapsed ? "w-16" : "w-64",
				)}
			>
				<SidebarNavigation isCollapsed={isSidebarCollapsed} />
			</div>

			<main
				className={cn(
					"flex-1 overflow-auto p-4 transition-all duration-300",
					isSidebarCollapsed ? "ml-16" : "ml-64",
				)}
			>
				<Outlet />
			</main>
		</div>
	);
};
