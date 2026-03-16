# Custom Emoji Support — @gluegroups/frimousse

## Overview

This fork adds a `custom` prop to `<EmojiPicker.Root>` that lets you inject image-based emoji categories into the picker. Custom categories appear after the standard Unicode emoji categories and are searchable by label and tags.

## Types

```typescript
import type { CustomEmoji, CustomCategory } from "@gluegroups/frimousse";

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

## Usage

Pass custom categories via the `custom` prop on `<EmojiPicker.Root>` and provide a custom `Emoji` component via `<EmojiPicker.List>` to render images:

```tsx
import { EmojiPicker } from "@gluegroups/frimousse";

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
                  <img src={emoji.url} alt={emoji.label} width="1em" height="1em" />
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

## `onEmojiSelect` Handling

The `emoji` object passed to `onEmojiSelect` differs for custom vs standard emojis:

| Field   | Standard Emoji | Custom Emoji |
| ------- | -------------- | ------------ |
| `emoji` | `"😀"`         | `undefined`  |
| `label` | `"Grinning"`   | `"Ship It"`  |
| `url`   | `undefined`    | `"/emojis/shipit.png"` |
| `id`    | `undefined`    | `"shipit"`   |

Check for `emoji.url` to distinguish between the two.
