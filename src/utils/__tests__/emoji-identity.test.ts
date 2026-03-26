import { describe, expect, it } from "vitest";
import { isSameEmoji } from "../emoji-identity";

describe("isSameEmoji", () => {
  it("should return false when either argument is undefined", () => {
    expect(isSameEmoji(undefined, undefined)).toBe(false);
    expect(isSameEmoji({ emoji: "😀", label: "grinning face" }, undefined)).toBe(false);
    expect(isSameEmoji(undefined, { emoji: "😀", label: "grinning face" })).toBe(false);
  });

  it("should compare native emojis by emoji string", () => {
    const a = { emoji: "😀", label: "grinning face" };
    const b = { emoji: "😀", label: "grinning face" };
    const c = { emoji: "😂", label: "face with tears of joy" };

    expect(isSameEmoji(a, b)).toBe(true);
    expect(isSameEmoji(a, c)).toBe(false);
  });

  it("should compare custom emojis by id", () => {
    const a = { id: "glue-logo", label: "Glue logo", url: "https://example.com/glue.png" };
    const b = { id: "glue-logo", label: "Glue logo", url: "https://example.com/glue.png" };
    const c = { id: "other-logo", label: "Other logo", url: "https://example.com/other.png" };

    expect(isSameEmoji(a, b)).toBe(true);
    expect(isSameEmoji(a, c)).toBe(false);
  });

  it("should return false when comparing a native emoji to a custom emoji", () => {
    const native = { emoji: "😀", label: "grinning face" };
    const custom = { id: "glue-logo", label: "Glue logo", url: "https://example.com/glue.png" };

    expect(isSameEmoji(native, custom)).toBe(false);
    expect(isSameEmoji(custom, native)).toBe(false);
  });
});
