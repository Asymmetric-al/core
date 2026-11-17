import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Structural checks on the Auth sections of `supabase/config.toml`, which the
 * local stack and CI read. Read section by section, so a key is judged only
 * in the table it belongs to.
 */
function readConfigSections(): Map<string, Map<string, string>> {
  const source = readFileSync(
    resolve(process.cwd(), "supabase/config.toml"),
    "utf8",
  );
  const sections = new Map<string, Map<string, string>>([["", new Map()]]);
  let current = sections.get("")!;
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      current = new Map();
      sections.set(header[1]!, current);
      continue;
    }
    const entry = line.match(/^([a-z_]+)\s*=\s*(.+)$/);
    if (entry) current.set(entry[1]!, entry[2]!.trim());
  }
  return sections;
}

function setting(section: string, key: string) {
  return readConfigSections().get(section)?.get(key);
}

describe("local Auth configuration", () => {
  it("lets recovery and confirmation emails return to the local app that asked", () => {
    // Auth admits any port on site_url's host; the localhost glob admits the
    // same apps under that name, which is how Playwright opens them.
    expect(setting("auth", "site_url")).toBe('"http://127.0.0.1:3000"');
    const allowlist = setting("auth", "additional_redirect_urls");
    expect(allowlist).toContain('"http://localhost:*/**"');
    // Never a wildcard host: only loopback names are admitted locally.
    expect(allowlist).not.toMatch(/"https?:\/\/\*/);
  });
});
