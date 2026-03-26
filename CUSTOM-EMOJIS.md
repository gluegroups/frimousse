# Custom Emoji Support

## Overview

The `custom` prop on `<EmojiPicker.Root>` lets you inject image-based emoji categories into the picker. Custom categories appear after the standard Unicode emoji categories and are searchable by label and tags. The `frequently` prop adds a "Frequently Used" category at the top of the picker, supporting both native and custom emojis.

## Usage

Pass custom categories via the `custom` prop on `<EmojiPicker.Root>` and provide a custom `Emoji` component via `<EmojiPicker.List>` to render images:

```tsx
const customCategories = [
  {
    id: "team",
    label: "Team",
    emojis: [
      { id: "shipit", label: "Ship It", url: "/emojis/shipit.png", tags: ["ship", "deploy"] },
      { id: "lgtm", label: "Looks Good To Me", url: "/emojis/lgtm.png", tags: ["approve"] },
    ],
  },
];

function MyEmojiPicker() {
  return (
    <EmojiPicker.Root
      custom={customCategories}
      onEmojiSelect={(emoji) => {
        if (emoji.url) {
          // Handle custom image emoji
          console.log("Custom emoji:", emoji.id, emoji.url);
        } else {
          // Handle standard Unicode emoji
          console.log("Emoji:", emoji.emoji);
        }
      }}
    >
      <EmojiPicker.Search />
      <EmojiPicker.Viewport>
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
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
```

## Search

Custom emojis are searchable using the same scoring as standard emojis:

- **Label match**: +10 points
- **Tag match**: +1 point per tag

Results are sorted by score descending and filtered when using `<EmojiPicker.Search>`.

### Unified Search

By default, search results are displayed within their original categories (standard Unicode categories and custom categories separately). Enable `unifiedSearch` to merge all results — native and custom — into a single ranked list sorted by relevance score:

```tsx
<EmojiPicker.Root
  custom={customCategories}
  unifiedSearch
  searchLabel="Results"
  onEmojiSelect={handleSelect}
>
  {/* ... */}
</EmojiPicker.Root>
```

- **`unifiedSearch`** (`boolean`, default `false`): When `true`, all search results are combined into one category ranked by score. Has no effect when there is no active search query.
- **`searchLabel`** (`string`, optional): Label for the unified results category header. Defaults to `""` if omitted.

## `onEmojiSelect` Handling

The `emoji` object passed to `onEmojiSelect` differs for custom vs standard emojis:

| Field   | Standard Emoji | Custom Emoji |
| ------- | -------------- | ------------ |
| `emoji` | `"😀"`         | `undefined`  |
| `label` | `"Grinning"`   | `"Ship It"`  |
| `url`   | `undefined`    | `"/emojis/shipit.png"` |
| `id`    | `undefined`    | `"shipit"`   |

Check for `emoji.url` to distinguish between the two.

## Frequently Used Emojis

Pass an array of `EmojiPickerEmoji` objects via the `frequently` prop to display a "Frequently Used" category at the top of the picker. Supports both native and custom emojis. The category is hidden during search.

```tsx
<EmojiPicker.Root
  frequently={[
    { emoji: "👍", label: "Thumbs Up" },
    { emoji: "❤️", label: "Red Heart" },
    { id: "shipit", label: "Ship It", url: "/emojis/shipit.png" },
  ]}
  frequentlyLabel="Favorites"
  onEmojiSelect={handleSelect}
>
  {/* ... */}
</EmojiPicker.Root>
```

The consumer is responsible for tracking and persisting frequency data — frimousse does not manage localStorage or usage counts internally.

## Prop Reference

All custom emoji props are added to `<EmojiPicker.Root>`:

| Prop              | Type                  | Default             | Description |
| ----------------- | --------------------- | ------------------- | ----------- |
| `custom`          | `CustomCategory[]`    | —                   | Custom image-based emoji categories, appended after standard categories. |
| `frequently`      | `EmojiPickerEmoji[]`  | —                   | Emojis to show in a "Frequently Used" category at the top. Hidden during search. |
| `frequentlyLabel` | `string`              | `"Frequently Used"` | Label for the frequently used category header. |
| `unifiedSearch`   | `boolean`             | `false`             | When `true`, merges all search results into one ranked list. |
| `searchLabel`     | `string`              | `""`                | Category header label when `unifiedSearch` is active. |

## Types

```ts
type CustomEmoji = {
  id: string;
  label: string;
  url: string;
  tags?: string[];
};

type CustomCategory = {
  id: string;
  label: string;
  emojis: CustomEmoji[];
};
```

Both are exported from `@gluegroups/frimousse`.
