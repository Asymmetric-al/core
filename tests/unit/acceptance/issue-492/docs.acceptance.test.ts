/** #492 done criterion 16: docs/security/capability-spine/registry.md carries each In 6 item (spec r1). Owned by Acceptance. */
import { describe, expect, it } from "vitest";

import { ALL, BUNDLES, CODES, DEFAULTS, DOC, SUBROLES, read } from "./harness";

const doc = () => {
  const text = read(DOC);
  expect(text, `${DOC} must exist`).not.toBe("");
  return text;
};
/** Markdown table rows (lines starting with "|") that mention `token` in backticks. */
const rows = (text: string, token: string) =>
  text
    .split("\n")
    .filter((l) => l.trimStart().startsWith("|") && l.includes(`\`${token}\``));

describe("#492 criterion 16: registry.md", () => {
  it("criterion 16: atom table lists all 18 registry keys", () => {
    const text = doc();
    for (const key of ALL)
      expect(rows(text, key).length, key).toBeGreaterThan(0);
  });

  it("criterion 16: bundles and default subjects (with their bundles) are documented", () => {
    const text = doc();
    for (const b of Object.keys(BUNDLES)) expect(text, b).toContain(`\`${b}\``);
    for (const s of SUBROLES) expect(text, s).toContain(s);
    for (const subject of ["staff:finance", "tenant_admin", "platform_admin"]) {
      const want = DEFAULTS[subject]!;
      const row = rows(text, subject).find((r) =>
        want.every((b) => r.includes(b)),
      );
      expect(row, `${subject} row with ${want.join(", ")}`).toBeDefined();
    }
    for (const m of ["member:donor", "member:missionary"])
      expect(text).toContain(`\`${m}\``);
  });

  it("criterion 16: resolver contract and every error code", () => {
    const text = doc();
    expect(text).toContain("resolveEffectiveCapabilities");
    expect(text).toContain("CapabilityResolutionError");
    for (const code of CODES) expect(text, code).toContain(`\`${code}\``);
  });

  it("criterion 16: dormant overrides, distinguished from #1954's field-policy tenantOverrides", () => {
    const text = doc();
    expect(text).toMatch(
      /tenantOverrides[\s\S]{0,400}dormant|dormant[\s\S]{0,400}tenantOverrides/i,
    );
    expect(text).toContain("#1954");
  });

  it("criterion 16: known unregistered capability-shaped strings (OQ4)", () => {
    const text = doc();
    const strings =
      "ai.settings.manage automation:manage finance:manage_contributions";
    for (const s of strings.split(" ")) expect(text, s).toContain(`\`${s}\``);
  });

  it("criterion 16: hand-offs to #2282 (#667(a)), #671, #497, #498 and #2281", () => {
    const text = doc();
    for (const n of ["#2282", "#667", "#671", "#497", "#498", "#2281"])
      expect(text, n).toMatch(new RegExp(`${n}(?!\\d)`));
  });
});
