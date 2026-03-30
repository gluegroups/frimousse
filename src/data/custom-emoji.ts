import type { CustomCategory } from "../custom-emoji-types";
import { getShortcodesForEmoji } from "./shortcodes";
import type {
  EmojiDataEmoji,
  EmojiPickerDataCategory,
  EmojiPickerDataRow,
  EmojiPickerEmoji,
  SkinTone,
} from "../types";
import { chunk } from "../utils/chunk";

type BuiltRows = {
  rows: EmojiPickerDataRow[];
  category: EmojiPickerDataCategory;
  count: number;
};

type BuiltCategoryRows = {
  rows: EmojiPickerDataRow[];
  categories: EmojiPickerDataCategory[];
  count: number;
};

export function buildFrequentlyUsedRows(
  frequently: EmojiPickerEmoji[],
  columns: number,
  categoryIndex: number,
  startRowIndex: number,
  frequentlyLabel: string | undefined,
): BuiltRows {
  const rows = chunk(frequently, columns).map((emojis) => ({
    categoryIndex,
    emojis,
  }));

  return {
    rows,
    category: {
      label: frequentlyLabel ?? "Frequently Used",
      rowsCount: rows.length,
      startRowIndex,
    },
    count: frequently.length,
  };
}

// Mirrors the scoring algorithm in the upstream searchEmojis() (src/data/emoji-picker.ts),
// extended with shortcode scoring. If that function's scoring logic changes, update this to match.
function scoreEmoji(label: string, tags: string[], shortcodes: string[], searchText: string): number {
  let score = 0;

  if (label.toLowerCase().includes(searchText)) {
    score += 10;
  }

  for (const tag of tags) {
    if (tag.toLowerCase().includes(searchText)) {
      score += 1;
    }
  }

  for (const shortcode of shortcodes) {
    if (shortcode.toLowerCase().replace(/[-_]/g, " ").includes(searchText)) {
      score += 10;
    }
  }

  return score;
}

function searchCustomEmojis(
  emojis: CustomCategory["emojis"],
  searchText: string,
): CustomCategory["emojis"] {
  const scores = new Map<string, number>();

  const filtered = emojis.filter((ce) => {
    const score = scoreEmoji(ce.label, ce.tags ?? [], [ce.id], searchText);

    if (score > 0) {
      scores.set(ce.id, score);
      return true;
    }

    return false;
  });

  return filtered.sort(
    (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
  );
}

export function buildCustomCategoryRows(
  custom: CustomCategory[],
  search: string,
  columns: number,
  startingCategoryIndex: number,
  startingRowIndex: number,
): BuiltCategoryRows {
  const rows: EmojiPickerDataRow[] = [];
  const categories: EmojiPickerDataCategory[] = [];
  const searchText = search.toLowerCase().trim().replace(/_/g, " ");
  let categoryIndex = startingCategoryIndex;
  let startRowIndex = startingRowIndex;
  let count = 0;

  for (const customCategory of custom) {
    const filtered = searchText
      ? searchCustomEmojis(customCategory.emojis, searchText)
      : customCategory.emojis;

    if (filtered.length === 0) {
      continue;
    }

    const customEmojis: EmojiPickerEmoji[] = filtered.map((ce) => ({
      label: ce.label,
      url: ce.url,
      id: ce.id,
    }));

    count += customEmojis.length;

    const categoryRows = chunk(customEmojis, columns).map((emojis) => ({
      categoryIndex,
      emojis,
    }));

    rows.push(...categoryRows);
    categories.push({
      label: customCategory.label,
      rowsCount: categoryRows.length,
      startRowIndex,
    });

    categoryIndex++;
    startRowIndex += categoryRows.length;
  }

  return { rows, categories, count };
}

export function buildUnifiedSearchRows(
  nativeEmojis: EmojiDataEmoji[],
  custom: CustomCategory[],
  search: string,
  columns: number,
  categoryIndex: number,
  startRowIndex: number,
  skinTone: SkinTone | undefined,
  searchLabel: string,
): BuiltRows {
  const searchText = search.toLowerCase().trim().replace(/_/g, " ");

  type ScoredEmoji = { emoji: EmojiPickerEmoji; score: number };
  const scored: ScoredEmoji[] = [];

  for (const e of nativeEmojis) {
    const score = scoreEmoji(e.label, e.tags, getShortcodesForEmoji(e.emoji), searchText);

    if (score > 0) {
      scored.push({
        emoji: {
          emoji:
            skinTone && skinTone !== "none" && e.skins
              ? e.skins[skinTone]
              : e.emoji,
          label: e.label,
        },
        score,
      });
    }
  }

  for (const customCategory of custom) {
    for (const ce of customCategory.emojis) {
      const score = scoreEmoji(ce.label, ce.tags ?? [], [ce.id], searchText);

      if (score > 0) {
        scored.push({
          emoji: { label: ce.label, url: ce.url, id: ce.id },
          score,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const emojis = scored.map((s) => s.emoji);
  const rows = chunk(emojis, columns).map((emojis) => ({
    categoryIndex,
    emojis,
  }));

  return {
    rows,
    category: {
      label: searchLabel,
      rowsCount: rows.length,
      startRowIndex,
    },
    count: emojis.length,
  };
}
