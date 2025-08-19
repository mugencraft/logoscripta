import { beforeEach, describe, expect, it } from "vitest";

import { ChangeDetector } from "@/core/changes/detector";

import { sampleChangeDetectorConfig } from "test/fixtures/entities/changes";
import {
  createComplexTestEntity,
  createTestEntity,
  type SampleComplexTestEntity,
  type SampleTestEntity,
} from "test/fixtures/entities/test-entity";

describe("ChangeDetector", () => {
  const previous = createTestEntity();
  const detector = new ChangeDetector<SampleTestEntity>(
    sampleChangeDetectorConfig,
    "test-entity",
  );

  describe("basic change detection", () => {
    it("should return empty array when no changes are detected", () => {
      const current = createTestEntity();

      const result = detector.detectChanges(current, previous);
      expect(result).toStrictEqual([]);
    });

    it("should detect full changes for tracked update fields", () => {
      const current = createTestEntity({ name: "Updated Name" });

      const result = detector.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });

    it("should detect soft changes for metadata updates", () => {
      const current = createTestEntity({
        metadata: { ...previous.metadata, views: 200 },
      });

      const result = detector.detectChanges(current, previous);
      expect(result[0]?.type).toBe("soft");
    });
  });

  describe("change type prioritization", () => {
    it("should prioritize full changes over soft changes", () => {
      const current = createTestEntity({
        name: "Updated Name",
        metadata: { ...previous.metadata, views: 200 },
      });

      const result = detector.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });

    it("should treat tracked field changes as full changes", () => {
      const current = createTestEntity({
        metadata: { ...previous.metadata, tags: ["new", "tags"] },
      });

      const result = detector.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });
  });

  describe("special value handling", () => {
    it("should handle undefined field values", () => {
      const previous = createTestEntity();
      const current = createTestEntity({
        metadata: { ...previous.metadata, views: undefined },
      });

      const result = detector.detectChanges(current, previous);
      expect(result[0]?.type).toBe("soft");
    });

    it("should handle null field values", () => {
      const detector = new ChangeDetector<SampleTestEntity>(
        sampleChangeDetectorConfig,
        "test-entity",
      );
      const previous = createTestEntity();
      const current = createTestEntity({
        metadata: { ...previous.metadata, views: null },
      });

      const result = detector.detectChanges(current, previous);
      expect(result[0]?.type).toBe("soft");
    });

    it("should handle array changes", () => {
      const detector = new ChangeDetector<SampleTestEntity>(
        sampleChangeDetectorConfig,
        "test-entity",
      );
      const previous = createTestEntity();
      const current = createTestEntity({
        metadata: {
          ...previous.metadata,
          // biome-ignore lint/style/noNonNullAssertion: it's set in the factory
          tags: [...previous.metadata.tags!, "new"],
        },
      });

      const result = detector.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });
  });

  describe("field validation", () => {
    it("should validate required idField exists", () => {
      const { id: _, ...currentWithoutId } = createTestEntity();

      expect(() =>
        detector.detectChanges(currentWithoutId as SampleTestEntity, previous),
      ).toThrow(/Missing required id field/);
    });

    it("should throw error for empty path segments", () => {
      expect(
        () =>
          new ChangeDetector<SampleTestEntity>(
            {
              ...sampleChangeDetectorConfig,
              trackedFields: ["metadata..views"],
            },
            "test-entity",
          ),
      ).toThrow(/empty segments/);
    });

    it("should throw error for paths with invalid characters", () => {
      expect(
        () =>
          new ChangeDetector<SampleTestEntity>(
            {
              ...sampleChangeDetectorConfig,
              trackedFields: ["metadata[*]"],
            },
            "test-entity",
          ),
      ).toThrow(/Invalid field path segment/);
    });
  });

  describe("array mode detection", () => {
    const previous = [
      createTestEntity({ id: "test-1" }),
      createTestEntity({ id: "test-2" }),
    ];
    const detector = new ChangeDetector<SampleTestEntity>(
      {
        ...sampleChangeDetectorConfig,
      },
      "test-entity",
    );

    it("should return empty array when no changes are detected", () => {
      const current = [...previous];
      const result = detector.detectChanges(current, previous);
      expect(result).toEqual([]);
    });

    it("should detect new items added to array", () => {
      const newEntity = createTestEntity({ id: "test-3" });
      const current = [...previous, newEntity];

      const result = detector.detectChanges(current, previous);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "test-3",
        type: "add",
        data: newEntity,
      });
    });

    it("should detect items removed from array", () => {
      const current = [previous[0]] as SampleTestEntity[]; // Remove second item

      const result = detector.detectChanges(current, previous);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "test-2",
        type: "removal",
        data: previous[1],
      });
    });

    it("should detect modifications to existing items", () => {
      const current = [
        { ...previous[0], name: "Updated Name" },
        previous[1],
      ] as SampleTestEntity[];

      const result = detector.detectChanges(current, previous);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "test-1",
        type: "full",
        data: current[0],
      });
    });

    it("should detect multiple types of changes simultaneously", () => {
      const newEntity = createTestEntity({ id: "test-3" });
      const current = [
        { ...previous[0], name: "Updated Name" },
        newEntity,
      ] as SampleTestEntity[];

      const result = detector.detectChanges(current, previous);
      expect(result).toHaveLength(3);

      const changes = {
        modifications: result.filter((c) => c.id === "test-1"),
        removals: result.filter((c) => c.id === "test-2"),
        additions: result.filter((c) => c.id === "test-3"),
      };

      expect(changes.modifications[0]).toMatchObject({
        type: "full",
        data: current[0],
      });
      expect(changes.removals[0]).toMatchObject({
        type: "removal",
        data: previous[1],
      });
      expect(changes.additions[0]).toMatchObject({
        type: "add",
        data: newEntity,
      });
    });

    it("should handle empty arrays", () => {
      const result = detector.detectChanges([], []);
      expect(result).toEqual([]);
    });

    it("should handle null or undefined values in arrays", () => {
      const invalidPrevious = [...previous, null] as SampleTestEntity[];
      const invalidCurrent = [...previous, undefined] as SampleTestEntity[];

      expect(() =>
        detector.detectChanges(invalidPrevious, invalidCurrent),
      ).toThrow(/Missing required id field/);
    });

    describe("change type detection in array mode", () => {
      it("should detect soft changes in array items", () => {
        const current = [
          {
            ...previous[0],
            metadata: { ...previous[0]?.metadata, views: 200 },
          },
          previous[1],
        ] as SampleTestEntity[];

        const result = detector.detectChanges(current, previous);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: "test-1",
          type: "soft",
          data: current[0],
        });
      });

      it("should prioritize full changes over soft changes in array items", () => {
        const current = [
          {
            ...previous[0],
            name: "Updated Name",
            metadata: { ...previous[0]?.metadata, views: 200 },
          },
          previous[1],
        ] as SampleTestEntity[];

        const result = detector.detectChanges(current, previous);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: "test-1",
          type: "full",
          data: current[0],
        });
      });
    });

    describe("error handling in array mode", () => {
      it("should validate id field in all array items", () => {
        const invalidItem = { ...createTestEntity(), id: undefined };
        const current = [...previous, invalidItem];

        // @ts-expect-error - we're intentionally testing the error message
        expect(() => detector.detectChanges(current, previous)).toThrow(
          /Missing required id field/,
        );
      });

      it("should handle malformed entity objects", () => {
        const malformedItem = { randomField: "value" };
        const current = [...previous, malformedItem];

        // @ts-expect-error - we're intentionally testing the error message
        expect(() => detector.detectChanges(current, previous)).toThrow(
          /Missing required id field/,
        );
      });
    });
  });
});

describe("ChangeDetector Complex Scenarios", () => {
  let sut: ChangeDetector<SampleComplexTestEntity>;

  beforeEach(() => {
    sut = new ChangeDetector(
      {
        idField: "id",
        trackedFields: ["metadata.nested.field", "metadata.tags", "status"],
        updateFields: ["metadata.nested.field", "status"],
        softUpdateFields: ["metadata.views"],
      },
      "test-entity",
    );
  });

  describe("nested object changes", () => {
    it("should detect deep property changes", () => {
      const previous = createComplexTestEntity({
        metadata: { nested: { field: "old" } },
      });
      const current = createComplexTestEntity({
        metadata: { nested: { field: "new" } },
      });

      const result = sut.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });

    it("should handle missing nested properties", () => {
      const previous = createComplexTestEntity({
        metadata: { nested: { field: "value" } },
      });
      const current = createComplexTestEntity({
        metadata: { nested: {} },
      });

      const result = sut.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });
  });

  describe("array changes", () => {
    it("should detect array order changes", () => {
      const previous = createComplexTestEntity({
        metadata: { tags: ["a", "b", "c"] },
      });
      const current = createComplexTestEntity({
        metadata: { tags: ["c", "a", "b"] },
      });

      const result = sut.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });

    it("should detect array item modifications", () => {
      const previous = createComplexTestEntity({
        metadata: { tags: [{ id: 1, value: "old" }] },
      });
      const current = createComplexTestEntity({
        metadata: { tags: [{ id: 1, value: "new" }] },
      });

      const result = sut.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });
  });

  describe("multiple field changes", () => {
    it("should prioritize full changes over soft changes", () => {
      const previous = createComplexTestEntity({
        status: "old",
        metadata: { views: 100 },
      });
      const current = createComplexTestEntity({
        status: "new",
        metadata: { views: 200 },
      });

      const result = sut.detectChanges(current, previous);
      expect(result[0]?.type).toBe("full");
    });
  });
});
