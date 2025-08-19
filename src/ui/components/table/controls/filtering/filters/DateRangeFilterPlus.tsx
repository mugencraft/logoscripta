import type { Column } from "@tanstack/react-table";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";

import { DateRangeFilter } from "./DateRangeFilter";

export const DateRangeFilterPlus = <TData,>({
  column,
}: {
  column: Column<TData, unknown>;
}) => {
  const [customRange, setCustomRange] = useState(false);
  const timeRangeOptions = getTimeRangeOptions();

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      setCustomRange(true);
      return;
    }

    const now = new Date();
    const days = Number.parseInt(value.replace("d", ""), 10);
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    column.setFilterValue([start.toISOString(), now.toISOString()]);
  };

  return (
    <div className="space-y-2">
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full bg-mono-50 cursor-pointer">
          <SelectValue placeholder="Select time range..." />
        </SelectTrigger>
        <SelectContent className="bg-mono-50">
          {timeRangeOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-primary focus:bg-primary cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {customRange && <DateRangeFilter column={column} />}
    </div>
  );
};

const getTimeRangeOptions = () => [
  { label: "Last 24 hours", value: "1d" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "90d" },
  { label: "Last 6 months", value: "180d" },
  { label: "Last year", value: "365d" },
];
