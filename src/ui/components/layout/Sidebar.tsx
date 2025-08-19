import {
  Link,
  type RegisteredRouter,
  type ValidateLinkOptions,
} from "@tanstack/react-router";
import type React from "react";

import { ScrollArea } from "@/ui/components/core/scroll-area";
import { cn } from "@/ui/utils";

/**
 * Navigation group interface with proper generic constraints
 * @template TRouter - The router type, defaults to RegisteredRouter
 * @template TOptions - The link options type for validation
 */
export interface NavGroup<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  /** Group title displayed in the sidebar */
  title: string;
  /** Array of navigation items for this group */
  items: NavItem<TRouter, TOptions>[];
  /** Whether the group is in collapsed state */
  isCollapsed?: boolean;
}

/**
 * Navigation item interface with validated link options
 * @template TRouter - The router type, defaults to RegisteredRouter
 * @template TOptions - The link options type for validation
 */
interface NavItem<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  /** Type-safe link configuration validated against router */
  link: ValidateLinkOptions<TRouter, TOptions>;
  /** Display label for the navigation item */
  label: string;
  /** React icon component for the navigation item */
  icon: React.ReactNode;
  /** Whether the item is in collapsed state */
  isCollapsed?: boolean;
}

/**
 * Navigation group component with proper overloads
 * Renders a group of navigation items with optional title
 */
export function NavGroup<TRouter extends RegisteredRouter, TOptions>({
  title,
  items,
  isCollapsed,
}: NavGroup<TRouter, TOptions>): React.ReactNode;
export function NavGroup({
  title,
  items,
  isCollapsed,
}: NavGroup): React.ReactNode {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-3 text-sm font-medium bg-muted uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <NavItemElement
            key={item.label}
            label={item.label}
            link={item.link}
            icon={item.icon}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </div>
  );
}

/**
 * Navigation item component with proper overloads
 * Renders a single navigation link with icon and label
 */
export function NavItemElement<TRouter extends RegisteredRouter, TOptions>({
  label,
  link,
  icon,
  isCollapsed,
}: NavItem<TRouter, TOptions>): React.ReactNode;
export function NavItemElement({
  label,
  link,
  icon,
  isCollapsed,
}: NavItem): React.ReactNode {
  return (
    <Link
      {...link}
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
}

/**
 * Sidebar navigation props interface
 * @template TRouter - The router type, defaults to RegisteredRouter
 * @template TOptions - The link options type for validation
 */
interface SidebarNavigationProps<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  /** Array of navigation groups to display */
  groups: NavGroup<TRouter, TOptions>[];
  /** Whether the sidebar is in collapsed state */
  isCollapsed?: boolean;
}

/**
 * Main sidebar navigation component with proper overloads
 * Provides navigation to all application sections with type-safe routing
 */
export function SidebarNavigation<TRouter extends RegisteredRouter, TOptions>({
  groups,
  isCollapsed,
}: SidebarNavigationProps<TRouter, TOptions>): React.ReactNode;
export function SidebarNavigation({
  groups,
  isCollapsed,
}: SidebarNavigationProps): React.ReactNode {
  return (
    <ScrollArea
      className={cn(
        "h-full border-r p-4 bg-muted",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="space-y-6  mb-8">
        {groups.map((group) => (
          <NavGroup
            key={group.title}
            title={group.title}
            items={group.items}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
