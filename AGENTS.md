# Frimousse Fork — @gluegroups/frimousse

## Goal

Add **custom emoji support** to frimousse so glue-web can inject custom emoji categories (image-based) into the picker. Changes should be minimal and additive to keep rebasing on upstream easy.

## Our Files

New files added by this fork. Zero merge conflict surface area — upstream rebase never touches these.

| File | Purpose |
|---|---|
| `src/custom-emoji-types.ts` | `CustomEmoji`, `CustomCategory`, `CustomEmojiRootProps`, `AugmentedEmojiPickerRootProps` |
| `src/data/custom-emoji.ts` | `buildFrequentlyUsedRows()`, `buildCustomCategoryRows()`, `buildUnifiedSearchRows()`, `scoreEmoji()`, `searchCustomEmojis()` |
| `src/utils/emoji-identity.ts` | `isSameEmoji()` — discriminated identity check for native vs. custom emojis |

## Upstream Touch Points

Minimal changes to upstream files. Each is a small, targeted insertion.

### `src/types.ts`

- `EmojiPickerEmoji`: widened with `emoji?`, `url?`, `id?` to accommodate custom emojis flowing through the upstream data pipeline (required because `$activeEmoji` in `store.ts` returns this type and cannot be modified)
- Re-exports `CustomEmoji` and `CustomCategory` from `custom-emoji-types.ts`

### `src/data/emoji-picker.ts`

- `getEmojiPickerData()`: four new optional params (`custom`, `frequently`, `frequentlyLabel`, `searchLabel`)
- When `search` is non-empty and both `custom` and `searchLabel` are provided, delegates immediately to `buildUnifiedSearchRows()` and early-returns a single flat category (unified ranking across native and custom emojis)
- Otherwise: two delegation call sites — one for frequently used rows (before the native emoji loop), one for custom category rows (after it). All logic lives in `custom-emoji.ts`.

### `src/components/emoji-picker.tsx`

- `EmojiPickerRoot` and `EmojiPickerDataHandler`: prop type changed to `EmojiPickerRootProps & CustomEmojiRootProps`; props forwarded to `getEmojiPickerData()`
- `EmojiPickerListEmoji`: `isActive` selector replaced with `isSameEmoji()` call

### `src/index.ts`

- `CustomEmoji`, `CustomCategory` added to exports
- `EmojiPickerRootProps` re-exported as `AugmentedEmojiPickerRootProps` (the merged type), shadowing the upstream export so consumers see the full prop surface

## Removing This Feature

To strip the custom emoji feature entirely:

1. **Delete** `src/custom-emoji-types.ts`, `src/data/custom-emoji.ts`, `src/utils/emoji-identity.ts`

2. **Revert `src/types.ts`:**
   - Remove the re-exports of `CustomEmoji` and `CustomCategory`
   - Restore `EmojiPickerEmoji` to `{ emoji: string; label: string }`

3. **Revert `src/data/emoji-picker.ts`:**
   - Remove the `custom`, `frequently`, `frequentlyLabel`, `searchLabel` params from `getEmojiPickerData()`
   - Remove the unified search early-return branch and the two delegation call sites, and their imports

4. **Revert `src/components/emoji-picker.tsx`:**
   - Remove `CustomEmojiRootProps` import and type intersections; restore `EmojiPickerRootProps` alone
   - Remove `isSameEmoji` import; restore `isActive` to `$activeEmoji(state)?.emoji === emoji.emoji`
   - Remove destructuring and forwarding of `custom`, `frequently`, `frequentlyLabel`, `searchLabel`

5. **Revert `src/index.ts`:**
   - Remove `CustomEmoji`, `CustomCategory` exports
   - Restore `EmojiPickerRootProps` to export directly from `./types`

## Note: Image Rendering

The `DefaultEmojiPickerListEmoji` is **not** modified. Consumers render custom emoji images via the existing `components` prop on `<EmojiPicker.List>`:

```tsx
<EmojiPicker.List
  components={{
    Emoji: ({ emoji, ...props }) => (
      <button {...props}>
        {emoji.url ? (
          <img src={emoji.url} alt={emoji.label} style={{ width: "1em", height: "1em" }} />
        ) : (
          emoji.emoji
        )}
      </button>
    ),
  }}
/>
```

## Publishing — Internal Fork

- Publish as `@gluegroups/frimousse` to GitHub Packages
- Consumed in glue-web via existing `.yarnrc.yml` `@gluegroups` scope config
- `main` branch uses fork-specific `package.json` values:
  - `"name": "@gluegroups/frimousse"`
  - `"version"`: our own version (e.g. `"0.3.4"`)
  - `"repository.url"`: `"git+https://github.com/gluegroups/frimousse.git"`

## Publishing — Upstream PR

When pushing branches that target `liveblocks/frimousse`, **revert `package.json` to upstream values**:
- `"name": "frimousse"`
- `"version"`: match upstream (e.g. `"0.3.0"`)
- `"repository.url"`: `"git+https://github.com/liveblocks/frimousse.git"`

Do **not** include `AGENTS.md` or any `@gluegroups`-specific references in upstream PRs.

## Principles for Making Changes

This is a fork. Every change we make is a future merge conflict. Follow these principles to keep upstream rebases clean and painless:

1. **Isolate into new files.** Prefer adding new files (e.g. `src/data/custom-emojis.ts`) over editing existing ones. New files have zero merge conflict surface area.

2. **Extract before inserting.** When logic must touch an existing file, extract it into a self-contained function first, then call that function from the existing code at a single, minimal call site. The insertion point should be as small as possible — ideally one line.

3. **Make it trivially removable.** Any change should be removable by deleting our new files and reverting a small number of call sites. If removing a feature requires untangling logic scattered across an existing file, the change was not isolated enough.

4. **No refactoring of upstream code.** Do not rename, reorganize, or restructure upstream code, even if it would be cleaner. Each such change is a rebase hazard.

5. **Avoid touching upstream types where possible.** Prefer extending types via intersection or wrapping rather than modifying upstream type definitions in place.

## Upstream Sync

Keep changes isolated and additive so rebasing on `upstream/main` stays clean:
```sh
git fetch upstream
git rebase upstream/main
# Re-apply @gluegroups name/version/repo in package.json
# Run tests, then publish
```
