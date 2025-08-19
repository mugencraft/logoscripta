export interface BaseSampleTestEntity extends Record<string, unknown> {
  id: string;
}

// Make all metadata fields optional to support partial updates in tests
export interface SampleTestEntity extends BaseSampleTestEntity {
  id: string;
  name?: string;
  description?: string;
  status: string;
  metadata: {
    views?: number | null;
    likes?: number;
    tags?: string[];
  };
}

export interface SampleComplexTestEntity extends BaseSampleTestEntity {
  id: string;
  status: string;
  metadata: {
    nested?: {
      field?: string;
    };
    tags?: Array<string | { id: number; value: string }>;
    views?: number;
  };
}

export const createTestEntity = (
  overrides: Partial<SampleTestEntity> = {},
): SampleTestEntity => ({
  id: "test-1",
  name: "Test Entity",
  description: "A test entity",
  status: "active",
  metadata: {
    views: 100,
    likes: 50,
    tags: ["test", "sample"],
  },
  ...overrides,
});

export const createComplexTestEntity = (
  overrides: Partial<SampleComplexTestEntity> = {},
): SampleComplexTestEntity => ({
  id: "test-1",
  status: "active",
  ...overrides,
  metadata: {
    nested: {
      field: "value",
    },
    tags: [{ id: 1, value: "test" }],
    views: 100,
    ...overrides?.metadata,
  },
});
