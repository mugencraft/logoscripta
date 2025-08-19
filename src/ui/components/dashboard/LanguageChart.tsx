import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

import type { DashboardData } from "./ActivityChart";

interface LanguageChartProps {
  languages: DashboardData["languages"];
}

export const LanguageChart = ({ languages }: LanguageChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Top Languages</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {languages.map(({ language, count, percentage }) => (
          <div key={language} className="flex items-center">
            <div className="w-36 font-medium">{language}</div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="w-12 text-right text-sm text-muted-foreground">
              {count}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
