import {
  Link,
  type LinkProps,
  type RegisteredRouter,
} from "@tanstack/react-router";
import type React from "react";

import { ScrollArea } from "@/ui/components/core/scroll-area";
import { cn } from "@/ui/utils";

interface SidebarNavigationProps {
  groups: NavGroup[];
  isCollapsed?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  isCollapsed?: boolean;
}

interface NavItem {
  link: LinkProps<RegisteredRouter["routeTree"]>;
  label: string;
  icon: React.ReactNode;
  isCollapsed?: boolean;
}

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
