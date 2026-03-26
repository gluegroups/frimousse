import { describe, expect, it } from "vitest";
import type { EmojiData } from "../../types";
import { getEmojiPickerData, searchEmojis } from "../emoji-picker";

const data: EmojiData = {
  locale: "en",
  emojis: [
    {
      emoji: "🙂",
      category: 0,
      version: 1,
      label: "Slightly smiling face",
      tags: ["face", "happy", "slightly", "smile", "smiling"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "👋",
      category: 1,
      version: 0.6,
      label: "Waving hand",
      tags: [
        "bye",
        "cya",
        "g2g",
        "greetings",
        "gtg",
        "hand",
        "hello",
        "hey",
        "hi",
        "later",
        "outtie",
        "ttfn",
        "ttyl",
        "wave",
        "yo",
        "you",
      ],
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
      emoji: "🧑‍🤝‍🧑",
      category: 1,
      version: 12,
      label: "People holding hands",
      tags: [
        "bae",
        "bestie",
        "bff",
        "couple",
        "dating",
        "flirt",
        "friends",
        "hand",
        "hold",
        "people",
        "twins",
      ],
      countryFlag: undefined,
      skins: {
        light: "🧑🏻‍🤝‍🧑🏻",
        "medium-light": "🧑🏼‍🤝‍🧑🏼",
        medium: "🧑🏽‍🤝‍🧑🏽",
        "medium-dark": "🧑🏾‍🤝‍🧑🏾",
        dark: "🧑🏿‍🤝‍🧑🏿",
      },
    },
    {
      emoji: "🐈‍⬛",
      category: 3,
      version: 13,
      label: "Black cat",
      tags: [
        "animal",
        "black",
        "cat",
        "feline",
        "halloween",
        "meow",
        "unlucky",
      ],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🥦",
      category: 4,
      version: 5,
      label: "Broccoli",
      tags: ["cabbage", "wild"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🚧",
      category: 5,
      version: 0.6,
      label: "Construction",
      tags: ["barrier"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🌚",
      category: 5,
      version: 1,
      label: "New moon face",
      tags: ["face", "moon", "new", "space"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🎉",
      category: 6,
      version: 0.6,
      label: "Party popper",
      tags: [
        "awesome",
        "birthday",
        "celebrate",
        "celebration",
        "excited",
        "hooray",
        "party",
        "popper",
        "tada",
        "woohoo",
      ],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🔗",
      category: 7,
      version: 0.6,
      label: "Link",
      tags: ["links"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🎦",
      category: 8,
      version: 0.6,
      label: "Cinema",
      tags: ["camera", "film", "movie"],
      countryFlag: undefined,
      skins: undefined,
    },
    {
      emoji: "🇪🇺",
      category: 9,
      version: 2,
      label: "Flag: European Union",
      tags: ["EU", "flag"],
      countryFlag: true,
      skins: undefined,
    },
  ],
  categories: [
    {
      index: 0,
      label: "Smileys & emotion",
    },
    {
      index: 1,
      label: "People & body",
    },
    {
      index: 3,
      label: "Animals & nature",
    },
    {
      index: 4,
      label: "Food & drink",
    },
    {
      index: 5,
      label: "Travel & places",
    },
    {
      index: 6,
      label: "Activities",
    },
    {
      index: 7,
      label: "Objects",
    },
    {
      index: 8,
      label: "Symbols",
    },
    {
      index: 9,
      label: "Flags",
    },
  ],
  skinTones: {
    dark: "Dark skin tone",
    light: "Light skin tone",
    medium: "Medium skin tone",
    "medium-dark": "Medium-dark skin tone",
    "medium-light": "Medium-light skin tone",
  },
};

describe("searchEmojis", () => {
  it("should return all emojis when search is missing or empty", () => {
    expect(searchEmojis(data.emojis)).toEqual(data.emojis);
    expect(searchEmojis(data.emojis, "")).toEqual(data.emojis);
  });

  it("should filter emojis by label", () => {
    const results = searchEmojis(data.emojis, "broccoli");

    expect(results).toHaveLength(1);
    expect(results[0]?.emoji).toBe("🥦");
    expect(searchEmojis(data.emojis, "   BrOcCoLi ")).toEqual(results);
  });

  it("should filter emojis by tags", () => {
    const results = searchEmojis(data.emojis, "film");

    expect(results).toHaveLength(1);
    expect(results[0]?.emoji).toBe("🎦");
    expect(searchEmojis(data.emojis, " FiLm   ")).toEqual(results);
  });

  it("should return an empty array if no match is found", () => {
    const results = searchEmojis(data.emojis, "unknown");

    expect(results).toHaveLength(0);
  });
});

describe("getEmojiPickerData", () => {
  it("should organize emojis into categories and rows", () => {
    const result = getEmojiPickerData(data, 10, undefined, "");

    expect(result.count).toBe(data.emojis.length);
    expect(result.categories.length).toBe(9);
    expect(result.rows.length).toBeGreaterThan(0);

    for (const category of result.categories) {
      expect(category).toHaveProperty("label");
      expect(category).toHaveProperty("rowsCount");
      expect(category).toHaveProperty("startRowIndex");
    }

    for (const row of result.rows) {
      expect(row).toHaveProperty("categoryIndex");
      expect(row).toHaveProperty("emojis");
      expect(Array.isArray(row.emojis)).toBe(true);
      expect(row.emojis.length).toBeLessThanOrEqual(10);
    }
  });

  it("should filter emojis based on search", () => {
    const result = getEmojiPickerData(data, 10, undefined, "broccoli");

    expect(result.count).toBe(1);
    expect(result.categories.length).toBe(1);
    expect(result.categories[0]?.label).toBe("Food & drink");
    expect(result.rows.length).toBe(1);
    expect(result.rows[0]?.emojis[0]?.emoji).toBe("🥦");
  });

  it("should apply skin tones when possible", () => {
    const result = getEmojiPickerData(data, 10, "dark", "");
    const emojis = result.rows.flatMap((row) => row.emojis);

    const emoji1 = emojis.find((emoji) => emoji.label === "Waving hand");
    expect(emoji1?.emoji).toBe("👋🏿");

    const emoji2 = emojis.find(
      (emoji) => emoji.label === "People holding hands",
    );
    expect(emoji2?.emoji).toBe("🧑🏿‍🤝‍🧑🏿");

    const emoji3 = emojis.find((emoji) => emoji.label === "Link");
    expect(emoji3?.emoji).toBe("🔗");
  });

  it("should support empty search results", () => {
    const result = getEmojiPickerData(data, 10, undefined, "..........");

    expect(result.count).toBe(0);
    expect(result.categories).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.categoriesStartRowIndices).toEqual([]);
  });

  it("should append custom categories after native categories", () => {
    const custom = [
      {
        id: "brand",
        label: "Brand",
        emojis: [
          { id: "glue-logo", label: "Glue logo", url: "/glue.png" },
        ],
      },
    ];
    const result = getEmojiPickerData(data, 10, undefined, "", custom);
    const labels = result.categories.map((c) => c.label);

    expect(result.count).toBe(data.emojis.length + 1);
    expect(labels.at(-1)).toBe("Brand");
  });

  it("should filter custom categories during search", () => {
    const custom = [
      {
        id: "brand",
        label: "Brand",
        emojis: [
          { id: "glue-logo", label: "Glue logo", url: "/glue.png", tags: ["glue"] },
        ],
      },
    ];
    const result = getEmojiPickerData(data, 10, undefined, "glue", custom);

    expect(result.count).toBe(1);
    expect(result.categories[0]?.label).toBe("Brand");
  });

  it("should prepend frequently used emojis when search is empty", () => {
    const frequently = [
      { emoji: "😀", label: "grinning face" },
      { id: "glue-logo", label: "Glue logo", url: "/glue.png" },
    ];
    const result = getEmojiPickerData(data, 10, undefined, "", undefined, frequently);

    expect(result.categories[0]?.label).toBe("Frequently Used");
    expect(result.count).toBe(data.emojis.length + 2);
  });

  it("should use a custom frequentlyLabel when provided", () => {
    const frequently = [{ emoji: "😀", label: "grinning face" }];
    const result = getEmojiPickerData(data, 10, undefined, "", undefined, frequently, "Recent");

    expect(result.categories[0]?.label).toBe("Recent");
  });

  it("should hide frequently used emojis during search", () => {
    const frequently = [{ emoji: "😀", label: "grinning face" }];
    const result = getEmojiPickerData(data, 10, undefined, "broccoli", undefined, frequently);

    expect(result.categories.every((c) => c.label !== "Frequently Used")).toBe(true);
  });

  it("should return a single unified category when unifiedSearch is true", () => {
    const custom = [
      {
        id: "brand",
        label: "Brand",
        emojis: [
          { id: "glue-logo", label: "Glue logo", url: "/glue.png", tags: ["glue"] },
        ],
      },
    ];
    const result = getEmojiPickerData(data, 10, undefined, "broccoli", custom, undefined, undefined, true, "Results");

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]?.label).toBe("Results");
  });

  it("should use an empty string for the unified category label when searchLabel is omitted", () => {
    const custom = [
      {
        id: "brand",
        label: "Brand",
        emojis: [{ id: "glue-logo", label: "Glue logo", url: "/glue.png" }],
      },
    ];
    const result = getEmojiPickerData(data, 10, undefined, "broccoli", custom, undefined, undefined, true);

    expect(result.categories[0]?.label).toBe("");
  });

  it("should not activate unified search when unifiedSearch is false", () => {
    const custom = [
      {
        id: "brand",
        label: "Brand",
        emojis: [{ id: "glue-logo", label: "Glue logo", url: "/glue.png" }],
      },
    ];
    const result = getEmojiPickerData(data, 10, undefined, "broccoli", custom, undefined, undefined, false);

    // Falls through to default path — results are in their original category
    expect(result.categories[0]?.label).toBe("Food & drink");
  });
});
