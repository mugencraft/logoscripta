import { cn } from "@/ui/utils";

interface StatsPreviewProps {
  stats: Record<string, number>;
  className?: string;
}

export function StatsPreview({ stats, className }: StatsPreviewProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg",
        className,
      )}
    >
      {Object.entries(stats).map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="font-mono text-lg">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
