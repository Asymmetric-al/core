export const BLANK_ALIASES = [
  [0x200b],
  [0x2060],
  [0xfeff],
  [0x00ad],
  [0x034f],
  [0x061c],
  [0x115f],
  [0x180e],
  [0x200e],
  [0x202e],
  [0x2800],
  [0x3164],
  [0xfe0f],
  [0xffa0],
  [0x1d173],
  [0xe0041],
  [0x00a0],
  [0x3000],
  [0x2028],
  [0x0009],
  [0x0020, 0x0009, 0x200b, 0x00a0, 0xfeff, 0x2060, 0xe0041, 0x0020],
].map((points) => String.fromCodePoint(...points));

export const REAL_ALIAS = `${String.fromCodePoint(0x200b)}Oak${String.fromCodePoint(0x00a0)}Two${String.fromCodePoint(0x2060, 0x0009)}`;

export function codePoints(text: string) {
  return [...text]
    .map(
      (c) =>
        `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`,
    )
    .join(" ");
}
