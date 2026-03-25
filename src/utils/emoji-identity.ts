import type { EmojiPickerEmoji } from "../types";

/**
 * Compares two emoji picker emojis for identity.
 * For custom emojis (with `id`), compares by id.
 * For native emojis, compares by emoji string.
 */
export function isSameEmoji(
  a: EmojiPickerEmoji | undefined,
  b: EmojiPickerEmoji | undefined,
): boolean {
  if (!a || !b) return false;
  if (a.id !== undefined && b.id !== undefined) return a.id === b.id;
  return a.emoji === b.emoji;
}
