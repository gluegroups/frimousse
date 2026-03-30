import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SHORTCODES_DATA = {
  "2705": ["check_mark_button", "white_check_mark"],
  "1F44B": "waving_hand",
  "1F1FA-1F1F8": "us",
};

function mockFetch(data: unknown) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    json: () => Promise.resolve(data),
  } as Response);
}

describe("loadShortcodes / getShortcodesForEmoji", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("should return [] before shortcodes are loaded", async () => {
    const { getShortcodesForEmoji } = await import("../shortcodes");

    expect(getShortcodesForEmoji("✅")).toEqual([]);
  });

  it("should fetch and populate shortcodes", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes, getShortcodesForEmoji } = await import("../shortcodes");

    await loadShortcodes();

    expect(getShortcodesForEmoji("✅️")).toEqual(["check_mark_button", "white_check_mark"]);
  });

  it("should normalize a single-string shortcode to an array", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes, getShortcodesForEmoji } = await import("../shortcodes");

    await loadShortcodes();

    expect(getShortcodesForEmoji("👋")).toEqual(["waving_hand"]);
  });

  it("should handle compound emoji hexcodes (e.g. flag)", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes, getShortcodesForEmoji } = await import("../shortcodes");

    await loadShortcodes();

    expect(getShortcodesForEmoji("🇺🇸")).toEqual(["us"]);
  });

  it("should strip variation selectors when deriving the hexcode", async () => {
    mockFetch({ "2705": ["white_check_mark"] });
    const { loadShortcodes, getShortcodesForEmoji } = await import("../shortcodes");

    await loadShortcodes();

    // Both with and without U+FE0F should resolve
    expect(getShortcodesForEmoji("✅️")).toEqual(["white_check_mark"]);
    expect(getShortcodesForEmoji("✅")).toEqual(["white_check_mark"]);
  });

  it("should not fetch again if called a second time", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes } = await import("../shortcodes");

    await loadShortcodes();
    await loadShortcodes();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("should use the sessionStorage cache on a second load", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes, getShortcodesForEmoji } = await import("../shortcodes");

    await loadShortcodes();

    // Reset in-memory state but keep sessionStorage
    vi.resetModules();
    const { loadShortcodes: loadShortcodes2, getShortcodesForEmoji: get2 } =
      await import("../shortcodes");

    vi.spyOn(globalThis, "fetch");
    await loadShortcodes2();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(get2("✅️")).toEqual(["check_mark_button", "white_check_mark"]);
  });

  it("should use the provided emojibaseUrl to build the fetch URL", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes } = await import("../shortcodes");

    await loadShortcodes("https://example.com/emojibase");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://example.com/emojibase/en/shortcodes/emojibase.json",
    );
  });

  it("should use emojiVersion to build the CDN URL", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes } = await import("../shortcodes");

    await loadShortcodes(undefined, 6);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/npm/emojibase-data@6/en/shortcodes/emojibase.json",
    );
  });

  it("should return [] for an emoji with no matching shortcode", async () => {
    mockFetch(SHORTCODES_DATA);
    const { loadShortcodes, getShortcodesForEmoji } = await import("../shortcodes");

    await loadShortcodes();

    expect(getShortcodesForEmoji("😀")).toEqual([]);
  });
});
