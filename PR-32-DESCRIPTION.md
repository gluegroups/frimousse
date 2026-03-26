## Summary

Adds support for image-based custom emoji categories, frequently used emojis, and unified cross-type search — all as opt-in props on `<EmojiPicker.Root>`.

## New Props

| Prop              | Type                 | Default             | Description |
| ----------------- | -------------------- | ------------------- | ----------- |
| `custom`          | `CustomCategory[]`   | —                   | Image-based emoji categories appended after standard categories. |
| `frequently`      | `EmojiPickerEmoji[]` | —                   | Emojis shown in a "Frequently Used" category at the top. Hidden during search. |
| `frequentlyLabel` | `string`             | `"Frequently Used"` | Label for the frequently used category header. |
| `unifiedSearch`   | `boolean`            | `false`             | When `true`, all search results are merged into one ranked list. |
| `searchLabel`     | `string`             | `""`                | Category header label when `unifiedSearch` is active. |

## New Types

```ts
type CustomEmoji = { id: string; label: string; url: string; tags?: string[]; };
type CustomCategory = { id: string; label: string; emojis: CustomEmoji[]; };
```

Both are exported from the package. `EmojiPickerRootProps` is augmented via intersection (not mutation) so the public type includes all new props.

## New Exports

- `CustomEmoji` — type for individual custom emoji
- `CustomCategory` — type for a custom emoji category

## Architecture

All new code lives in dedicated files:

- **`src/custom-emoji-types.ts`** — new types and `CustomEmojiRootProps` interface
- **`src/data/custom-emoji.ts`** — `buildFrequentlyUsedRows`, `buildCustomCategoryRows`, `buildUnifiedSearchRows`, `scoreEmoji` (internal)
- **`src/utils/emoji-identity.ts`** — `isSameEmoji` for comparing native and custom emojis

Upstream files (`src/types.ts`, `src/data/emoji-picker.ts`, `src/components/emoji-picker.tsx`, `src/store.ts`) are touched minimally — each change is a delegation call or an optional-param addition at a single call site.

### Search Scoring

Custom emoji search mirrors the upstream `searchEmojis` scoring (+10 label match, +1 per tag match). `scoreEmoji` is extracted as a shared helper to reduce duplication within our own code.

### Unified Search

When `unifiedSearch` is enabled, `buildUnifiedSearchRows` merges native and custom emoji results into a single score-ranked list instead of displaying them in separate categories.

### Type Widening

`EmojiPickerEmoji` is widened to `{ emoji?: string; label: string; url?: string; id?: string }` to accommodate both native and custom emojis without casts. The upstream `EmojiPickerRootProps` export is shadowed in `src/index.ts` by an augmented version that includes `CustomEmojiRootProps`.

## Bug Fixes

- `sameEmojiPickerEmoji` in `store.ts`: fixed two bugs where custom emojis (with `emoji: undefined`) would always compare as equal, suppressing `useActiveEmoji()` updates. Now guards for `undefined` first and compares custom emojis by `id`.

## Tests

New test files:
- `src/data/__tests__/custom-emoji.test.ts` — 15 tests for `scoreEmoji`, `buildFrequentlyUsedRows`, `buildCustomCategoryRows`, `buildUnifiedSearchRows`
- `src/utils/__tests__/emoji-identity.test.ts` — 4 tests for `isSameEmoji`

Extended:
- `src/data/__tests__/emoji-picker.test.ts` — 9 new tests for custom categories, frequently used, and unified search

## Docs

See `CUSTOM-EMOJIS.md` for full usage documentation including examples, prop reference, and type definitions.
