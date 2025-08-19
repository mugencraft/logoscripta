import type { Change, ChangeDetectorConfig } from "@/core/changes/types";

import type { BaseSampleTestEntity } from "./test-entity";

export function createTestChange<T extends BaseSampleTestEntity>(
  entityType: string,
  data: T,
  type: "full" | "soft" | "removal" = "full",
  timestamp?: string,
): Change<T> {
  return {
    id: data.id ?? "test-1",
    timestamp: timestamp ?? new Date().toISOString(),
    type,
    entityType,
    data,
  };
}

export const sampleChangeDetectorConfig: ChangeDetectorConfig = {
  idField: "id",
  trackedFields: ["name", "description", "status", "metadata.tags"],
  updateFields: ["name", "description", "status"],
  softUpdateFields: ["metadata.views", "metadata.likes"],
};
