import type { CustomCategory } from "../custom-emoji-types";
import type {
  EmojiPickerDataCategory,
  EmojiPickerDataRow,
  EmojiPickerEmoji,
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

function searchCustomEmojis(
  emojis: CustomCategory["emojis"],
  searchText: string,
): CustomCategory["emojis"] {
  const scores = new Map<string, number>();

  const filtered = emojis.filter((ce) => {
    let score = 0;

    if (ce.label.toLowerCase().includes(searchText)) {
      score += 10;
    }

    if (ce.tags) {
      for (const tag of ce.tags) {
        if (tag.toLowerCase().includes(searchText)) {
          score += 1;
        }
      }
    }

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
  const searchText = search.toLowerCase().trim();
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
