import type { EmojiPickerEmoji, EmojiPickerRootProps } from "./types";

export type CustomEmoji = {
  id: string;
  label: string;
  url: string;
  tags?: string[];
};

export type CustomCategory = {
  id: string;
  label: string;
  emojis: CustomEmoji[];
};

/**
 * Additional root props for custom emoji support.
 * Intersected with the upstream EmojiPickerRootProps at the component level.
 */
export interface CustomEmojiRootProps {
  /**
   * Custom emoji categories to append to the picker.
   */
  custom?: CustomCategory[];

  /**
   * Frequently used emojis to display at the top of the picker.
   * Supports both native emojis (with `emoji` field) and custom emojis (with `url` and `id` fields).
   */
  frequently?: EmojiPickerEmoji[];

  /**
   * The label for the frequently used category header.
   *
   * @default "Frequently Used"
   */
  frequentlyLabel?: string;
}

/**
 * Full root props type, including custom emoji extensions.
 * Re-exported from index.ts as EmojiPickerRootProps to shadow the upstream type.
 */
export type AugmentedEmojiPickerRootProps = EmojiPickerRootProps & CustomEmojiRootProps;
