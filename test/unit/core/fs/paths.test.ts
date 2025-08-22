import { describe, expect, it } from "vitest";

import { getFirstCharacter } from "@/core/utils/format";

describe("File System Path Operations", () => {
  describe("getFirstCharacter", () => {
    it("should return lowercase first character for valid strings", () => {
      expect(getFirstCharacter("Hello")).toBe("h");
      expect(getFirstCharacter("Testing123")).toBe("t");
      expect(getFirstCharacter("UPPERCASE")).toBe("u");
    });

    it("should handle non-alphabetic first characters", () => {
      expect(getFirstCharacter("123Test")).toBe("_");
      expect(getFirstCharacter("!special")).toBe("_");
      expect(getFirstCharacter("")).toBe("_");
    });

    it("should handle special characters", () => {
      expect(getFirstCharacter("Über")).toBe("_");
      expect(getFirstCharacter("École")).toBe("_");
      expect(getFirstCharacter("Ñame")).toBe("_");
    });

    it("should trim whitespace before checking", () => {
      expect(getFirstCharacter(" Hello")).toBe("h");
      expect(getFirstCharacter("  Test")).toBe("t");
    });
  });
});
