import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

export type LocationAction = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
};

interface LocationActionsProps {
  quickActions: LocationAction[];
}

export const PoiActions = ({ quickActions }: LocationActionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quickActions.map((action) => (
        <Card
          key={action.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <action.icon className="h-5 w-5" />
              {action.title}
            </CardTitle>
            <CardDescription>{action.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {action.href ? (
              <Link to={action.href}>
                <Button className="w-full">Access</Button>
              </Link>
            ) : (
              <Button onClick={action.action} className="w-full">
                Execute
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
