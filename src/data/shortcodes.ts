type ShortcodesRecord = Record<string, string | string[]>;

const SESSION_KEY = "frimousse/shortcodes";

let shortcodesMap: Map<string, string[]> | undefined;

function hexcodeFromEmoji(emoji: string): string {
  return [...emoji]
    .map((c) => c.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0e && cp !== 0xfe0f)
    .map((cp) => cp.toString(16).toUpperCase())
    .join("-");
}

function buildMap(data: ShortcodesRecord): Map<string, string[]> {
  return new Map(
    Object.entries(data).map(([hexcode, codes]) => [
      hexcode,
      Array.isArray(codes) ? codes : [codes],
    ]),
  );
}

export function getShortcodesForEmoji(emoji: string): string[] {
  return shortcodesMap?.get(hexcodeFromEmoji(emoji)) ?? [];
}

export async function loadShortcodes(
  emojibaseUrl?: string,
  emojiVersion?: number,
): Promise<void> {
  if (shortcodesMap) {
    return;
  }

  try {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      shortcodesMap = buildMap(JSON.parse(cached) as ShortcodesRecord);
      return;
    }
  } catch {
    // ignore
  }

  const baseUrl =
    typeof emojibaseUrl === "string"
      ? emojibaseUrl
      : `https://cdn.jsdelivr.net/npm/emojibase-data@${typeof emojiVersion === "number" ? Math.floor(emojiVersion) : "latest"}`;

  const response = await fetch(`${baseUrl}/en/shortcodes/emojibase.json`);
  const data = (await response.json()) as ShortcodesRecord;

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors (e.g. quota exceeded)
  }

  shortcodesMap = buildMap(data);
}
