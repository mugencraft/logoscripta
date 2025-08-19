import { vi } from "vitest";

export function setupTestTime(date: string | Date = "2024-01-01") {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(date));
}

export function advanceTimeByDays(days: number) {
  const currentDate = new Date();
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + days);
  vi.setSystemTime(newDate);
  return newDate;
}
