# Frimousse Fork — @gluegroups/frimousse

## Goal

Add **custom emoji support** to frimousse so glue-web can inject custom emoji categories (image-based) into the picker. Changes should be minimal and additive to keep rebasing on upstream easy.

## Modifications (3 files)

### 1. `src/types.ts` — Add custom emoji types

```typescript
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
```

- Add `custom?: CustomCategory[]`, `frequently?: EmojiPickerEmoji[]`, and `frequentlyLabel?: string` to `EmojiPickerRootProps`
- Extend `EmojiPickerEmoji` with optional `url` and `id` fields for custom emojis (`emoji` is optional)

### 2. `src/data/emoji-picker.ts` — Merge custom categories into data pipeline

- Add `custom`, `frequently`, and `frequentlyLabel` parameters to `getEmojiPickerData()`
- When `frequently` is provided and search is empty, prepend a "Frequently Used" category (label configurable via `frequentlyLabel`)
- When `search` is non-empty, filter custom emojis by `label` and `tags` using the same scoring approach as `searchEmojis()`
- After building standard category rows, append custom category rows using the same `chunk()` utility
- Ensure custom categories appear in `categories[]` and `rows[]` with correct `startRowIndex` offsets

### 3. `src/components/emoji-picker.tsx` — Wire the props through

- `EmojiPickerRoot`: Destructure `custom`, `frequently`, `frequentlyLabel` from props, forward to `EmojiPickerDataHandler`
- `EmojiPickerDataHandler`: Pass all three to `getEmojiPickerData()`
- `EmojiPickerListEmoji`: Compare active emoji by `id` for custom emojis, fall back to `emoji` string for native emojis

### Note: Image rendering is handled by the consumer

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
