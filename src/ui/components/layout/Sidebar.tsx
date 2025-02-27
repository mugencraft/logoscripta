import { cn } from "@/ui/utils";
import { Link } from "@tanstack/react-router";
import {
	Archive,
	FolderKanban,
	Home,
	List,
	ListPlus,
	PackageSearch,
	Plus,
	Tags,
	Users,
} from "lucide-react";
import type React from "react";

interface NavItemProps {
	to: string;
	label: string;
	icon: React.ReactNode;
	isCollapsed?: boolean;
	exact?: boolean;
	params?: Record<string, string>;
}

const NavItem = ({
	to,
	label,
	icon,
	isCollapsed,
	exact,
	params,
}: NavItemProps) => (
	<Link
		to={to}
		params={params}
		activeOptions={{ exact: exact ?? false }}
		className={cn(
			"flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-h-[40px]",
			"hover:bg-secondary hover:text-secondary-foreground",
			isCollapsed ? "justify-center w-10" : "justify-start",
		)}
		activeProps={{ className: "bg-secondary text-secondary-foreground" }}
	>
		<div className="flex-shrink-0" title={label}>
			{icon}
		</div>
		<span
			className={cn("transition-all duration-300", isCollapsed && "hidden")}
		>
			{label}
		</span>
	</Link>
);

interface NavGroupProps {
	title: string;
	children: React.ReactNode;
	isCollapsed?: boolean;
}

const NavGroup = ({ title, children, isCollapsed }: NavGroupProps) => (
	<div className="space-y-1">
		{!isCollapsed && (
			<h3 className="px-3 text-sm font-medium bg-muted uppercase tracking-wider">
				{title}
			</h3>
		)}
		<nav className="space-y-1">{children}</nav>
	</div>
);

interface SidebarNavigationProps {
	isCollapsed?: boolean;
}

export const SidebarNavigation = ({ isCollapsed }: SidebarNavigationProps) => {
	return (
		<aside
			className={cn(
				"h-full border-r p-4 bg-muted",
				isCollapsed ? "w-16" : "w-64",
			)}
		>
			<div className="space-y-6">
				{/* Dashboard */}
				<NavGroup title="Overview" isCollapsed={isCollapsed}>
					<NavItem
						to="/"
						label="Dashboard"
						icon={<Home className="w-5 h-5" />}
						isCollapsed={isCollapsed}
						exact
					/>
				</NavGroup>

				{/* Main Navigation */}
				<NavGroup title="Browse" isCollapsed={isCollapsed}>
					<NavItem
						to="/repos"
						label="Repositories"
						icon={<PackageSearch className="w-5 h-5" />}
						isCollapsed={isCollapsed}
						exact
					/>
					<NavItem
						to="/owners"
						label="Owners"
						icon={<Users className="w-5 h-5" />}
						isCollapsed={isCollapsed}
						exact
					/>
					<NavItem
						to="/topics"
						label="Topics"
						icon={<Tags className="w-5 h-5" />}
						isCollapsed={isCollapsed}
						exact
					/>
				</NavGroup>

				{/* Lists */}
				<NavGroup title="Lists" isCollapsed={isCollapsed}>
					<NavItem
						to="/lists"
						label="All Lists"
						icon={<List className="w-5 h-5" />}
						isCollapsed={isCollapsed}
						exact
					/>
					<NavItem
						to="/lists/$id"
						params={{ id: "obsidian-plugin" }}
						label="Obsidian Plugins"
						icon={<FolderKanban className="w-5 h-5" />}
						isCollapsed={isCollapsed}
					/>
					<NavItem
						to="/lists/$id"
						params={{ id: "obsidian-theme" }}
						label="Obsidian Themes"
						icon={<FolderKanban className="w-5 h-5" />}
						isCollapsed={isCollapsed}
					/>
					<NavItem
						to="/lists/$id"
						params={{ id: "archived" }}
						label="Archived Items"
						icon={<Archive className="w-5 h-5" />}
						isCollapsed={isCollapsed}
					/>
					<NavItem
						to="/lists/new"
						label="New List"
						icon={<ListPlus className="w-5 h-5" />}
						isCollapsed={isCollapsed}
						exact
					/>
				</NavGroup>

				{/* Quick Actions */}
				{!isCollapsed && (
					<div className="pt-4 border-t">
						<Link
							to="/lists/new"
							className={cn(
								"flex items-center justify-center gap-2 w-full",
								"px-4 py-2 bg-primary text-primary-foreground rounded-lg",
								"hover:bg-primary/90 transition-colors",
							)}
						>
							<Plus className="w-4 h-4" />
							<span>Create New List</span>
						</Link>
					</div>
				)}
			</div>
		</aside>
	);
};
