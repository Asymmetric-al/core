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

  it("requires sign-up email confirmation, delivered locally to the mail catcher", () => {
    expect(setting("auth.email", "enable_signup")).toBe("true");
    expect(setting("auth.email", "enable_confirmations")).toBe("true");
    // Local development keeps quick resends and short codes; the hosted
    // values live in the remotes below.
    expect(setting("auth.email", "max_frequency")).toBe('"1s"');
    expect(setting("auth.email", "otp_length")).toBe("6");
    expect(setting("local_smtp", "enabled")).toBe("true");
  });

  it("leaves TOTP for WP2c to switch on", () => {
    expect(setting("auth.mfa.totp", "enroll_enabled")).toBe("false");
    expect(setting("auth.mfa.totp", "verify_enabled")).toBe("false");
  });
});

describe("hosted Auth settings captured per project", () => {
  // Read by the CLI only when it targets that project (`--project-ref` or a
  // link); local `supabase start` ignores them. Values from the WP1 census.
  it.each([
    ["development", '"pnmlrbgjiqzzsthsoikm"'],
    ["production", '"btewedpsxwsjczvmegby"'],
  ])(
    "records the %s project's email frequency and code length",
    (name, ref) => {
      expect(setting(`remotes.${name}`, "project_id")).toBe(ref);
      expect(setting(`remotes.${name}.auth.email`, "max_frequency")).toBe(
        '"1m"',
      );
      expect(setting(`remotes.${name}.auth.email`, "otp_length")).toBe("8");
    },
  );

  it("overrides nothing else for a hosted project", () => {
    const remoteSections = [...readConfigSections().keys()].filter((name) =>
      name.startsWith("remotes."),
    );
    expect(remoteSections.sort()).toEqual([
      "remotes.development",
      "remotes.development.auth.email",
      "remotes.production",
      "remotes.production.auth.email",
    ]);
    for (const name of remoteSections.filter((n) =>
      n.endsWith(".auth.email"),
    )) {
      expect([...readConfigSections().get(name)!.keys()].sort()).toEqual([
        "max_frequency",
        "otp_length",
      ]);
    }
  });
});
