import type { FieldRefusal } from "./refusal";
import type { DocumentRule } from "./tenant-scoped";

const ABSOLUTE_WITH_AUTHORITY = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//;
const WEB_PROTOCOLS = new Set(["http:", "https:"]);

function hasControlOrSpace(text: string): boolean {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    if (code <= 0x20 || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

export function isSafeExternalHref(href: string): boolean {
  if (!ABSOLUTE_WITH_AUTHORITY.test(href) || hasControlOrSpace(href)) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }
  return WEB_PROTOCOLS.has(url.protocol) && url.hostname !== "";
}

export const navigationItemsRule: DocumentRule = ({ merged }) => {
  const refusals: FieldRefusal[] = [];
  const items = Array.isArray(merged.items) ? merged.items : [];
  items.forEach((item: unknown, index: number) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const hasPage = row.page !== null && row.page !== undefined;
    const hasHref = typeof row.href === "string";
    const path = `items.${index}`;
    if (hasPage === hasHref) {
      refusals.push({
        path,
        message:
          "Each link points at one page of this Site or one web address.",
      });
      return;
    }
    if (hasHref && !isSafeExternalHref(row.href as string)) {
      refusals.push({
        path: `${path}.href`,
        message: "Enter a full web address starting with https:// or http://.",
      });
    }
  });
  return refusals;
};
