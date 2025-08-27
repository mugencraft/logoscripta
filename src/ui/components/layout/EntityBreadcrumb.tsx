import {
  Link,
  type LinkProps,
  type RegisteredRouter,
} from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbItem as ShadcnBreadcrumbItem,
} from "@/ui/components/core/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  link?: LinkProps<RegisteredRouter["routeTree"]>;
  isActive?: boolean;
}

interface EntityBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function EntityBreadcrumb({ items, className }: EntityBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={`${item.label}`}>
            <ShadcnBreadcrumbItem>
              {item.isActive || !item.link ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.link.to} params={item.link.params}>
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </ShadcnBreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
