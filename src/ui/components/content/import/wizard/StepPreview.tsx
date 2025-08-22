import {
  AlertCircle,
  CheckCircle,
  FileImage,
  FileText,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  ContentItemWithStats,
  ContentType,
  ImportPreviewHandler,
  PreviewItem,
} from "@/domain/models/content/types";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { ScrollArea } from "@/ui/components/core/scroll-area";
import { ValidationFeedback } from "@/ui/components/import-export/ValidationFeedback";

import { parseImportData } from "./parseImportData";
import type { ImportSourceData } from "./StepSourceSelector";

interface StepPreviewProps {
  contentType: ContentType;
  data: ImportSourceData;
  existingItems?: ContentItemWithStats[];
  onGetImportPreview?: ImportPreviewHandler;
  onConfirm: () => void;
  onBack: () => void;
}

export function StepPreview({
  contentType,
  data,
  existingItems = [],
  onGetImportPreview,
  onConfirm,
  onBack,
}: StepPreviewProps) {
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    return previewItems.reduce(
      (acc, item) => {
        acc.total++;
        acc[item.status]++;
        return acc;
      },
      { total: 0, new: 0, exists: 0, error: 0 },
    );
  }, [previewItems]);

  const loadPreviewData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await parseImportData(
        data,
        contentType,
        existingItems,
        onGetImportPreview,
      );
      setPreviewItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadPreviewData changes on every re-render
  useEffect(() => {
    loadPreviewData();
  }, [contentType, data, onGetImportPreview, existingItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Analyzing {contentType}...</p>
        </div>
      </div>
    );
  }

  const validationMessages = error
    ? [
        {
          status: "error" as const,
          message: error,
        },
      ]
    : [];

  if (error) {
    return (
      <ValidationFeedback
        messages={validationMessages}
        domain="Content preview"
      />
    );
  }

  const getStatusIcon = (status: PreviewItem["status"]) => {
    const icons = {
      new: <CheckCircle className="h-4 w-4 text-green-500" />,
      exists: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      error: <XCircle className="h-4 w-4 text-red-500" />,
    };
    return icons[status];
  };

  const getTypeIcon = (itemType: string) =>
    itemType.startsWith("image") ? (
      <FileImage className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium">Import Preview</h3>
        <p className="text-sm text-muted-foreground">
          Review {stats.total} items before importing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div
                className={`text-2xl font-bold ${
                  key === "new"
                    ? "text-green-600"
                    : key === "exists"
                      ? "text-yellow-600"
                      : key === "error"
                        ? "text-red-600"
                        : ""
                }`}
              >
                {value}
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {key === "exists" ? "Existing" : key}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Items to Import</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="grid grid-cols-1 gap-3">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 rounded border hover:bg-accent/5"
                >
                  {/* Thumbnail */}
                  {item.preview && (
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Status and type icons */}
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.type}
                      {item.metadata?.tags && (
                        <span className="ml-2">
                          • {item.metadata.tags.length} tags
                        </span>
                      )}
                    </div>
                    {item.metadata?.caption && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.metadata.caption}
                      </div>
                    )}
                  </div>

                  <Badge
                    variant={
                      item.status === "new"
                        ? "default"
                        : item.status === "exists"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={stats.new === 0}
          className="bg-primary"
        >
          Import {stats.new} New Items
        </Button>
      </div>
    </div>
  );
}
