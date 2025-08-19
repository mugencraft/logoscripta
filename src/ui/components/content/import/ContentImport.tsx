import type { LucideIcon } from "lucide-react";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

export interface ImportAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
  handler?: () => void;
}

interface ContentImportProps {
  importActions: ImportAction[];
}

export const ContentImport = ({ importActions }: ContentImportProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Content</CardTitle>
        <p className="text-sm text-muted-foreground">
          Import various types of content into collections
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importActions.map((action) => (
            <Card
              key={action.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  {action.icon && (
                    <action.icon className="h-5 w-5 text-primary" />
                  )}
                  <h3 className="font-medium">{action.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {action.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.handler}
                  className="w-full"
                >
                  Start Import
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
