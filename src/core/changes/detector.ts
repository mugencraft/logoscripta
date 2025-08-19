import { getValueAtPath } from "../utils/object";
import type { Change, ChangeDetectorConfig } from "./types";

/**
 * Detects and classifies changes between two versions of an entity or collection of entities.
 *
 * The detector uses a configurable set of rules to determine:
 * - How to identify entities using a unique ID field
 * - Which fields to track for changes
 * - What type of change has occurred (add, full, soft, or removal)
 */
export class ChangeDetector<T extends Record<string, unknown>> {
  constructor(
    private readonly config: ChangeDetectorConfig,
    private readonly entityType: string,
  ) {
    // Validate all field paths upfront
    const allFields = [
      ...config.trackedFields,
      ...config.updateFields,
      ...config.softUpdateFields,
    ];

    for (const path of allFields) {
      this.validateFieldPath(path);
    }
  }

  /**
   * Analyzes two versions of an entity or collection of entities to detect meaningful changes.
   * When oldEntity is undefined, all entities in newEntity are treated as additions.
   *
   * @param newEntity - Single entity or array of entities representing the new state
   * @param oldEntity - Optional single entity or array of entities representing the previous state
   * @returns Array of detected changes
   */
  detectChanges(newEntity: T | T[], oldEntity?: T | T[]): Change<T>[] {
    // Handle array vs single entity cases
    if (Array.isArray(newEntity)) {
      return this.detectArrayChanges(newEntity, oldEntity as T[] | undefined);
    }

    if (
      !Array.isArray(newEntity) &&
      (!oldEntity || !Array.isArray(oldEntity))
    ) {
      return this.detectSingleEntityChanges(
        newEntity,
        oldEntity as T | undefined,
      );
    }

    throw new Error(
      "Mismatched input types: both inputs must be either arrays or single entities",
    );
  }

  /**
   * Detects changes between a single new entity and its previous version.
   * If oldEntity is undefined, the new entity is treated as an addition.
   */
  private detectSingleEntityChanges(newEntity: T, oldEntity?: T): Change<T>[] {
    this.validateEntityIdField(newEntity);

    if (!oldEntity) {
      return [this.createChange(newEntity, "add")];
    }

    if (this.hasFullChange(oldEntity, newEntity)) {
      return [this.createChange(newEntity, "full")];
    }

    if (this.hasSoftChange(oldEntity, newEntity)) {
      return [this.createChange(newEntity, "soft")];
    }

    return [];
  }

  /**
   * Detects changes between arrays of entities.
   * If oldEntities is undefined, all new entities are treated as additions.
   */
  private detectArrayChanges(newEntities: T[], oldEntities?: T[]): Change<T>[] {
    const changes: Change<T>[] = [];
    const timestamp = new Date().toISOString();

    // Validate all new entities for id field presence
    for (const entity of newEntities) {
      this.validateEntityIdField(entity);
    }

    // If no old entities, treat everything as additions
    if (!oldEntities?.length) {
      return newEntities.map((entity) =>
        this.createChange(entity, "add", timestamp),
      );
    }

    // Create maps for efficient lookup
    const oldEntityMap = new Map(
      oldEntities.map((item) => [this.getEntityId(item), item]),
    );
    const newEntityMap = new Map(
      newEntities.map((item) => [this.getEntityId(item), item]),
    );

    // Check for modifications and additions
    for (const newItem of newEntities) {
      const id = this.getEntityId(newItem);
      const oldItem = oldEntityMap.get(id);

      if (!oldItem) {
        // New item added
        changes.push(this.createChange(newItem, "add", timestamp));
        continue;
      }

      // Check for modifications to existing items
      const itemChanges = this.detectSingleEntityChanges(newItem, oldItem);
      changes.push(
        ...itemChanges.map((change) => ({
          ...change,
          timestamp,
        })),
      );
    }

    // Check for removals
    for (const oldItem of oldEntities) {
      const id = this.getEntityId(oldItem);
      if (!newEntityMap.has(id)) {
        changes.push(this.createChange(oldItem, "removal", timestamp));
      }
    }

    return changes;
  }

  private hasFullChange(oldEntity: T, newEntity: T): boolean {
    return this.config.trackedFields.some((field) => {
      const oldValue = getValueAtPath(oldEntity, field);
      const newValue = getValueAtPath(newEntity, field);
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    });
  }

  private hasSoftChange(oldEntity: T, newEntity: T): boolean {
    return this.config.softUpdateFields.some((field) => {
      const oldValue = getValueAtPath(oldEntity, field);
      const newValue = getValueAtPath(newEntity, field);
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    });
  }

  private validateEntityIdField(entity: T): void {
    if (this.getEntityId(entity) === undefined) {
      throw new Error(
        `Entity missing required id field: ${this.config.idField}`,
      );
    }
  }

  private getEntityId(entity: T): string {
    const id = getValueAtPath(entity, this.config.idField);
    if (id === undefined) {
      throw new Error(`Missing required id field: ${this.config.idField}`);
    }
    return String(id);
  }

  private createChange(
    entity: T,
    type: Change<T>["type"],
    timestamp?: string,
  ): Change<T> {
    return {
      id: this.getEntityId(entity),
      timestamp: timestamp || new Date().toISOString(),
      type,
      entityType: this.entityType,
      data: entity,
    };
  }

  /**
   * Validates a field path string to ensure it is safe for getValueAtPath.
   * Throws an error if the path is invalid to prevent injection attacks.
   *
   * Valid examples: "name", "metadata.tags", "nested.field.value"
   * Invalid examples: "", "field.", ".field", "field[0]"
   */
  private validateFieldPath(path: string): void {
    if (path.includes("..")) {
      throw new Error(`Field path contains empty segments: ${path}`);
    }

    const segments = path.split(".");
    if (segments.some((segment) => segment === "")) {
      throw new Error(`Field path contains empty segments: ${path}`);
    }

    const validPathRegex = /^[a-zA-Z0-9_.]+$/;
    if (!validPathRegex.test(path)) {
      throw new Error(`Invalid field path segment: ${path}`);
    }
  }
}
