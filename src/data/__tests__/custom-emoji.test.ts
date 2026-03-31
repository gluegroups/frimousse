import { describe, expect, it, vi } from "vitest";
import type { CustomCategory } from "../../custom-emoji-types";
import type { EmojiDataEmoji } from "../../types";
import {
  buildCustomCategoryRows,
  buildFrequentlyUsedRows,
  buildUnifiedSearchRows,
} from "../custom-emoji";

vi.mock("../shortcodes", () => ({
  getShortcodesForEmoji: (emoji: string) => {
    // ✅ (U+2705, with or without variation selector U+FE0F)
    if (emoji === "✅️" || emoji === "✅") {
      return ["check_mark_button", "white_check_mark"];
    }
    return [];
  },
}));

// --- shared fixtures ---

const customCategories: CustomCategory[] = [
  {
    id: "brand",
    label: "Brand",
    emojis: [
      { id: "glue-logo", label: "Glue logo", url: "/glue.png", tags: ["glue", "brand"] },
      { id: "glue-icon", label: "Glue icon", url: "/icon.png", tags: ["glue", "icon"] },
    ],
  },
  {
    id: "reactions",
    label: "Reactions",
    emojis: [
      { id: "thumbs-up", label: "Thumbs up", url: "/thumbs-up.png", tags: ["approve", "yes"] },
      { id: "fire", label: "Fire", url: "/fire.png", tags: ["hot", "lit"] },
    ],
  },
];

// --- buildFrequentlyUsedRows ---

describe("buildFrequentlyUsedRows", () => {
  const frequently = [
    { emoji: "😀", label: "grinning face" },
    { id: "glue-logo", label: "Glue logo", url: "/glue.png" },
  ];

  it("should build rows chunked by columns", () => {
    const result = buildFrequentlyUsedRows(frequently, 1, 0, 0, undefined);

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.emojis).toHaveLength(1);
    expect(result.count).toBe(2);
  });

  it("should use the provided label", () => {
    const result = buildFrequentlyUsedRows(frequently, 10, 0, 0, "Recently Used");

    expect(result.category.label).toBe("Recently Used");
  });

  it("should default the label to 'Frequently Used'", () => {
    const result = buildFrequentlyUsedRows(frequently, 10, 0, 0, undefined);

    expect(result.category.label).toBe("Frequently Used");
  });

  it("should set correct startRowIndex and rowsCount on the category", () => {
    const result = buildFrequentlyUsedRows(frequently, 1, 2, 5, undefined);

    expect(result.category.startRowIndex).toBe(5);
    expect(result.category.rowsCount).toBe(2);
  });
});

// --- buildCustomCategoryRows ---

describe("buildCustomCategoryRows", () => {
  it("should include all emojis when search is empty", () => {
    const result = buildCustomCategoryRows(customCategories, "", 10, 0, 0);

    expect(result.count).toBe(4);
    expect(result.categories).toHaveLength(2);
    expect(result.categories[0]?.label).toBe("Brand");
    expect(result.categories[1]?.label).toBe("Reactions");
  });

  it("should filter emojis by label during search", () => {
    const result = buildCustomCategoryRows(customCategories, "fire", 10, 0, 0);

    expect(result.count).toBe(1);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]?.label).toBe("Reactions");
    expect(result.rows[0]?.emojis[0]?.id).toBe("fire");
  });

  it("should filter emojis by tags during search", () => {
    const result = buildCustomCategoryRows(customCategories, "glue", 10, 0, 0);

    expect(result.count).toBe(2);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]?.label).toBe("Brand");
  });

  it("should skip categories with no matching emojis", () => {
    const result = buildCustomCategoryRows(customCategories, "fire", 10, 0, 0);

    expect(result.categories.every((c) => c.label !== "Brand")).toBe(true);
  });

  it("should rank results by score within each category", () => {
    const categories: CustomCategory[] = [
      {
        id: "test",
        label: "Test",
        emojis: [
          { id: "a", label: "glue thing", url: "/a.png", tags: [] },
          { id: "b", label: "thing", url: "/b.png", tags: ["glue"] },
        ],
      },
    ];
    const result = buildCustomCategoryRows(categories, "glue", 10, 0, 0);
    const emojis = result.rows.flatMap((r) => r.emojis);

    expect(emojis[0]?.id).toBe("a"); // label match scores higher
    expect(emojis[1]?.id).toBe("b");
  });

  it("should return empty results when nothing matches", () => {
    const result = buildCustomCategoryRows(customCategories, "zzznomatch", 10, 0, 0);

    expect(result.count).toBe(0);
    expect(result.categories).toHaveLength(0);
    expect(result.rows).toHaveLength(0);
  });

  it("should normalize underscores to spaces in the search query", () => {
    // "thumbs_up" should match "Thumbs up" label
    const result = buildCustomCategoryRows(customCategories, "thumbs_up", 10, 0, 0);

    expect(result.count).toBe(1);
    expect(result.rows[0]?.emojis[0]?.id).toBe("thumbs-up");
  });

  it("should match emojis by id (shortcode) when the label does not match", () => {
    const categories: CustomCategory[] = [
      {
        id: "custom",
        label: "Custom",
        emojis: [
          { id: "white-check-mark", label: "Done", url: "/done.png", tags: [] },
        ],
      },
    ];
    // label "Done" won't match "white check mark", but id "white-check-mark" will
    const result = buildCustomCategoryRows(categories, "white_check_mark", 10, 0, 0);

    expect(result.count).toBe(1);
    expect(result.rows[0]?.emojis[0]?.id).toBe("white-check-mark");
  });

  it("should set correct startRowIndex offsets across categories", () => {
    const result = buildCustomCategoryRows(customCategories, "", 10, 0, 0);

    expect(result.categories[0]?.startRowIndex).toBe(0);
    expect(result.categories[1]?.startRowIndex).toBe(1); // Brand has 1 row of 10
  });
});

// --- buildUnifiedSearchRows ---

const nativeEmojis: EmojiDataEmoji[] = [
  {
    emoji: "🙂",
    category: 0,
    version: 1,
    label: "Slightly smiling face",
    tags: ["face", "smile"],
    countryFlag: undefined,
    skins: undefined,
  },
  {
    emoji: "👋",
    category: 1,
    version: 0.6,
    label: "Waving hand",
    tags: ["hello", "hi", "wave"],
    countryFlag: undefined,
    skins: {
      light: "👋🏻",
      "medium-light": "👋🏼",
      medium: "👋🏽",
      "medium-dark": "👋🏾",
      dark: "👋🏿",
    },
  },
  {
    emoji: "✅️",
    category: 8,
    version: 0.6,
    label: "Check mark button",
    tags: ["check", "mark"],
    countryFlag: undefined,
    skins: undefined,
  },
];

describe("buildUnifiedSearchRows", () => {
  it("should merge native and custom emojis into a single category", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis, customCategories, "glue", 10, 0, 0, undefined, "Results"
    );

    expect(result.category.label).toBe("Results");
    expect(result.count).toBe(2); // "Glue logo" and "Glue icon"
    expect(result.rows[0]?.emojis.every((e) => e.id !== undefined)).toBe(true);
  });

  it("should return native and custom results together when both match", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis, customCategories, "face", 10, 0, 0, undefined, ""
    );
    const emojis = result.rows.flatMap((r) => r.emojis);

    // "Slightly smiling face" matches natively; no custom match for "face"
    expect(result.count).toBe(1);
    expect(emojis[0]?.emoji).toBe("🙂");
  });

  it("should rank by score across both native and custom emojis", () => {
    // "smile" matches native tag (+1) and no custom emoji
    // Add a custom emoji with "smile" in label for a higher score
    const custom: CustomCategory[] = [
      {
        id: "test",
        label: "Test",
        emojis: [{ id: "smile-custom", label: "smile", url: "/s.png", tags: [] }],
      },
    ];
    const result = buildUnifiedSearchRows(
      nativeEmojis, custom, "smile", 10, 0, 0, undefined, ""
    );
    const emojis = result.rows.flatMap((r) => r.emojis);

    // custom label match = 10, native tag match = 1 — custom should be first
    expect(emojis[0]?.id).toBe("smile-custom");
  });

  it("should apply skin tone to native emojis", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis, customCategories, "wave", 10, 0, 0, "dark", ""
    );
    const emojis = result.rows.flatMap((r) => r.emojis);

    expect(emojis[0]?.emoji).toBe("👋🏿");
  });

  it("should return empty results when nothing matches", () => {
    const result = buildUnifiedSearchRows(
      nativeEmojis, customCategories, "zzznomatch", 10, 0, 0, undefined, ""
    );

    expect(result.count).toBe(0);
    expect(result.rows).toHaveLength(0);
  });

  it("should normalize underscores to spaces in the search query", () => {
    // "waving_hand" should match native emoji with label "Waving hand"
    const result = buildUnifiedSearchRows(
      nativeEmojis, customCategories, "waving_hand", 10, 0, 0, undefined, ""
    );
    const emojis = result.rows.flatMap((r) => r.emojis);

    expect(result.count).toBe(1);
    expect(emojis[0]?.emoji).toBe("👋");
  });

  it("should match native emojis by shortcode when the label does not match", () => {
    // "white_check_mark" → "white check mark": label "Check mark button" doesn't contain it,
    // but the mocked shortcodes for ✅️ include "white_check_mark"
    const result = buildUnifiedSearchRows(
      nativeEmojis, [], "white_check_mark", 10, 0, 0, undefined, ""
    );
    const emojis = result.rows.flatMap((r) => r.emojis);

    expect(result.count).toBe(1);
    expect(emojis[0]?.emoji).toBe("✅️");
  });

  it("should match custom emojis by id (shortcode) when the label does not match", () => {
    const custom: CustomCategory[] = [
      {
        id: "custom",
        label: "Custom",
        emojis: [
          { id: "white-check-mark", label: "Done", url: "/done.png", tags: [] },
        ],
      },
    ];
    // label "Done" won't match "white check mark", but id "white-check-mark" will
    const result = buildUnifiedSearchRows(
      [], custom, "white_check_mark", 10, 0, 0, undefined, ""
    );
    const emojis = result.rows.flatMap((r) => r.emojis);

    expect(result.count).toBe(1);
    expect(emojis[0]?.id).toBe("white-check-mark");
  });
});
