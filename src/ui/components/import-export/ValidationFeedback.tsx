import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/ui/components/core/alert";

type ValidationStatus = "success" | "warning" | "error";

export interface ValidationMessage {
  status: ValidationStatus;
  message: string;
  details?: string[];
}

interface ValidationFeedbackProps {
  messages: ValidationMessage[];
  domain?: string;
}

export function ValidationFeedback({
  messages,
  domain,
}: ValidationFeedbackProps) {
  if (messages.length === 0) return null;

  const getIcon = (status: ValidationStatus) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "warning":
        return <AlertCircle className={`${iconClass} text-yellow-500`} />;
      case "error":
        return <XCircle className={`${iconClass} text-red-500`} />;
    }
  };

  const getVariant = (status: ValidationStatus) => {
    switch (status) {
      case "success":
        return "default";
      case "warning":
        return "default";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <Alert key={msg.message} variant={getVariant(msg.status)}>
          <div className="flex items-start space-x-2">
            <AlertTitle>{getIcon(msg.status)}</AlertTitle>
            <div className="flex-1">
              <AlertDescription>
                {domain && msg.status === "error"
                  ? `${domain} validation failed: ${msg.message}`
                  : msg.message}
              </AlertDescription>

              {/* Show details list if provided */}
              {msg.details && msg.details.length > 0 && (
                <ul className="mt-2 ml-4 text-sm list-disc space-y-1">
                  {msg.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
