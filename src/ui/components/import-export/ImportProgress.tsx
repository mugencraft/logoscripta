import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Progress } from "@/ui/components/core/progress";
import { ScrollArea } from "@/ui/components/core/scroll-area";

interface GenericProgressUpdate {
  type: "created" | "started" | "progress" | "completed" | "error";
  current?: number;
  total?: number;
  currentItem?: string;
  error?: string;
  stats?: Record<string, number | string[]>;
}

interface ImportProgressProps {
  domain: string; // "images", "tag system", "collections"
  progressData: GenericProgressUpdate | null;
  onComplete: () => void;
  showDetailedStats?: boolean;
}

interface ProgressState {
  currentItem: string;
  completed: number;
  total: number;
  errors: string[];
  isComplete: boolean;
  stats?: Record<string, number | string[]>;
}

export function ImportProgress({
  domain,
  progressData,
  onComplete,
  showDetailedStats = true,
}: ImportProgressProps) {
  const [state, setState] = useState<ProgressState>({
    currentItem: "",
    completed: 0,
    total: 0,
    errors: [],
    isComplete: false,
  });

  useEffect(() => {
    if (!progressData) return;

    switch (progressData.type) {
      case "started":
        setState((prev) => ({
          ...prev,
          total: progressData.total || 0,
          isComplete: false,
        }));
        break;
      case "progress":
        setState((prev) => ({
          ...prev,
          currentItem: progressData.currentItem || "",
          completed: progressData.current || prev.completed,
        }));
        break;
      case "completed":
        setState((prev) => ({
          ...prev,
          isComplete: true,
          stats: progressData.stats,
        }));
        break;
      case "error":
        setState((prev) => ({
          ...prev,
          isComplete: true,
          errors: [...prev.errors, progressData.error || "Unknown error"],
        }));
        break;
    }
  }, [progressData]);

  const progressPercentage =
    state.total > 0 ? (state.completed / state.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">
          {state.isComplete ? "Import Complete" : "Importing..."}
        </h3>
        <p className="text-sm text-muted-foreground">
          {state.isComplete
            ? `Successfully imported ${state.completed} ${domain}`
            : `Processing ${domain}...`}
        </p>
      </div>

      {/* Progress Card - always show */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {state.completed} / {state.total}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {state.currentItem && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Processing: {state.currentItem}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed stats - conditionally show */}
      {showDetailedStats && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Completed</div>
                  <div className="text-2xl font-bold">{state.completed}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium">Errors</div>
                  <div className="text-2xl font-bold">
                    {state.errors.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error log */}
      {state.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {state.errors.map((error) => (
                  <div
                    key={error}
                    className="text-sm text-red-600 p-2 bg-red-50 rounded"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onComplete} disabled={!state.isComplete}>
          {state.isComplete ? "Done" : "Please wait..."}
        </Button>
      </div>
    </div>
  );
}
