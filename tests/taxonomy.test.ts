import { describe, it, expect } from "vitest";
import { STYLES, TEMPERAMENTS, canonTag } from "@/lib/taxonomy";

describe("taxonomy", () => {
  it("is the fixed enum", () => {
    expect(STYLES).toHaveLength(10);
    expect(TEMPERAMENTS).toHaveLength(5);
    expect(STYLES).toContain("Neo-Traditional");
    expect(TEMPERAMENTS).toContain("Ornate");
  });

  it("canonTag resolves case-insensitively", () => {
    expect(canonTag(STYLES, "neo-traditional")).toBe("Neo-Traditional");
    expect(canonTag(STYLES, "  DARK FANTASY ")).toBe("Dark Fantasy");
    expect(canonTag(TEMPERAMENTS, "bold")).toBe("Bold");
  });

  it("canonTag rejects unknown / non-strings", () => {
    expect(canonTag(STYLES, "steampunk")).toBeNull();
    expect(canonTag(STYLES, 42)).toBeNull();
    expect(canonTag(STYLES, null)).toBeNull();
  });
});
