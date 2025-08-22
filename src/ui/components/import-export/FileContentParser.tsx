import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/ui/components/core/button";
import { Label } from "@/ui/components/core/label";
import { Textarea } from "@/ui/components/core/textarea";

import { FileUploadDropzone } from "./FileUploadDropzone";
import { parseCsvToJson } from "./parseCsvToJson";

interface FileContentParserProps {
  onDataParsed: (data: Record<string, unknown>[]) => void;
  onFileNameChange: (name: string) => void;
}

export const FileContentParser = ({
  onDataParsed,
  onFileNameChange,
}: FileContentParserProps) => {
  const [textContent, setTextContent] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<{
    success: boolean;
    message: string;
    recordCount?: number;
  } | null>(null);

  const parseContent = async (content: string, filename: string) => {
    setIsProcessing(true);
    setParseResult(null);

    try {
      const isCSV = filename.toLowerCase().endsWith(".csv");
      const data = isCSV
        ? await parseCsvToJson(new File([content], filename))
        : JSON.parse(content);

      const arrayData = Array.isArray(data) ? data : [data];

      const recordCount = Array.isArray(arrayData) ? arrayData.length : 0;

      onDataParsed(arrayData);
      onFileNameChange(filename);
      setParseResult({
        success: true,
        message: `Successfully parsed ${recordCount} records from ${filename}`,
        recordCount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const errorMessage = `Failed to parse ${filename}: ${message}`;

      setParseResult({
        success: false,
        message: errorMessage,
      });

      toast.error(errorMessage);
    }
    setIsProcessing(false);
  };

  const handleFileSelect = async (file: File) => {
    const content = await file.text();
    await parseContent(content, file.name);
  };

  const handleTextPaste = async () => {
    if (!textContent.trim()) return;

    const content = textContent.trim();
    let filename: string;
    let processedData: Record<string, unknown>[];

    try {
      if (content.startsWith("[") || content.startsWith("{")) {
        // JSON format
        filename = "pasted-content.json";
        const data = JSON.parse(content);
        processedData = Array.isArray(data) ? data : [data];
      } else if (content.includes(",") && content.includes("\n")) {
        // CSV format (contains both commas and newlines)
        filename = "pasted-content.csv";
        processedData = await parseCsvToJson(new File([content], filename));
      } else if (content.includes("\n")) {
        // Line-by-line format (URLs or simple list)
        filename = "pasted-urls.json";
        const lines = content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        // Convert to objects with url property for consistency
        processedData = lines.map((line) => ({ url: line }));
      } else {
        // Single item
        filename = "pasted-content.json";
        processedData = [{ url: content }];
      }

      await parseContent(JSON.stringify(processedData), filename);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const errorMessage = `Failed to parse pasted content: ${message}`;
      setParseResult({
        success: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Upload File</Label>
        <FileUploadDropzone
          onFileSelect={handleFileSelect}
          accept=".json,.csv"
          disabled={isProcessing}
        />
        {isProcessing && (
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            Processing file...
          </div>
        )}
      </div>

      <div>
        <Label>Or Paste Content</Label>
        <Textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Paste JSON, CSV content, or URL list (one per line)..."
          rows={6}
          className="mt-2"
          disabled={isProcessing}
        />
        <Button
          onClick={handleTextPaste}
          disabled={!textContent.trim() || isProcessing}
          className="mt-2"
        >
          {isProcessing ? "Processing..." : "Parse Content"}
        </Button>
      </div>

      {parseResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            parseResult.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {parseResult.message}
        </div>
      )}
    </div>
  );
};
