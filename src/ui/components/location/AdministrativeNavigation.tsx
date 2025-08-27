import { Link } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import type { LinkPropsType } from "@/ui/components/layout/types";

export type LocationLink = { path: LinkPropsType["to"]; label: string };

export const AdministrativeNavigation = ({
  links,
}: {
  links: LocationLink[];
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browse Administrative Levels</CardTitle>
        <CardDescription>
          Navigate through the geographic hierarchy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {links.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="font-medium">{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
