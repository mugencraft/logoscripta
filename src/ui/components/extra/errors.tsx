import {
  ErrorComponent,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export const RootErrorComponent = ({ error }: ErrorComponentProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold text-destructive">
          Something went wrong!
        </h1>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
};

// Reusable error component for route-specific errors
export const RouteErrorComponent = ({ error }: ErrorComponentProps) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="font-semibold">Error loading content</h2>
      </div>
      <ErrorComponent error={error} />
    </div>
  );
};
