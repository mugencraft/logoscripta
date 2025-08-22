import { CheckCircle, XCircle } from "lucide-react";

import type { ImportProgressUpdate } from "@/domain/models/content/types";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/ui/components/core/alert";
import { Button } from "@/ui/components/core/button";
import { Card, CardContent } from "@/ui/components/core/card";

interface ImportResultProps {
  domain: string;
  result: ImportProgressUpdate;
  onComplete: () => void;
}

export const ImportResult = ({
  domain,
  result,
  onComplete,
}: ImportResultProps) => {
  if (result.type === "error") {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button onClick={onComplete}>Close</Button>
        </div>
      </div>
    );
  }

  if (result.type === "completed" && result.stats) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium">Import Completed</h3>
          <p className="text-sm text-muted-foreground">
            Successfully processed {result.stats.itemsCreated} {domain}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Created</div>
                  <div className="text-2xl font-bold">
                    {result.stats.itemsCreated}
                  </div>
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
                    {Array.isArray(result.stats.errors)
                      ? result.stats.errors.length
                      : 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onComplete}>Done</Button>
        </div>
      </div>
    );
  }

  return null;
};
