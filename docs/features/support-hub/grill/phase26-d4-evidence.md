# Phase 26 D4 — Evidence and independent pressure tests

Checked 10 September 2026. This evidence supports the [D4 review](phase26-d4-adversarial-review.md) and [send/template blueprint](phase26-d4-send-template-blueprint.md). Founder selected A and fully ratified the complete D4 amendments, adjustments, changes and updates on 10 September 2026. D1–D3 remain ratified. Independent proposals below are historical evidence; the final review identifies the adopted, now-ratified synthesis. No product code or external state changed.

## Baseline and authority

- Verified WSL directory: `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`.
- Branch: `codex/grill-with-docs-2026-09-10`; current HEAD and refreshed live develop: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.
- Open PR #1335: `e1c86e1a30f479363960eeb35500112665e16bb3`.
- Open PR #1336: `3b2827ffcf184bf767664018efedda317c7da03c`.
- Open PR #1564: `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1`.
- Installed Resend SDK: 6.11.0; manifest range `^6.9.2`. This is the actual local dependency, not a claim about the latest release.
- Read governing/scoped instructions, grill-with-docs/grilling/domain-modeling, current source and past Phase 6/17/25 and owner requirements. General provider/skill recipes do not override accepted Core ADRs.

## Final synthesis resolves these independent-review differences

The following resolutions govern D4. The independent reports below are retained as evidence, including their initial proposed clauses; they are not three additional competing specifications.

1. **Staged Send action, not immediate menu execution.** The root chose an explicitly labelled After sending single-select control with Keep current status and four alternatives. Selection updates the named primary button without sending. The independent UX reviewer challenged and accepted this as a defensible tradeoff after requiring radio/current-selection semantics, IME/picker guards and clear keyboard behavior. Its earlier recommendation for immediate commands is not adopted.
2. **Ready preparation before local admission.** An initial draft allowed an immutable-input alternative. Independent QA found that this could resolve work before missing variables or compilation failed. That alternative was removed. R03 requires fully validated/compiled, reviewed ready preparation before reply/work/history/dispatch admission. Unadmitted preparation has no delivery authority.
3. **A distinct human-reply preparation-material class.** Close reading of Phase 17 PRD1633–1637 and executable manifest365–366 shows existing classes mean required/source-required donor receipt/financial email (30 days) and optional staff-recipient email sibling of required in-product attention (7 days). Neither covers ordinary external human correspondence. Ratified R14 explicitly requires a separate seven-day-maximum class through the shared material-contract/catalog generator, shortened by all existing authority fences. This is a narrow product/technical judgment, not an already existing class, new system-message key, new Layout Role, body-retention policy or permission to send week-old mail. Earlier independent wording to preserve existing classes without this extension is incomplete and superseded.
4. **Actual provider refresh.** Current official Resend documentation states an initial 10 requests/second per team, shared across keys/domains, and team-wide suppression including transactional mail. Old 5-request and regional/transactional-suppression statements are historical snapshots, not current facts. No live tenant plan/limit was queried and no production constant was changed. SDK/skill fallback advice to change keys or run 3–5 retries is rejected where it conflicts with ADR0032.
5. **Precise probe claims.** SDK tests simulated an HTTP200 empty object and a thrown fetch, not an actual timeout or real provider fault. Correct wording is missing-ID success and thrown-fetch counterexamples. The attachment limit is per email after attachment encoding, not an attachments-only allowance plus unlimited body.
6. **Approval includes staged work intent.** Required fields mean structural contract fields; harmless literal braces are not executable tokens. Shared studio previews stay synthetic. Owner disclosure permission cannot widen a single-recipient protected-action cardinality to a group.
7. **Database exposure is qualified.** Current EmailStudio migration disables RLS but revokes anon/authenticated privileges. This is not evidence of public write/read exposure. D4 nevertheless requires enabled default-deny RLS plus grants and explicit owner commands on the qualified exposed-schema path, including server-only material. Current correction-binding tenant triggers exist; their absence is not alleged.

## Root source inspections and executed experiments

Root independently inspected ADR0029 and ADR0032 in full, Phase 17's exact retention classes, the current template API/test-send/merge helper, current feature glossary/ADRs and the question/ratification record. The source table in the independent reports supplies exact paths and baseline links.

The current merge helper has useful safety primitives: by default it escapes inserted HTML values, preserves readable plain text/Unicode, rejects unknown/missing fields and unsafe typed URL values, and does not recursively substitute inserted strings. It does not sanitize literal template HTML. Its recipient-values-over-global-values precedence also means the upstream resolver must enforce ownership; this helper cannot do authorization. These are bounded helper observations, not a claim of a browser exploit.

### Current-source merge helper results

```json
{
  "source": "Current merge-tag-render.ts and real local static dependencies",
  "cases": [
    {
      "name": "HTML values escaped; plain text preserves readable Unicode",
      "result": "pass"
    },
    {
      "name": "Unknown merge field rejected",
      "result": "pass"
    },
    {
      "name": "Missing required used value rejected; no sample auto fallback",
      "result": "pass"
    },
    {
      "name": "Unsafe typed URL value rejected",
      "result": "pass"
    },
    {
      "name": "Value text is not recursively interpreted as another merge tag",
      "result": "pass"
    },
    {
      "name": "HTML literals are not sanitized by the merge helper",
      "result": "pass"
    },
    {
      "name": "Preview retains unresolved token; not equivalent to valid send",
      "result": "pass"
    },
    {
      "name": "Recipient value overrides global value; resolver must enforce authority before rendering",
      "result": "pass"
    }
  ],
  "passed": 8,
  "networkCalls": 0,
  "envFilesLoaded": 0,
  "limits": "Pure helper only; no route auth, document compiler, browser, database, provider, or Phase 17 production proof."
}
```

### Installed SDK results

```json
{
  "kind": "installed Resend 6.11.0 SDK serialization and response-normalization probe",
  "networkCalls": 0,
  "mockedFetchCalls": 3,
  "checks": [
    "replyTo becomes HTTP reply_to",
    "CC, governed threading headers and attachment content type survive SDK serialization",
    "request idempotency key is placed in HTTP headers",
    "HTTP 200 empty object returns error:null with missing provider id",
    "thrown fetch normalizes to application_error with null statusCode and generic text"
  ],
  "limitations": "SDK only. Not a provider test or end-to-end Core send. No real credential, environment file, inbox, webhook, DNS or external state was used or changed. Current Core wrapper success interpretation was inspected separately."
}
```

Both experiments used local files and invented fixtures only. The merge loader admits real local static email-module dependencies without app bootstrap; its VM has no network or process environment capability. The SDK probe replaces fetch before loading the installed SDK. Zero real network/mail calls and zero environment-file loads. Scripts and hashes follow for reproducibility; these are not full-system tests.

### Probe source: d4-merge-probe.cjs

SHA-256: `2226a79d7da0ef1b689f75f0bdfb7f70c29a334455440b3dfc7a3932efb07a7e`

```javascript
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = "/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10";
assert.equal(process.cwd(), root);
const ts = require(root + "/node_modules/typescript");
const cache = new Map();
function sourceModule(file) {
  file = path.resolve(file);
  assert(file.startsWith(root + "/packages/email/"));
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const source = fs.readFileSync(file, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(
    js,
    {
      module,
      exports: module.exports,
      require: (name) => {
        assert(
          name.startsWith("."),
          "No external module/app bootstrap admitted",
        );
        return sourceModule(path.resolve(path.dirname(file), name + ".ts"));
      },
      URL,
      Date,
      Set,
      Map,
    },
    { filename: file },
  );
  return module.exports;
}
const { renderTemplateForRecipient: r } = sourceModule(
  root + "/packages/email/merge-tag-render.ts",
);
const cases = [];
function check(name, fn) {
  fn();
  cases.push({ name, result: "pass" });
}
check("HTML values escaped; plain text preserves readable Unicode", () => {
  const out = r(
    { html: "<p>{{full_name}}</p>", text: "{{full_name}}" },
    { full_name: "José <R&D> ไทย" },
  );
  assert.equal(out.html, "<p>José &lt;R&amp;D&gt; ไทย</p>");
  assert.equal(out.text, "José <R&D> ไทย");
});
check("Unknown merge field rejected", () =>
  assert.throws(
    () => r({ html: "{{unknown_private_field}}", text: "Hi" }, {}),
    /Unknown merge tag/,
  ),
);
check("Missing required used value rejected; no sample auto fallback", () =>
  assert.throws(
    () => r({ html: "{{full_name}}", text: "Hi" }, {}),
    /Missing value/,
  ),
);
check("Unsafe typed URL value rejected", () =>
  assert.throws(
    () =>
      r(
        { html: '<a href="{{org_website}}">Site</a>', text: "Site" },
        { org_website: "javascript:alert(1)" },
      ),
    /Unsafe URL/,
  ),
);
check("Value text is not recursively interpreted as another merge tag", () =>
  assert.equal(
    r(
      { html: "{{full_name}}", text: "{{full_name}}" },
      { full_name: "{{donation_amount}}", donation_amount: "123" },
    ).html,
    "{{donation_amount}}",
  ),
);
check("HTML literals are not sanitized by the merge helper", () =>
  assert.equal(
    r({ html: '<a href="javascript:alert(1)">Link</a>', text: "Link" }, {})
      .html,
    '<a href="javascript:alert(1)">Link</a>',
  ),
);
check("Preview retains unresolved token; not equivalent to valid send", () => {
  assert.equal(
    r({ html: "{{full_name}}", text: "Hi" }, {}, {}, { previewMode: true })
      .html,
    "{{full_name}}",
  );
  assert.throws(
    () => r({ html: "{{full_name}}", text: "Hi" }, {}),
    /Missing value/,
  );
});
check(
  "Recipient value overrides global value; resolver must enforce authority before rendering",
  () =>
    assert.equal(
      r(
        { html: "{{org_name}}", text: "{{org_name}}" },
        { org_name: "Caller value" },
        { org_name: "Owner value" },
      ).html,
      "Caller value",
    ),
);
process.stdout.write(
  JSON.stringify(
    {
      source: "Current merge-tag-render.ts and real local static dependencies",
      cases,
      passed: cases.length,
      networkCalls: 0,
      envFilesLoaded: 0,
      limits:
        "Pure helper only; no route auth, document compiler, browser, database, provider, or Phase 17 production proof.",
    },
    null,
    2,
  ) + "\n",
);
```

### Probe source: d4-sdk-probe.mjs

SHA-256: `b1629555f352f4330a964e9e8566f4aa02dd92d78f1313e5899a2280b57512b4`

```javascript
// Isolated installed-SDK probe. Fetch is replaced before importing the SDK.
// Uses invented fixture values; performs no network or environment-file load.
import assert from "node:assert/strict";
import fs from "node:fs";
const captures = [];
let responseMode = "success";
globalThis.fetch = async (_url, options) => {
  captures.push(options);
  if (responseMode === "throw")
    throw new TypeError("synthetic network failure");
  return new Response(
    responseMode === "empty" ? "{}" : '{"id":"fixture-provider-id"}',
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );
};
const { Resend } =
  await import("/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10/packages/email/node_modules/resend/dist/index.mjs");
const sdk = new Resend("re_synthetic_design_fixture");
const payload = {
  from: "Support <support@example.invalid>",
  to: ["sarah@example.invalid"],
  cc: ["james@example.invalid"],
  replyTo: "support+opaque@example.invalid",
  subject: "Re: fixture",
  html: "<p>Fixture</p>",
  text: "Fixture",
  headers: {
    "In-Reply-To": "<parent@example.invalid>",
    References: "<parent@example.invalid>",
  },
  attachments: [
    {
      filename: "fixture.txt",
      content: Buffer.from("fixture"),
      contentType: "text/plain",
    },
  ],
};
const result = await sdk.emails.send(payload, {
  idempotencyKey: "fixture-send-1",
});
const wire = JSON.parse(captures[0].body);
assert.equal(result.data.id, "fixture-provider-id");
assert.equal(wire.reply_to, payload.replyTo);
assert.deepEqual(wire.cc, payload.cc);
assert.equal(wire.headers["In-Reply-To"], payload.headers["In-Reply-To"]);
assert.equal(wire.attachments[0].content_type, "text/plain");
assert.equal(
  new Headers(captures[0].headers).get("idempotency-key"),
  "fixture-send-1",
);
responseMode = "empty";
const empty = await sdk.emails.send(payload, {
  idempotencyKey: "fixture-send-2",
});
assert.equal(empty.error, null);
assert.equal(empty.data.id, undefined);
responseMode = "throw";
const failed = await sdk.emails.send(payload, {
  idempotencyKey: "fixture-send-3",
});
assert.equal(failed.error.name, "application_error");
assert.equal(failed.error.statusCode, null);
assert.equal(
  failed.error.message,
  "Unable to fetch data. The request could not be resolved.",
);
assert.equal(captures.length, 3);
const report = {
  kind: "installed Resend 6.11.0 SDK serialization and response-normalization probe",
  networkCalls: 0,
  mockedFetchCalls: captures.length,
  checks: [
    "replyTo becomes HTTP reply_to",
    "CC, governed threading headers and attachment content type survive SDK serialization",
    "request idempotency key is placed in HTTP headers",
    "HTTP 200 empty object returns error:null with missing provider id",
    "thrown fetch normalizes to application_error with null statusCode and generic text",
  ],
  limitations:
    "SDK only. Not a provider test or end-to-end Core send. No real credential, environment file, inbox, webhook, DNS or external state was used or changed. Current Core wrapper success interpretation was inspected separately.",
};
fs.writeFileSync(
  new URL("./d4-sdk-probe-result.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
```

## Primary-source comparison limits

The strongest direct product comparisons are Zendesk's explicit submit status, Front's sending/template controls, HelpScout's post-reply default and saved wording, Freshdesk's Insert/Replace, Zoho's template/reply controls and HubSpot's editor/personalization limitations. Kustomer's relevant pages returned empty direct extraction; official indexed article/category text corroborated the behavior, and edition availability was not established. That weaker access is explicitly identified rather than presented as a complete direct product test. Vendor UI documentation does not reveal internal architecture or prove measured staff benefit.

No Asym staff research data or production incident rate was supplied. Severity/likelihood labels are calibrated engineering judgments. Concrete donor/Finance examples are fixtures. All owner authority and implementation claims depend on current repository evidence, not vendor marketing. The independent report below includes dates/edition qualifications and direct links. No numerical commercial snippet/template limit was adopted as an Asym requirement.

## Independent Email Studio and owner-contract review

### D4 independent review — how Email Studio actually joins Support replies

10 September 2026. Read-only repository and governing-contract audit for founder-selected **A: Send reply preserves current work status**, plus the explicit request to explain Email Studio integration against past specifications and the real Core stack. Verified `pwd` at `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10` and HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Parent refreshed live develop and the relevant open PRs, including #1336, at the unchanged baseline. No PR branch is treated as merged behavior. No implementation, new formal spec, migration, provider call, production data access, secret inspection or GitHub write occurred.

#### Conclusion and exact integration answer

**Accept A, with the qualified template/preparation amendments below.** Email Studio is the shared authoring/presentation/preparation owner; it is not a requirement to select a system-message template before every human reply. The correct integration has three distinct content uses:

1. **Human Support reply:** the staff member writes in Support's composer, optionally inserts a saved reply/eligible Saved Section, reviews the actual audience and sends. The human reply remains Support-owned content outside the system-message catalog. Inserting saved wording copies approved compatible structured content into that draft; editing the source later does not rewrite it.
2. **Shared email presentation:** the reply uses a qualified compact presentation through Phase 17's shared compiler/presentation/preparation contract—tenant branding, safe typography/assets, appropriate wrapper/signature, verified sender/reply identity and HTML/plain text. The staff member should not visit Email Studio or choose branding on each reply. A new Support-compatible consumer must be explicitly qualified; a production-ready Support template/preparation integration does not yet exist in this source.
3. **Actual automated system notices:** if later Phase 26 authorizes assignment, acknowledgement, SLA or undelivered notices, each needs its finite producer meaning, audience and Live catalog contract. The current Phase 17 inventory leaves these Support notice keys deferred. They must not be implemented as anonymous free-form sends or arbitrary template IDs. D4 adds no auto-acknowledgement or status-triggered message.

The flow should be: **Support draft + optional copied wording → qualified owner facts and audience → shared canonical server compiler/presentation preview → exact human approval and immutable per-recipient preparation → Phase 6 dispatch/native-group mapping and evidence → same Support conversation + one communication event per admitted recipient copy.** D4 A preserves the current work/reminder state; insertion, preview, publication and Send alone do not change it. D3's qualified adverse-event/new-input transitions still operate independently.

“Email Studio templates” is therefore not one undifferentiated thing. Shared reusable content, immutable branding/layout dependencies, a human reply's final body, and automatic system-message publications have different ownership and permissions. Calling all four a template would hide the important seams.

#### Governing authority and conflict resolution

| Source                                                                               | Controlling meaning                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openspec/specs/platform-boundaries/spec.md:381–406`                                 | Automated donor emails use Email Studio/notification policy and shared services. This requirement concerns automations; it does not require every human Support reply to be a system-message template.                                               |
| `openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md:80–87`    | Human-authored Support replies are explicitly outside the system-message catalog; their later owning phase governs composition, while delivery crosses the one Phase 6 recipient-specific seam.                                                      |
| `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md:14–46` | Merged baseline, active capability requirements, PRD/executable manifest and accepted ADRs must agree; current code is reality evidence, not permission to weaken the design. The document labels Phase 17 planning only (`:5–10`).                  |
| Same PRD `:274,498,512`                                                              | Phase 26 owns inbound, threading, assignment, reply content, retention and send-reply operations; human replies outside catalog; Support automatic-notice meanings deferred.                                                                         |
| Ratified D1 review `:542–551`                                                        | Phase 17 prepares a bounded human-authored reply and Phase 6 dispatches/records each recipient copy once; no forced fixed system-message template merely to reuse preparation. This later explicit Support bridge governs the qualification work.    |
| ADR-0029                                                                             | Tenant-owned Resend, exact revisioned connection, sender profile and independent reply destination; no request-built identities or shared tenant fallback.                                                                                           |
| ADR-0030; outbound delta `:230–258`                                                  | Canonical structured source, one server compiler, immutable complete presentation dependencies, copy-on-insert Saved Sections, no provider-template source or live fragment fan-out.                                                                 |
| ADR-0032                                                                             | Immutable semantic occurrence/command/preparation/submission identities, current safety reproof, pinned bytes and qualified recovery; provider idempotency is secondary.                                                                             |
| Outbound delta `:878–885,926–938`                                                    | Tenant Party/contact authority **or** exact tenant no-Party authority; no fake Party, cross-scope transport or plaintext durable-address identity. Later explicit no-Party rule wins over stale Party-only summary language, as D1 already ratified. |

An important scope limit: Phase 17 PRD `:918–926` earns **Service message**, **Protected action** and **Official artifact delivery** roles only. It explicitly says personal correspondence is not an email Layout Role in that generation. Do not invent an already-implemented “Support reply layout.” A compact Service-message-compatible presentation is the narrow structural starting point, but the Support consumer must prove compatibility and receive an explicit bounded owner contract. Adding a role requires a real structural need, not just the name Support. D1's preparation reuse does not erase this qualification gap.

##### Exact proposed reconciliation for D4

“Phase 26's human reply is a bounded **non-catalog Support composition contract** consumed by shared Phase 17 compilation/presentation/preparation and Phase 6 delivery. It does not become a new system-message meaning or require publication of each personal reply. Qualify the existing compact Service message presentation for this consumer, retaining immutable Brand Kit/Role Layout and protected-action boundaries. The Phase 17 exclusion of personal correspondence from its launch role inventory is preserved: no new Personal correspondence/Support layout role is presumed or created merely to name this surface. If an existing role cannot represent the required safe reply, its owning contract must be explicitly amended before activation; no local alternate renderer is allowed.”

This resolves the ownership question now in grooming; it does not pretend the integration is implemented. D4's proposed amendment makes the existing D1 preparation requirement concrete without silently overriding Phase 17's catalog/role exclusions.

##### Preview to local admission — no hot updates and no per-reply publication

“An inserted section becomes a versioned structured draft snapshot with source provenance. Final reply preview is generated by the shared server compiler from that exact current draft, qualified facts/audience and compatible presentation revisions. The preview/review result binds a digest/version of the draft, audience, selected action and dependency/authority pins. Send supplies the expected reviewed identity; the server revalidates the exact input and current safety/authority and atomically admits the immutable human reply and required state/history/dispatch effects. Changed draft/audience/dependency input requires a refreshed exact preview/review with staff work preserved; the server cannot silently substitute new content or branding under an earlier approval. This is message preparation, not shared-template publication.”

“After admission, shared template/publication/branding changes affect future unprepared work only. Prepared replies retain the exact pins/bytes. Current safety/authorization/quarantine can block eligible unsubmitted work, but cannot mutate approved content or authorize new-key replay. Existing ADR-0032 restricted-material classes, sealed submission-key rules, bounded same-key follow-up and purge/reconcile obligations remain intact; D2 native visible-group qualification is distinct from the strict provider batch endpoint contract.”

| Source citation                                                                                                                                                                                          | Document status/date                                                                         | Checked                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------ |
| [Phase 17 PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L14)                     | Ratified D1–D20 17–19 July 2026; specification 19 July; planning-only implementation posture | Source 10 September 2026 |
| [Explicit human-reply exclusion](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L84)      | Checked-in active OpenSpec intended contract, not evidence of runtime shipment               | 10 September 2026        |
| [Earned roles and copy-on-insert](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L918) | Phase 17 D13 authoring/presentation scope                                                    | 10 September 2026        |
| [ADR-0029 sender/connection](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0029-tenant-owned-resend-and-composed-delivery-identities.md)                  | Accepted Phase 17 D10/D17/D20 architecture                                                   | 10 September 2026        |
| [ADR-0030 canonical document](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0030-canonical-message-document-and-presentation-dependencies.md)             | Accepted Phase 17 D4/D13/D18 architecture                                                    | 10 September 2026        |
| [ADR-0032 preparation/recovery](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0032-immutable-prepared-message-and-whole-message-recovery.md)              | Accepted Phase 17 D15 architecture with exact current amendments                             | 10 September 2026        |
| [Current template schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260511023547_email_studio_react_email_builder.sql)                   | Migration dated 11 May 2026; current committed source, deployed enforcement uninspected      | 10 September 2026        |
| [Current browser export](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/ui/components/studio/ReactEmailEditor.tsx#L106)                                    | Source at verified baseline, not Phase 17 server-compiler completion                         | 10 September 2026        |

#### What the current stack actually provides

| Current fact                                         | Evidence / practical limit                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin Email Studio uses the shared `@asym/ui` editor | `packages/ui/components/studio/EmailStudioEditor.tsx:20–45` delegates to ReactEmailEditor; Unlayer is excluded from the active Email Studio visual path and retained only for legacy reads/PDF paths.                                                                                                                                                     |
| React Email editor with Tiptap underpinnings         | `ReactEmailEditor.tsx:9–12,83–98` uses `@react-email/editor/core`, its StarterKit, EmailTheming and Tiptap extension. `packages/ui/package.json:61–81` pins Base UI 1.5.0 / React Email editor 1.5.3 and declares Tiptap ^3.22.3. These manifest values do not claim the latest internet release.                                                         |
| Browser exports HTML/text today                      | `ReactEmailEditor.tsx:106–130` calls `composeReactEmail` in the client and exports design/HTML/text with builder version 1.5.3. It is not the completed server-authoritative Phase 17 compiler.                                                                                                                                                           |
| Current template API is admin-only                   | `packages/api/src/email/templates.ts:155–160` requires admin/super_admin. It is not an ordinary Support staff consumption API.                                                                                                                                                                                                                            |
| Mutable templates plus numbered versions             | `templates.ts:33–51` accepts builder/category/designJson/client HTML/text/isActive/isSystem; `template-store.ts:438–469` reads current version, updates active row to version+1, inserts version separately, then syncs correction binding. It has no expected-revision CAS/publication transaction.                                                      |
| Current template schema is a migration input         | `supabase/migrations/20260511023547_email_studio_react_email_builder.sql:3–50,76–80`: categories transactional/campaign/system, active/system booleans, mutable template, version child, RLS disabled, anon/authenticated privileges revoked. That is server-only exposure, **not publicly writable**, but not the full planned tenant publication model. |
| Current merge tags are a broad registry              | `packages/email/merge-tags.ts:28–238` includes organization, recipient, donations, missionary location/bio and links. `merge-tag-render.ts:105–149,153–220` validates recognized tokens/value presence and escapes substitutions; it does not encode the complete audience/privacy/protected-action authority required by Phase 17.                       |
| Support has a separate tiny string expander          | `apps/admin/features/support-hub/lib/merge-variables.ts:20–54,63–82` resolves donor/contact/agent tokens and returns raw String values, with unknown tokens preserved. `canned-suggestion.ts:54–66` substitutes then inserts raw HTML. Prior D1 evidence already demonstrated the escaping problem; it is not re-tested here.                             |
| Support send is not prepared shared delivery         | `packages/api/src/admin/support-hub/adapter/supabase.ts:904–939` accepts caller body, constructs headers and targets conversation contact; no Email Studio publication/dependency/variable/preparation reference. D1/D2/D3 already require replacement by the qualified owner path.                                                                       |
| Test send is operational, not reply dispatch         | `template-test-send.ts:41–60` accepts raw HTML/text/sample tags and sender overrides; `:102–150` admin role + tenant key; `:209–269` renders test data and calls sendEmail; `:275–320` records logs afterward with explicit audit warnings. It is neither immutable preparation nor the Support send endpoint.                                            |

The Phase 17 PRD itself calls these gaps FORWARD at `:291–314`. Scoped source/migration searches for its publication, Brand Kit/Role Layout and preparation families found no implementation under those names; this agrees with observed source, but does not prove every deployment or external branch lacks equivalent work. The fresh open PR state does not change merged reality.

#### Material concerns and exact required clauses

Severity and likelihood are conditional engineering judgments, not measured production incident frequency.

##### ES1 — conflating human reply with system-message template

**Risk:** Staff must choose a template/catalog key just to converse, or developers create a generic `support_reply` system key with arbitrary recipients/body. This breaks the catalog's producer meaning and can add pointless approval steps. **Severity:** High for authority and scope; Medium for friction. **Likelihood:** high if the integration is described only as “use Email Studio templates.”

**Evidence:** outbound delta `:84–87`, PRD `:274,498,512`, D1-R7 quoted above.

**Effect on A:** keep A; clarify integration scope.

**Permanent fix / clause:** “Human Support replies remain Support-owned free-form correspondence outside the system-message catalog. Staff may send without selecting reusable wording. Shared Phase 17 compilation/presentation/preparation is consumed through an explicitly qualified human-reply contract, with Phase 6 delivery/history. Automatic Support notices require their own finite admitted system-message contract only when that notice is separately authorized. Inserting wording or publishing shared presentation never sends mail or changes work status.”

##### ES2 — importing arbitrary Email Studio categories or campaign designs

**Risk:** A campaign template brings marketing consent/tracking, recipient assumptions, heavy layout, arbitrary actions or a system-notice claim into an ordinary reply. A category/isSystem flag is mistaken for safety approval. **Severity:** High. **Likelihood:** plausible with a generic “all active templates” picker.

**Evidence:** current API defaults/categories and active list (`templates.ts:33–51`; `template-store.ts:370–382`); PRD `:293–295`, earned roles `:918–926`.

**Effect:** required narrowing.

**Clause:** “The Support insert picker exposes only tenant-scoped, currently authorized content qualified for the human-reply document contract. Campaign designs, system publications, protected-action notices and incompatible legacy source cannot appear merely because they are active or share an email category. Reuse compatible structured Saved Sections/presentation primitives; do not copy a full campaign template, create a provider-template sync, or add a second renderer. Explain unavailable content and preserve the current draft.”

A plain, compact reply appearance is the product recommendation; it must still meet the shared branding/accessibility/compiler contract. No arbitrary new layout role or marketing shell is necessary.

##### ES3 — broad variables reveal CRM information to copied recipients

**Risk:** Registry membership is treated as permission. A donor's amount, missionary location, protected link or recipient-specific greeting is resolved into a group email seen by other To/Cc participants. Shared Email Studio authoring becomes a live CRM data browser. **Severity:** High. **Likelihood:** plausible if the current broad registry is exposed unchanged.

**Evidence:** `merge-tags.ts:109–195`; current Support conversation-level donor fields (`merge-variables.ts:63–82`); Phase 17 typed variable contract `PRD:757–768`; D2 native group audience.

**Effect:** required amendment.

**Clause:** “Support variables are qualified typed nodes with source owner, allowed audience/output context, null behavior, length, formatting and escaping. The server resolves only permitted facts for the exact approved audience. Being a known variable, same-tenant contact or Support participant grants no disclosure authority. Shared template/section authoring and tests use stored synthetic scenarios only; the actual reply preview may show only conversation/owner facts already authorized for that staff member and all intended recipients. A visible group reply has one reviewed body; it cannot secretly personalize distinct content per recipient or use the first email address as fact authority.”

“Missing or incompatible required facts block the affected insert/preparation with retained draft and one clear action; optional omissions follow the bounded contract. Protected owner actions/documents are inserted as owner-qualified references/components, never arbitrary URLs or financial claims. No variable changes recipients, reply mode, assignment or work status.”

Do not require every ordinary greeting to have a CRM Party; the qualified no-Party branch must work. Current sender observations and safe manual prose remain usable without inventing a person record.

##### ES4 — two renderers and mutable compiled HTML undermine approval

**Risk:** The staff preview looks safe while the server sends different HTML/text; client HTML is accepted as authoritative; unknown tokens leak; protected markup is stripped or unsafe links survive. **Severity:** High. **Likelihood:** current browser-export/raw-input pattern makes divergence concrete; D1 already identified serializer counterexamples.

**Evidence:** `ReactEmailEditor.tsx:106–130`; `templates.ts:43–47`; Support canned substitution; ADR-0030; outbound delta `:230–250`.

**Effect:** mandatory permanent fix; not an excuse to replace the existing UI library.

**Clause:** “One canonical structured document and qualified server compiler produce the HTML and plain text used for final preview and preparation. Browser exports are preview/interoperability evidence, not source authority. The same schema/allow-list, encoders, protected nodes, assets and compatible compiler versions apply to free-form reply and inserted content. Reject unsupported or unsafe source explicitly; do not keep raw HTML/CSS/script/provider-template source or silently strip protected meaning. The shared React Email/Tiptap editor remains a UI primitive, not a second authoritative compiler.”

##### ES5 — ordinary reply consumption accidentally grants publication power

**Risk:** To let donor-care staff use templates, developers broaden the admin-only Email Studio API or give Support staff brand/publish/connection management. A user can then change every future tenant email rather than just their current reply. **Severity:** High. **Likelihood:** plausible shortcut.

**Evidence:** `templates.ts:155–160`; Phase 17 capability matrix `PRD:2475–2497`: read/draft/edit/publish/review/brand/layout/sender/connection/recent-copy are distinct.

**Effect:** preserve A and effortless usage; narrow authorization.

**Clause:** “Template/section consumption, editing the current reply, managing shared saved content, publishing branding/layout/system messages and managing delivery identities are separate authorities. Support staff receive only the qualified consumption/current-reply capabilities they need. Shared publication retains its owner capability and proportional review rules; ordinary free-form replies do not acquire a publication review ritual. The server derives actor/tenant/scope, verifies the exact source/version and current resource authorization, and returns only safe compatible content metadata.”

Current required admin roles are implementation reality, not the final Phase 12 capability design. Use a narrow owner-provided consumption projection; do not simply expose the mutable authoring endpoint to all staff or copy private templates into Support storage.

##### ES6 — mutable versions race and silently change drafts/prepared sends

**Risk:** Concurrent template edits both write version N+1; one version insert fails after the mutable head changed. Saved wording or published dependencies are later re-resolved and alter an already approved reply. **Severity:** High for content/history; Medium for authoring conflict. **Likelihood:** deterministic concurrent edit/rerender pattern.

**Evidence:** `template-store.ts:438–469` separate update/version/binding writes with no expected version; ADR-0030 copy-on-insert/immutable publication; ADR-0032 immutable preparation.

**Effect:** require owner completion; no whole Email Studio rebuild beyond consumed guarantees.

**Clause:** “Shared authoring saves/publications use the owner's expected revision/head epoch and atomic source/version/dependency evidence. Inserting saved wording snapshots its compatible structured content and provenance into the Support draft; later source edits never mutate that draft. Preparation freezes exact reviewed content, source/provenance, assets, branding/layout, compiler, locale, sender/reply connection and audience. Safety/quarantine/revocation remains live and may block unsubmitted work, but cannot silently substitute another template or rerender approved bytes. Restore creates a new candidate for future work.”

Routine source retirement is not automatically authority to erase an existing copied draft, while a security revocation is not ignored merely because insertion was copied. Preserve source provenance to qualify these distinct cases; no hidden live dependency is required.

##### ES7 — current template storage is not the safe publication schema

**Risk:** A caller reaches an unprotected table after grants are broadened; a privileged writer links a version to a foreign-tenant template; delete cascades erase publication evidence; active flags bypass review. **Severity:** High. **Likelihood:** conditional on naive reuse/exposure; current client writes are revoked.

**Evidence:** template migration `:3–50,76–80`: RLS disabled with client privileges revoked, version FK is template ID plus separately stored tenant (not composite). Correction-binding migration has tenant-reference triggers (`20260611151000...:111–124,159–172,195–204`), so do not incorrectly claim those references have no guard. They do not make template-version publication immutable or supply the full planned schema. PRD `:1847` requires same-scope keys and separate mutable heads/append-only versions.

**Effect:** required schema/access qualification.

**Clause:** “Do not widen current table grants as the Support integration. Introduce the qualified owner read/command boundary with RLS enabled on exposed tables, least-privilege grants, same-tenant/scope parent-child constraints, immutable publication/version evidence and versioned mutable heads. Any direct mutation policy checks both old and new scope plus immutable owner fields; service-role code performs the same authorization. Exposed views/RPC execution cannot bypass it. Current template categories, `is_active`, `is_system` and family bindings are migration inputs, never publication or Live authority.”

No live database exposure was tested; this is a structural source finding. Do not report current RLS-disabled but grant-revoked tables as publicly readable/writable.

##### ES8 — sender identities and test-send endpoints become a bypass

**Risk:** Support sends via a template-test endpoint with request-selected From/Reply-To, global key fallback or provider template ID, losing tenant identity, retry certainty and message history. **Severity:** High. **Likelihood:** plausible if the existing operational send is mistaken for the missing production seam.

**Evidence:** `template-test-send.ts:41–60,110–150,224–269,275–320`; current Support sets agent email/fallback directly (`adapter/supabase.ts:924–932`); ADR-0029/0032 explicitly constrain identities and provider I/O.

**Effect:** preserve A; integration blocker before egress.

**Clause:** “All real Support replies use the tenant's qualified revisioned connection, proved sending identity and independent governed reply destination. Templates and browser requests cannot override transport headers, credentials, account or return routing. The operational template-test/connection-test endpoints remain synthetic test paths and never become Support send APIs or donor communication history. Real send admission and required local evidence precede provider I/O; unknown outcomes reconcile under the sealed identity. No shared Asym tenant fallback, provider template synchronization or independent Support queue is introduced.”

##### ES9 — publication/preview/work status accidentally performs a business action

**Risk:** Choosing a canned receipt/refund template implies that the action happened; saving a template activates a notice; a macro both inserts text and resolves without explicit review. **Severity:** High. **Likelihood:** demonstrated need because canned text currently includes “We just re-sent your gift receipt” while insertion itself does not perform owner action.

**Evidence:** `packages/api/src/admin/support-hub/adapter/fixtures.ts:248–254` canned receipt claim; system binding synchronization `template-store.ts:209–247`; D1 owner-action boundaries and D3 status semantics.

**Effect:** required content/provenance separation.

**Clause:** “Saved reply content is an authoring aid, not proof of any action. Source-owned receipt/refund/contact/action facts and protected links appear only when the owning domain supplies current authorized evidence. Inserting content never executes that action, adds recipients, changes work status/reminder or publishes shared content. D4 Send alone preserves current work state and valid reminder; explicit combined actions, if offered, remain named and governed by D1–D3. A template update is future authoring/publication, never replay of old conversations.”

#### Narrow permanent path and dependency order

1. **Record D4 A plus the three content distinctions now.** Free-form reply optional saved wording; shared presentation/preparation owner; separate future automated notices. This is the corrected answer, not a formal spec.
2. **Qualify the exact Support consumer in Phase 17/6.** Reconcile the no-Party recipient branch, native group body/member mapping from D2, compatible compact presentation, allowed variables and protected owner actions, final preview/approval and immutable preparation. Do not need the whole unrelated catalog to ship, but every consumed owner guarantee must actually exist.
3. **Reuse the existing stack without retaining unsafe seams.** Keep Core shared Base UI/base-maia controls and React Email/Tiptap editing. Consolidate canonical structured document/variable/compiler ownership; replace the Support string expander and browser-HTML authority at the governed boundary. No second renderer or provider-template import/sync is the permanent fix.
4. **Keep shared settings out of the reply hot path.** Staff write/insert/review/send in the Support conversation. Branding, layout, sender and source publication are configured by their owners; no per-reply studio visit or mandatory template selection. Preserve the draft and exact audience through missing/incompatible content errors.
5. **Prove the complete consumption lane before activation.** Source snapshot, publication conflict, tenant/capability, group disclosure, unknown requester, compiler parity, current quarantine and immutable retry all require outcomes tests. Existing operational test send and editor previews do not satisfy them.

#### Falsifiable proof obligations

- Human reply with no saved content works through qualified preparation and preserves work status/reminder; no catalog-key/Party/portal requirement is introduced.
- Insert permitted tenant saved content; body copies once with provenance; edit source afterward and existing draft/preparation remains unchanged. Foreign tenant, unavailable/revoked/incompatible source is denied safely without losing work.
- Staff allowed to consume a reply section cannot read unrelated system drafts, change brand/layout/connection or publish; provider secrets never reach metadata/preview/export.
- Malformed/raw HTML/unknown node/unsafe URL/control characters/unresolved required variable fail before egress; HTML/text final preview equals approved compiler output. D1 serializer regressions are covered at the public seam.
- Group To/Cc recipients do not receive requester-only finance/care/action values; no implicit per-recipient body divergence, recipient addition or fake Party. Unknown requester uses the qualified no-Party branch.
- Protected source action cannot be forged by choosing wording; owner state/permissions/revocation remain checked; historical or changed recipient authority cannot reveal an expired sent copy.
- Concurrent shared edits produce a revision conflict without head/version/binding partial publication; current last-known-good publication survives failed dependency review.
- Brand/layout/locale/sender change before approval is visible in exact preview/review; change after preparation never rerenders or swaps identity; safety revocation blocks only through exact fenced recovery.
- Test send stays synthetic and separate from real donor history. Real reply cannot invoke the test endpoint or accept caller-built provider headers/key/classification.
- Actual database allow/deny/grants/RLS/composite relationship tests and controlled provider/native-group proof remain required; no mock/editor screenshot substitutes for these.

#### Evidence limitations

This audit read source and accepted/proposed governing documents. It did not execute Core template compilation, database transactions, real-user previews, provider deliveries or a new exploit probe. D1's earlier serializer experiment remains historical evidence rather than newly executed D4 proof. Current package values are repository manifests; no latest-version recommendation is made. The parent independently researches current product UX comparisons. The main authority here is Core's explicit human-reply exclusion, canonical-content/preparation architecture, and ratified D1–D3, not competitor behavior.

No memory-derived product facts were used; the user/workflow context was already established earlier in this agent's task history. No memories were changed.

## Independent Resend and durable-workflow review

### D4 — Independent Resend, prepared-message and durable workflow audit

Checked 10 September 2026. Founder chose **Send reply preserves current work status**, with explicit alternatives discussed in Q4. The parent requested full reconciliation with actual Resend, Email Studio, the current stack and prior contracts. This bounded report covers transport, preparation, workflow and evidence. It is not implementation, provider qualification or permission to send mail. D1/D2/D3 remain ratified.

**Disposition: Accept with required amendments.** Preserve the plain Send default and its current valid reminder. The permanent integration is the already-governed Support command → Phase17 preparation → Phase6 dispatch/evidence path using Core's Resend adapter and shared workflow capability. Current source has useful pieces, but that complete path is not implemented. Creating another Support-specific sender, using Email Studio's test-send as a production queue, or claiming a queued row proves delivery would violate existing direction.

#### Evidence method and exact stack

WSL execution directory was verified at `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`. HEAD remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; the parent freshly checked live develop and predecessor heads. Read relevant current source, installed SDK, accepted ADR0030/0032, Phase6/17 planning requirements, ratified D1–D3 and official provider documentation. No real credential/environment file, production database, inbox, DNS, webhook registration or message was used/changed.

`packages/email/package.json` declares `resend: ^6.9.2`; both `bun.lock:3587` and installed `packages/email/node_modules/resend/package.json` resolve **6.11.0**. Its transitive dependencies include postal-mime 2.7.4 and svix 1.90.0. Core owns `@asym/email`; API routes live through `@asym/api`; Supabase/Postgres owns product records; shared Inngest orchestration owns attempts/handoffs, not Support or delivery truth. No SDK upgrade is proposed solely because a newer version might exist.

Executed isolated SDK probe: `work/d4-sdk-probe.mjs` and `work/d4-sdk-probe-result.json`. Global fetch was replaced before importing the installed SDK. Three mocked fetch calls and zero network calls verified SDK serialization and response normalization. This is not a live provider or end-to-end Core test.

#### What works and what is actually missing

| Area                           | Current verified behavior                                                                                                                                                                                                   | Evidence / implication                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Support send                   | Writes Queued/draft `support_messages`, synthetic local Message-ID, current contact To and empty CC/BCC; it does not invoke Resend.                                                                                         | [adapter:904-939](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L904). A complete outbound path must be added through existing owners, not inferred from this queue-shaped row.                                                                                                                                                              |
| Work preservation              | Non-draft outgoing email updates first-response metadata, clears snooze and changes Snoozed to Open.                                                                                                                        | [adapter:651-658](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L651). Current behavior contradicts D4 preserve-status/reminder and D1 honest response evidence.                                                                                                                                                                             |
| Core wrapper                   | `SendEmailOptions` exposes To, From, ReplyTo, subject, HTML/text, mandatory key and tags. It does not expose CC, BCC, attachment or threading-header inputs.                                                                | [resend.ts:71-81](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/email/resend.ts#L71); [payload:962-974](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/email/resend.ts#L962). The shared SDK supports these features, but this Core seam currently does not.                                                                                 |
| SDK mapping                    | 6.11.0 converts `replyTo` to HTTP `reply_to`; forwards CC/BCC/headers/attachments and attaches the idempotency HTTP header.                                                                                                 | Installed SDK `dist/index.mjs:187-205,776-781,1125-1135`; confirmed with mocked fetch. CamelCase ReplyTo is correct Node SDK usage, not a bug.                                                                                                                                                                                                                                                                                            |
| Wrapper response contract      | No response error means success even when `data.id` is absent. Unknown failures become `success:false` and an application code.                                                                                             | [resend.ts:984-991,1020-1042](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/email/resend.ts#L984). Mocked SDK HTTP200 `{}` returned error:null/no ID; wrapper success interpretation is a source-proven gap, not a provider incident.                                                                                                                                                      |
| SDK network error              | The SDK catches thrown fetch and returns generic `application_error`, null statusCode and `Unable to fetch data...`.                                                                                                        | Installed SDK `dist/index.mjs:1113-1122`, verified in isolated probe. The wrapper cannot reliably recover original network disposition from that text.                                                                                                                                                                                                                                                                                    |
| Wrapper retry                  | Up to three retries after the initial call; retryability uses Retry-After presence, status list and message substrings, with in-process sleep.                                                                              | [resend.ts:276-304,978-1042](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/email/resend.ts#L276); [constants:77-84](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/email/constants.ts#L77). This is not ADR0032's exhaustive classifier, bounded same-envelope follow-up or durable attempt policy.                                          |
| Email Studio test-send         | Renders sample values into HTML/text, calls `sendEmail`, then records a send log. Generates a new random request key per invocation. Audit failure is treated as a warning; consent is skipped if admin client unavailable. | [template-test-send:209-295](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/template-test-send.ts#L209). It is an admin testing path, not a reusable durable production admission boundary. Do not copy its tolerated post-send audit/consent gaps into Support.                                                                                                              |
| Provider templates versus Core | Current test-send submits rendered HTML/text. The provider supports its own template IDs, but those are not Asym's canonical structured source or publication authority.                                                    | [test-send:254-268](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/template-test-send.ts#L254); accepted [ADR0030:18-47](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0030-canonical-message-document-and-presentation-dependencies.md#L18).                                                                                  |
| Shared workflow registry       | Registers smoke, dispatch recovery, donation/Stripe processing and inbound-email processing. No Support outbound dispatcher is registered.                                                                                  | [serve:21-31](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/serve.ts#L21). Scoped searches found no `communication_events`/prepared-artifact production path in the reviewed API/email runtime. This is a scoped absence finding, not a claim all email senders are absent.                                                                                              |
| Inbound workflow               | Durable staged retrieval/routing exists, using a global server RESEND_API_KEY, per-tenant concurrency3, global throttle8/second, four retries.                                                                              | [inbound function:27-54,74-105](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/functions/inbound-email-processing.ts#L27). Reuse its shared dispatch infrastructure, not its credential scope as proof of P17 tenant connection correctness.                                                                                                                              |
| Signed webhook                 | Reads raw body and uses SDK/Svix verification. Missing config/persistence returns non-success.                                                                                                                              | [webhook:578-635](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L578). Correct raw-body verification must be preserved.                                                                                                                                                                                                                                   |
| Webhook scope                  | Uses global key/secret; payload tenant ID is preferred, else send-log lookup for outbound and recipient-domain inference for inbound.                                                                                       | [webhook:261-289,543-575](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L261). Signature proves provider-origin bytes, not arbitrary tenant metadata's authority. P17 requires exact connection revision ownership.                                                                                                                                       |
| Event identity and members     | Event dedupe prefers IDs in payload, otherwise synthetic hash; `svix-id` participates in signature but is not the event idempotency key. Recipient extraction takes only `to[0]`.                                           | [webhook:304-342,639-644](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L304). This is insufficient for documented at-least-once delivery and D2's proved group-member mapping.                                                                                                                                                                           |
| Event reduction                | Sent/delivered/delayed/opened/clicked overwrite send log as sent; bounced/complained/suppressed overwrite as bounced; email.failed has no mapping. Duplicate event insert still proceeds to later reduction.                | [webhook:81-102,357-383,737-751](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L357). Late delivery can clear adverse evidence; scalar first-recipient state is not monotonic per-member truth.                                                                                                                                                           |
| Suppression                    | Core has a tenant-local consent check and stores provider suppressions. Its comment says Resend does not manage transactional suppression; event suppressed is labelled manual.                                             | [consent:1-35](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/consent.ts#L1); [webhook:357-365,712-733](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/email/webhooks/resend.ts#L357). Current provider docs contradict the comment. Receiving/requesting help is not authority to clear provider or owner suppression. |

Open PR **#1336** remains `OPEN` at `3b2827ffcf184bf767664018efedda317c7da03c`. Its file inventory includes a split of `packages/email/resend.ts` into sdk/send/errors/webhook modules and additional tests. Those unmerged files are proposed changes, not current source. Future implementation must reconcile that branch rather than duplicate a refactor, but its title/file list is not evidence that Phase6/17 integration is complete.

#### Refreshed official provider facts

These are documented API behaviors checked today, not exercised account facts. Earlier research snapshots remain history; the updated facts below supersede them where noted.

1. **Send fields and template distinction.** The [Send API](https://resend.com/docs/api-reference/emails/send-email) supports To/CC/BCC, headers and attachments. Its To field maximum is 50; attachment size is 40MB after Base64 encoding. Provider-template payloads cannot also contain HTML/text/React. These are limits/capabilities to qualify, not Asym's selected UI caps, a combined-recipient guarantee or a reason to move content authority to Resend.
2. **Thread identity.** [Reply-to-received mail guidance](https://resend.com/docs/dashboard/receiving/reply-to-emails) distinguishes provider `email_id` from RFC `message_id`; use the latter for In-Reply-To. The parent/header chain and frozen return route must be owner-derived. Core's unsent synthetic Support Message-ID is not proof of the real external Message-ID. Provider IDs and RFC Message-IDs must stay distinct in storage and lookup.
3. **Idempotency.** [Provider idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys) applies to send/batch requests for 24 hours and keys up to256 characters. Payload conflict and concurrent-in-progress are distinct responses. Its suggestion to omit/change a key after some errors does not override Core's permanent effect identity and no-blind-replay policy.
4. **Webhook transport.** [Webhooks](https://resend.com/docs/webhooks/introduction) are at-least-once and unordered; `svix-id` is the documented duplicate-delivery handle. [Verification](https://resend.com/docs/webhooks/verify-webhooks-requests) requires the raw body and endpoint signing secret. Correct signature verification does not decide the product tenant/member relationship or mean all secondary effects completed.
5. **Retry availability.** [Retries/replays](https://resend.com/docs/webhooks/retries-and-replays) provides delayed retries and manual replay of failed or succeeded deliveries, but disabled/removed endpoints stop attempts and repeated failure can auto-disable an endpoint. Therefore webhook-only permanent guarantees without durable local acceptance/reconciliation are unsound. Do not freeze one repeated schedule from conflicting overview/detail snippets as a product SLO.
6. **Rate scope refresh.** The current [quotas page](https://resend.com/docs/knowledge-base/account-quotas-and-limits) states **10 requests/second initially per team**, shared by keys/domains and no separate burst allowance. Earlier D1/D2 notes and Core's constant5 are stale references to the provider default. No account's actual negotiated limit was queried. Inbound/outbound and all recipients consume relevant quota; one conversation action is not necessarily one provider quota unit.
7. **Suppression scope refresh.** Current [suppression documentation](https://resend.com/docs/dashboard/emails/email-suppressions) states the entire team across domains/subdomains, including transactional mail, with bounce/complaint/manual origins. This supersedes earlier region wording. Removal does not guarantee delivery; Core must preserve provider evidence separately from donor consent or a Support work label.
8. **Group versus batch.** The [batch API](https://resend.com/docs/api-reference/emails/send-batch-emails) maps successful entries by request order and documents no attachment support. It is not the same operation as one visible To/CC group email. D2's group qualification remains necessary; do not send the whole audience once per member, or replace visible group continuity with unrelated private copies.
9. **Member outcome proof.** [Delivered](https://resend.com/docs/webhooks/emails/delivered), [bounced](https://resend.com/docs/webhooks/emails/bounced), and [retrieve](https://resend.com/docs/api-reference/emails/retrieve-email) expose IDs and recipient arrays, but examples alone do not establish every mixed CC outcome. A scalar last_event cannot prove every member delivered. Delivery denotes mailbox-server acceptance, not human reading or inbox placement.

#### Governing permanent path

Accepted [ADR0030](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0030-canonical-message-document-and-presentation-dependencies.md) makes structured Asym content authoritative, server compilation deterministic, and preview/test/review/publication/production share the compiler. A provider template ID, browser HTML or React code is not canonical content. D1 already qualifies human-authored Support replies through this preparation ownership; a normal human reply is not forced into a separately published system-template entry per message.

Accepted [ADR0032](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0032-immutable-prepared-message-and-whole-message-recovery.md) freezes semantic member identity, complete prepared content and exact connection/sender/return route before I/O. It distinguishes unprepared, definitely unsubmitted and possibly submitted work, permits only narrowly typed same-key follow-up calls within bounds, and removes replay/decrypt authority at defined deadlines. Batches use the same Phase6 queue. These are governing accepted decisions even where the corresponding OpenSpec remains proposed and runtime absent.

[Outbound intent:1023-1069](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L1023), [classifier/retry:1104-1205](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L1104), [provider correlation:1230-1247](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L1230) and [body-free history:1332-1378](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md#L1332) give the exact intended owner contracts. They are not descriptions of today's wrapper.

##### Proposed exact D4 integration clauses

**W1 — Preserve means no work mutation.** “Plain Send carries explicit preserve-work intent. Its reviewed local admission does not set status, cancel/reset a valid reminder, reassign work or write a fictitious lifecycle transition. It still appends the reply/admission and required communication references under the authoritative transaction. It never writes an old captured work status back over newer state. Relevant pre-admission conflicts follow D1/D3; later independent input/timer/adverse events remain free to create their correct causal transitions.”

**W2 — One admission, one owner dispatch.** “The Support command atomically admits exact actor/tenant/source-message/content/attachment/audience and preserve-or-explicit-post-work intent, required local history and Phase6 dispatch/communication intents. No browser Send-then-status sequence stands in for this transaction. After commit, workflow delivery and provider I/O run outside the database transaction. Loss of immediate handoff is repaired from existing product dispatch records; a Support row alone is not durable dispatch proof.”

**W3 — Actual governed preparation.** “Qualified Email Studio/Phase17 content and human-reply authoring use the same approved server content/safety compiler and presentation dependencies as their applicable contract. Source-owned variables, assets and protected actions remain bounded and current. The exact prepared HTML/text, attachments, audience and identity are immutable execution material. Ordinary ad-hoc Support text is permitted without creating a system-template publication per reply. Do not substitute the current admin test-send route or provider-template source as the production authority.”

**W4 — Shared adapter capability, not a new sender.** “Extend/reconcile the canonical versioned Resend adapter to accept only qualified prepared material, including admitted To/CC groups, governed return/thread headers and real authorized attachment bytes. Do not expose arbitrary browser From/Reply-To/header/account overrides. SDK `replyTo` is serialized to HTTP `reply_to`; maintain contract tests against the installed qualified version. Keep RFC message identity distinct from provider email identity and freeze correct parent References/In-Reply-To derived from the selected admitted message.”

**W5 — Durable immutable attempt and exact failure classes.** “Before external I/O seal the exact endpoint/account/credential/headers/bytes/member map and request idempotency key beneath permanent semantic identities. Use ADR0032's operation/status/type/context classifier and bounded retry rules, not substrings or an SDK boolean. Only the expressly allowlisted possibly-submitted classes and qualifying context permit identical same-key calls: at most two follow-up HTTP calls after the initial call, total per sealed envelope, within all provider and owner deadlines. Unknown/malformed success, missing provider ID, ambiguous network result, conflicting identity or missing mapping cannot become definite failure or successful delivery. Preserve indeterminate evidence; an allowlisted uncertainty may receive only its qualified follow-up, while every other uncertainty is reconciliation-only. Never rerender, rekey, split a sealed group or change the account to obtain a different answer.”

**W6 — Group evidence remains exact.** “D2's explicit group submission/member reconciliation is required. One approved native visible group may share a provider ID only through a proved owner mapping; each member retains its own authority, identity, outcome and history. Preserve common approved disclosure and actual mail-client group continuation. No full-group send per member, unqualified partial replay after sealing, synthetic all-delivered reduction or private-copy substitute. Provider group-event and suppression-member specificity remains an explicit qualification unknown; do not copy an aggregate event into every recipient's state without proved semantics. A qualified remaining-member recovery must preserve existing ADR0032 restrictions or obtain an explicit owner-contract amendment before activation.”

**W7 — Verify connection, deduplicate and reduce monotonically.** “The opaque webhook route selects one known connection revision and signing authority, verifies raw bytes, then attaches the event only to that owner submission/member mapping. Payload tenant IDs, tags, addresses or synthetic placeholders cannot select the owner. Retain provider delivery identity and durable business-effect identity; duplicate receipt may repair an unfinished reducer but cannot duplicate effects. Store before acknowledgment, preserve adverse evidence and apply the exact member set; late benign events cannot erase bounce/complaint/failure/uncertainty. Unknown events/fields remain safely reviewable contract drift.”

**W8 — Suppression, rate and identity remain owner facts.** “Evaluate current owner purpose/consent/contact/safety and provider suppression/readiness before eligible unsubmitted egress, using existing P6/P17 fences. A new inbound request, changing a work status or choosing Send does not clear suppression or manufacture a Party. Apply shared team/connection-scoped backpressure across receiving retrieval, tests and production traffic; use qualified actual limits and response headers, not old constants as account truth. Rotated credentials or disabled routes do not rewrite frozen attempts; preserve accepted work and surface recovery.”

**W9 — Separate evidence and readable records.** “Support's canonical conversation content, Phase6 body-free history, encrypted prepared retry material, limited recent-copy projections and provider logs have distinct purposes/retention/access. ADR0032's prepared-artifact classes retain their existing ceilings: required email 30 days and optional staff email 7 days; earlier erasure and applicable replay/decrypt deadlines still govern. These are not Support message-body/attachment retention classes and do not choose the unresolved Support retention policy. History keeps permitted source/member and transition references without becoming another body archive. Provider retention does not set Core retention. Copy/export/preview cannot supply retry bytes or bypass owner access, and logs/tags/errors do not carry freeform bodies, secrets, sensitive subjects or private CRM context.”

**W10 — Qualification closes the actual path.** “Before real inbox activation, prove the entire representative path from qualified content through Support admission, same-transaction preserve/explicit work action, Phase17 preparation, durable Phase6 dispatch, actual Resend serialization, signed reordered events and staff/CRM projections. Dependency failure is visible and recoverable. Test-send/compiler parity is required but not sufficient. Preserve previously admitted sends through deployment/migration and reconcile old send logs under explicit lineage; do not keep competing legacy writers.”

#### Concerns and disposition

All likelihoods are conditional engineering judgments, not measured incidents. High severity means lost/duplicate mail, wrong scope, false history or incorrect completion; Medium means substantial operational/maintenance fragility.

| ID  | What can fail, why it matters, evidence                                                                                                   | Severity / likelihood                                                         | Effect and permanent fix                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| F1  | “Actual Resend integration” is assumed from a queued Support row or existing test-send. Registry/source show no completed P6 path.        | High; certain if current row is promoted as complete                          | Accept D4, require W2/W3/W10 before activation.                                          |
| F2  | Plain Send clears reminder/status and counts queued first response in current bump.                                                       | High; deterministic existing path                                             | W1; genuine preserve-work no-op plus independent truthful message evidence.              |
| F3  | Core wrapper omits fields required by ratified group/thread/attachment behavior although SDK supports them.                               | High; deterministic if reused unchanged                                       | W4; extend existing qualified adapter, no second transport.                              |
| F4  | Provider IDs and local RFC IDs are conflated; Replies become unrelated messages or attach to wrong evidence.                              | High; direct current missing threading and ID fallback                        | W4/W7 with exact typed identities and qualification.                                     |
| F5  | Missing-ID success or generic failure becomes false sent/failed and encourages unsafe fresh retry.                                        | High; SDK probe confirms shapes; provider occurrence frequency unknown        | W5; closed indeterminate outcomes, frozen envelope and reconciliation.                   |
| F6  | Wrapper retries exceed/do not match accepted typed policy; process sleeps and SDK normalization hide attempt evidence.                    | High; conditional transient/error tuple                                       | W5; one P6 attempt authority and bounded durable follow-up.                              |
| F7  | Test-send allows post-I/O audit failure/random new keys; using it for Support loses permanent identity and accepted effects.              | High; conditional reuse of an admin test path                                 | W2/W3; same approved compiler, different qualified production admission.                 |
| F8  | Global signed endpoint plus payload tenant can misattribute trusted provider bytes to wrong owner.                                        | High; conditional crafted/misconfigured upstream metadata; no exploit claimed | W7 exact connection/submission owner, not metadata priority.                             |
| F9  | Only first recipient and scalar last-event update erase adverse or partial truth; failed events not handled.                              | High; normal grouped or reordered events                                      | W6/W7 per-member monotonic reducer and complete fixtures.                                |
| F10 | Duplicate event insert does not gate later secondary effects; source event dedupe is not complete effect repair.                          | High; at-least-once webhook/replay                                            | W7 idempotent reducer with durable completion/repair, use svix identity properly.        |
| F11 | Provider team-wide suppression or shared rate changes are treated as local inbox policy; stale comments/constants mislead implementation. | High for skipped/blocked mail; plausible traffic/consent changes              | W8, current qualification and distinct provider/owner facts; no automatic unsuppression. |
| F12 | Group mode versus batch/attachment limits are confused, producing duplicates, hidden recipients, lost files or unqualified partial retry. | High; deterministic naïve fanout/batch path                                   | W4/W6, actual native group qualification and exact capabilities.                         |
| F13 | Templates publish at provider or browser HTML is accepted as authority; preview differs from actual sent content.                         | High; conditional shortcut around ADR0030                                     | W3; same server compiler and immutable prepared material.                                |
| F14 | Provider logs/recent copies become permanent retry/CRM body archive, or logging tags leak sensitive context.                              | High; conditional retention/report reuse                                      | W9, separate purpose/access/retention and body-free durable history.                     |
| F15 | A worker outage, credential rotation or older deployment strands/replays accepted work.                                                   | High; routine operational changes                                             | W5/W8/W10; frozen attempts, shared recovery and fenced migration.                        |

#### Executed and proposed tests

**Executed SDK-only checks:** correct `replyTo` mapping; CC/threading/attachment contentType survives serialization; request key appears in HTTP headers; HTTP200 empty object gives error:null with no provider ID; thrown fetch becomes generic application_error with null status. All used invented fixture values and mocked fetch. Source claims about Core wrapper interpretation were inspected independently. No real mailbox, SDK network transport or provider outcome was tested.

Useful existing isolated suites: `tests/unit/packages/email/resend.test.ts` tests request serialization/idempotency/limits/backoff and mocked inbound helpers; `tests/unit/packages/api/email/webhooks-resend.test.ts` tests persistence/tenant resolution/replay; `tests/unit/packages/api/workflows/inbound-email-workflow.test.ts` tests durable inbound phases; `tests/unit/packages/api/email/template-test-send.test.ts` tests current admin test-send. Run through an isolated no-env-file Vitest config with provider fetch fully mocked and real network rejected. Passing today's tests may affirm old behavior that must change, including payload tenant priority; do not treat pass count as new-contract proof. This agent did not run those suites in D4.

Required outcome proof before activation:

| Group                | Positive, negative and boundary outcomes                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local admission      | Plain Send preserves work/reminder/assignee in all eligible states; explicit post-work alternative atomically records required local effects; crash before/after commit; stale review; duplicate identity/conflicting payload; retry after newer state does not overwrite it.                     |
| Compiler/material    | Same accepted structured source/variables/brand/assets yield the proved preview and sent HTML/text; body-free history differs from prepared material; malicious pasted HTML/links, private notes, stale assets and forbidden protected actions rejected.                                          |
| Actual SDK contract  | Exact installed version maps qualified fields; no browser account/header overrides; missing ID, malformed JSON, SDK generic error, typed 4xx/5xx/rate/quota/concurrent/conflict fixture preserved/classified appropriately.                                                                       |
| Durable attempts     | Lost immediate handoff repairs; crash during/after submission; same sealed bytes/key across permitted follow-up; limits/window/deadlines enforced; success/unknown never rekeyed or replayed as new; credential rotation leaves frozen identity intact.                                           |
| Native group mail    | Actual To/CC visibility and RFC threading in authorized test accounts; one intended copy each; mixed recipient outcomes; one shared provider ID correctly mapped; no attachment batch fallback that silently drops files; no successful-member resend.                                            |
| Webhook/evidence     | Valid raw signature accepted; changed payload/unknown connection rejected; metadata cannot change tenant; svix duplicate/replay repairs exactly missing effects; delivered-after-bounce cannot regress; email.failed/suppressed/nested bounce fields mapped; unproven member set remains unknown. |
| Suppression/capacity | Owner opt-out versus provider block distinct; unlinked requester qualifies without fake Party; all relevant team consumers share bounds; actual quota/429 headers handled; route-disable/retry-stop detected; affected work stays visible.                                                        |
| End-to-end surface   | Staff sees accepted/pending/retrying/unknown/adverse states honestly; D3 causal failure review and D2 stable draft hold; CRM interaction projection once per admitted recipient copy with no duplicate body/master; old snapshots cannot replace higher revisions.                                |
| Migration/recovery   | Current send logs and accepted attempts receive explicit lineage; old clients/wrappers/test-send cannot bypass qualified production path; old/new code coexistence and writer pause preserve custody/reconciliation; retention removes decrypt authority without losing minimal evidence.         |

#### Synthesis and required ordering

1. Record D4 preserve-work semantics; separate it from the accepted reply admission/transport and any later system-driven work change.
2. Reconcile D2 native-group requirements and current Core adapter with ADR0030/0032 and exact P6/P17 contracts. Define qualified human reply material and per-member mapping without moving authority to provider templates.
3. Establish the shared atomic local admission and durable prepared/dispatch/reducer path before wiring the button. Extend the canonical adapter to the required typed capability surface; reconcile PR1336 rather than create another SDK wrapper.
4. Qualify the actual controlled full journey, including signed reordered/partial events and actual mail-client group replies. Preserve production/inbox mutation boundaries during grooming: this report finishes the design review, not that deployment work.
5. Monitor only residual qualified operation: any wrong-owner/member attachment, duplicate external effect, missing accepted dispatch, state regression or unsafe retry is a one-occurrence invariant alert owned by P6/P17 messaging engineering/security as appropriate; fence the implicated writer, retain evidence, reconcile under original identity and prove regression before resuming. Quota/route-disabled/terminal-recovery signals belong to the messaging integration owner and authorized Support recovery queue, with exact operational thresholds chosen from qualified account/service policies rather than invented D4 SLOs.

The permanent solution remains one Support command, one approved content/preparation path, one shared delivery/evidence authority and one honest staff experience. Reusing the actual stack means completing and qualifying those owner seams, not assuming the present wrappers already satisfy their future contracts.

## Independent template and composer UX review

### D4 — Send reply, governed reusable content, and an ordinary email experience

Research and proposed amendments for the root review. Checked 10 September 2026. D4's selected answer is **A: Send reply preserves current work status**. This document does not claim the following details are already ratified, and is not a formal specification or implementation. D1–D3 remain authoritative.

#### Recommendation

Accept A with the amendments below. Staff should write or insert a saved reply in the existing Support composer, review the actual recipients and resolved content, and use the stable **Send reply** button. The adjacent menu offers explicitly named combined send actions. Email Studio supplies governed authoring, safe reusable content and approved presentation; Phase 17 prepares the bounded human reply; Phase 6 admits/dispatches and records each authorized recipient copy; tenant-owned Resend carries the resulting email. The donor receives a compact, useful email and can reply normally.

Do not require a staff trip through the full Email Studio page, publication workflow, template gallery or mandatory preview dialog for every human answer. Reusing a safe compiler is necessary; pretending a human message is a system-message catalog entry is not. Likewise, **a saved reply is text to edit, not a concealed workflow command**.

#### Core authority and actual source evidence

Repository probes executed in `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`, with `pwd` verified. File lines below describe observed source, not demonstrated production behavior. Root owns live HEAD/source refresh and final citation mapping.

| Evidence                                                                                                                                                                | Current or intended fact                                                                                                                                                                                                       | D4 consequence                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/adr/0030-canonical-message-document-and-presentation-dependencies.md:18–40`                                                                                       | Accepted: structured content is authoritative; server emits HTML/text; Brand Kit and Role Layout are complete immutable dependencies; Saved Sections copy into drafts.                                                         | Reuse this authority. Do not add a Support template renderer or live fragment graph.                                                                                                                                    |
| `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md:498`, manifest exclusions at893                                                           | Intended: human support bodies stay outside the system-message catalog.                                                                                                                                                        | “Use Email Studio templates” must not reverse D1's bounded human-reply branch. System notices remain separate meanings.                                                                                                 |
| Phase 17 PRD:314,739–768,906–934                                                                                                                                        | Intended structured contracts, preparation and many publication primitives are explicitly FORWARD; service layout is a compact transactional/operational wrapper including ordinary staff email; Saved Sections copy.          | Existing attractive screens are not proof these safeguards ship. Keep the Phase 17 readiness dependency explicit. No new “personal correspondence” Layout Role is needed.                                               |
| Phase 17 PRD:96–98,753–759,928; ADR-0032                                                                                                                                | Authoring previews use synthetic fixtures; deterministic server compilation and exact immutable preparation are intended.                                                                                                      | Distinguish a synthetic reusable-template preview from an authorized conversation-specific draft review. Never put real CRM data in shared template-authoring fixtures.                                                 |
| `docs/guides/features/email-studio.md:56–100`; `packages/ui/components/studio/EmailStudioEditor.tsx:28–44`                                                              | Current editor wrapper is React Email; template rows include design JSON, compiled output and subject/preheader; legacy Unlayer rows are read-only.                                                                            | Reuse sound editor/preview primitives, but do not elevate current cached browser export or legacy HTML to future send authority.                                                                                        |
| `apps/admin/app/(app)/email/page-client.tsx:753–806,1102–1124`                                                                                                          | Current “Open template” dialog reopens stored templates in the studio; preview exports the editor result.                                                                                                                      | This is an authoring picker, not a qualified Support saved-reply chooser or recipient-authorized preparation path.                                                                                                      |
| `.../support-hub/components/detail/composer/ConversationComposer.tsx:80–100,120–145,170–180`                                                                            | Reply mode has slash canned responses, note mode has mentions; macro launcher is rendered in both modes; a canned callback calls `composer.setValue(...)`, replacing the draft.                                                | Preserve structural mode separation; fix destructive insertion and scope action affordances. Never let private-note content become an external reply through a reusable item.                                           |
| `.../composer/extensions/canned-suggestion.ts:53–70`; `.../lib/merge-variables.ts:7–15,44–54,63–83`                                                                     | Current slash result replaces the trigger range; raw HTML/text goes through local string replacement. Unknown tokens remain; nulls become empty. Context calls every external sender “donor” and uses conversation name/email. | Preserve cursor insertion ergonomics but replace the ad hoc evaluation path with bounded typed, audience-authorized facts. Exact email does not prove identity or grant CRM access.                                     |
| `.../composer/serialize-payload.ts:45–85,110–121`                                                                                                                       | Current serializer does another merge pass after HTML building and parses non-JSON input as literal text.                                                                                                                      | Already-substituted data can be reevaluated, and the macro callback's HTML string does not itself prove a canonical editor document. One canonical typed serialization boundary is required.                            |
| `.../components/macros/RunMacroPopover.tsx:46–73,95–114`; `.../lib/macro-runner.ts:108–147,214–237`; `packages/api/src/admin/support-hub/mutations/run-macro.ts:48–105` | Current macro selection runs actions; client runner changes status and only inserts canned text; server runner skips canned insertion but can apply other actions. Skipped actions can still produce an overall success toast. | A macro that inserts an unsent answer and resolves work is a material trap. Do not reuse this path as a “template picker.” Do not claim the current server runner auto-sends—it explicitly does not.                    |
| `.../composer/use-conversation-composer.ts:107–112,192–220,237–253`; `ComposerActions.tsx:42–57,73–97`                                                                  | Local drafts reset on conversation change, send success toasts “Reply sent,” save-draft clears local state; button uses donor-only language and a Mac-only hint.                                                               | Desired persistent/context-preserving draft behavior is not proved by this hook. Truthful dispatch feedback and inclusive requester language are required.                                                              |
| `.../composer/use-composer-hotkeys.ts:23–28`                                                                                                                            | Ctrl/Cmd+Enter calls the primary handler without local composition/repeat/popup checks.                                                                                                                                        | The keyboard path needs the same validation and intent guard as clicking; insertion menus and IME must not accidentally send.                                                                                           |
| `packages/email/merge-tag-render.ts:105–165,168–189`                                                                                                                    | Existing Email Studio helper does reject unknown/missing tags at non-preview render and escapes by default.                                                                                                                    | Better than Support's separate helper, but this is still a current token renderer, not proof of Phase 17's typed ownership/allow-list/preparation model. Reuse sound primitives while completing the intended boundary. |

Here `.../support-hub` means `apps/admin/features/support-hub`; other shortened composer/lib paths are under that same feature. No runtime or live-email test was run for this bounded review.

#### What the strongest current products actually do

These are official documented behaviors, not claims about vendor internals or empirical Asym outcomes. Source retrieval is current; some help centers do not identify an edition. No plan gate is inferred where the page only links pricing. Numeric limits below are vendor qualifications, **not proposed Asym limits**.

| Product and date/scope                                                                                                                                                                                                                                                                                                     | Relevant verified behavior                                                                                                                                                                                                                                                                                                                                                                                | Adopt, simplify, or reject for Asym                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Front**, [message templates](https://help.front.com/en/articles/2230), 7 Aug 2026, all plans                                                                                                                                                                                                                             | Searchable composer insertion, editable before send, optional preview and slash entry. Templates have individual/shared inbox availability. Optional template subject overwrites the current subject; templates do not carry a From address.                                                                                                                                                              | Adopt quick searchable insertion and visible permission scope. Keep reply subject/threading and From independent. Do not copy a subject-changing side effect into “Insert saved reply.”                                                              |
| **Help Scout**, [saved replies](https://docs.helpscout.com/article/18-create-saved-replies-for-fast-answers), 3 Sep 2026; [variables](https://docs.helpscout.com/article/468-work-with-variables), 13 May 2026                                                                                                             | Reusable replies live in inbox settings. Variable choices have defined locations, and optional values can have a fallback, such as a neutral greeting when a name is absent.                                                                                                                                                                                                                              | Adopt defined fields and harmless explicit missing-data treatment. Do not require an unknown sender to become a CRM contact just to write a greeting. Do not infer all-plan access or measured click savings from these pages.                       |
| **Zendesk Support**, [using macros](https://support.zendesk.com/hc/en-us/articles/4408887656602-Using-macros-to-update-tickets), indexed edit 4 Sep 2026; Agent Workspace for slash shortcuts                                                                                                                              | Macro preview shows text, fields and attachments; text is editable before submitting. Multiple macros can conflict; stale ticket data can block applying; role permissions can prevent actions. [Placeholder documentation](https://support.zendesk.com/hc/en-us/articles/4408887218330-Using-placeholders) warns evaluation can occur when a macro is applied and is not automatically repeated on save. | Adopt preview of actual effects and stale-data protection. Simplify ordinary reuse to content-only. Do not make staff learn escaping rules or infer a later reevaluation of copied facts.                                                            |
| **Zoho Desk**, [using email templates](https://help.zoho.com/portal/en/kb/desk/customization/templates/articles/using-ticket-and-email-templates-in-a-ticket-in-zoho-desk), undated; [management](https://help.zoho.com/portal/en/kb/desk/customization/templates/articles/creating-and-managing-email-templates), undated | Reply editor exposes a template control. Management documentation describes department/module-scoped templates, send-time placeholder replacement and preview. Customizing is paid-plan and permission gated; Free uses system-defined templates.                                                                                                                                                         | Adopt contextual access and reviewable content. Keep Asym staff in the conversation. Do not copy Zoho's broad module field or raw HTML choices over Core's narrower typed facts.                                                                     |
| **HubSpot**, [templates](https://knowledge.hubspot.com/templates/create-and-send-templates), 2 Feb 2026; [snippets](https://knowledge.hubspot.com/conversations/use-snippets), 2 Jun 2026                                                                                                                                  | Reusable whole emails and shorter reusable blocks are distinct; both can be used near CRM work. The mobile keyboard exposes only owned snippets and up to100; snippet limit2500 is documented with a double-byte-language qualification.                                                                                                                                                                  | Adopt reusable blocks near current work, not a second CRM or duplicated template store. Verify supported mobile parity instead of assuming desktop behavior. Do not import commercial limits or word “customer” as an Asym identity type.            |
| **HubSpot**, [personalization](https://knowledge.hubspot.com/conversations/how-do-i-add-personalization-tokens-to-a-template-or-snippet), 15 Oct 2025, all products/plans                                                                                                                                                  | Multiple associations can select unexpected data. Entering a property-token value can write back to a blank CRM field. A one-time placeholder avoids writeback but can still send unfilled literal placeholder text.                                                                                                                                                                                      | Reject all three hazards: exact selected source context; read-only insertion; unresolved structured inputs block send. A helpful empty-field prompt is not authority to edit CRM.                                                                    |
| **Kustomer**, [custom email templates](https://help.kustomer.com/en_us/custom-email-templates-r1DrjNITb), May2026; [create template](https://help.kustomer.com/en_us/create-an-email-template-H1EbPTerC), Jul2026; plan not specified                                                                                      | Reply presentation has organization/email-alias defaults and a per-reply selection. It does not remember the prior selected template in the conversation. Visual template authoring includes web/mobile preview; up to50 custom templates is documented.                                                                                                                                                  | Strong evidence that presentation framing and reusable answer text are separable. Use Core's existing whole dependency resolver, not Kustomer's new hierarchy, raw HTML or its numeric ceiling.                                                      |
| **Kustomer**, [shortcuts](https://help.kustomer.com/en_us/use-shortcuts-BymTcNSU), Jul2026, plan not specified                                                                                                                                                                                                             | Shortcuts can carry text and actions. Actions execute on insertion even if never sent; the page specifically warns that Done plus a created message can close without sending. Default shortcuts can execute as soon as Reply opens.                                                                                                                                                                      | Reject action-bearing default insertion. Content insertion must leave work untouched. A separately explicit command can change work only through D3's authoritative boundary. This is a documented caution, not an inferred architecture.            |
| **Freshdesk**, [canned responses](https://support.freshdesk.com/support/solutions/articles/37577), 16 Jul 2026, Freshdesk and listed Omni plans; pre-Dec2025 Omni may differ                                                                                                                                               | Search/preview is available from a response panel. **Insert** adds below existing draft content; **Replace** overwrites the body. Shortcodes also insert; Send is separate. Visibility can be personal/all agents/group.                                                                                                                                                                                  | Adopt a nondestructive insertion default and explicit replacement. Core's existing slash entry can insert at the caret instead of always appending; that is our product judgment. Do not port a full panel or folder tree unless volume warrants it. |

For D4 sending controls, the already-researched [Q4 evidence](phase26-q4-evidence.md) remains applicable: Zendesk provides submit-with-current-status, Front Send means Open rather than preserve-any-status, Help Scout uses an inbox default status plus per-reply override, and Zoho's send/status coupling has a documented partial-success exception. There is no universal help-desk default established by those sources.

Kustomer direct article opening returned an empty extraction; official indexed article text and official category text corroborated the cited behavior. Its edition availability was not established. HubSpot indexed variants can expose older snippet limits; the clean canonical page retrieved here says3 free/5000 paid with seat restrictions. Those commercial counts do not affect the recommendation.

No comparable vendor can prove the proposed Asym design is effortless. No Asym staff/donor usability study, support-message mix, actual vendor account, render inbox, or assistive-technology session was exercised. Existing public user complaints are useful hypotheses but too weak to establish frequency or choose this default; the material conclusions here rely on governing Core decisions and documented mechanisms.

#### Precise proposed workflow

##### 1. Compose an ordinary reply in place

Keep the actual conversation, permission-filtered CRM context, D2 audience row, and D3 status in their current surfaces. Do not show “donor” where the requester may be staff, a missionary or an organization. Reply and Internal note remain visibly and structurally separate, with separate drafts. No mandatory donor account, portal redirect, registration message or progress-status email is introduced.

The staff composer shows the governed reply body, permitted inline information and a compact signature treatment. One quiet **Saved replies** toolbar entry opens a searchable list; `/` is an optional accelerator, not the only access. A result has a useful title, short content preview and an accessible full-preview control. Activate **Insert [name]** to copy safe content into the current insertion point, restore caret/focus, and preserve surrounding text. An optional explicit **Replace reply** action is separate and undoable as an editor operation. Selecting, inspecting or inserting never sends and never changes work status, reminder, assignment, subject, recipients, CRM or owner records.

Use Phase17 Saved Sections/structured reusable-content capabilities behind this staff terminology rather than a parallel Support template source. The exact storage representation can be decided in design; the invariant is one canonical owned content source and copy semantics. Existing drafts are not silently rewritten when a saved source is changed. Shared content must contain reusable copy and approved typed placeholders, not an accidentally captured donor's personalized facts or links. Do not make “save this real reply as a shared template” a one-click unreviewed action.

##### 2. Keep presentation distinct from answer text

Resolve a permitted compact Service message presentation through Email Studio's qualified dependency path. Show its human name in preview/details only when useful; do not require staff to select a frame every time. Selecting saved text does not select another From identity, Reply-To route, layout, subject, public/private mode or work action.

Do not introduce per-agent, team, inbox, conversation and per-message layout hierarchies here. If a per-message alternative is already permitted by the owning contract, it must be explicitly chosen and reviewed with the same audience, body, signature, safe links and attachments. A changed dependency never rewrites an already-prepared artifact. A new immutable composition may be reviewed when a pre-send dependency changes; there is no silent re-render after approval.

One authority owns each signature/footer element; avoid a signature in the saved answer, another in the composer and another in the layout. Preserve tenant/person sender clarity without forcing a large brand banner above the actual answer. A decorative image must not carry the only useful information.

##### 3. Insert only permitted information

Use indivisible typed information nodes, with the source and missing-value behavior defined by the human-reply profile. Resolve exact authorized context; never “latest gift,” first associated person, all related records or matching email as an authority shortcut. The staff member's permission to read a fact does not automatically permit sending it to every To/CC endpoint. Group replies require disclosure eligibility for the actual complete audience. Do not personalize a common group body differently for each recipient without an explicitly qualified product contract and coherent preview.

For a harmless absent greeting name, permit the declared neutral fallback or let the agent write ordinary text; do not require CRM cleanup. Required/protected/unavailable facts have a clear inline blocker and source-owned next action. Filling ordinary one-message text does not update CRM. Protected facts and consequential actions remain owner-controlled. An internal finance/member-care note is not a reusable public information source.

Unknown or unresolved structural variable nodes block dispatch. Do not use a broad regex to treat every ordinary quoted brace/bracket string as executable template syntax. Untrusted field values are data, are escaped for their output context, and are never parsed a second time as markup or variable instructions. Any material re-resolution or authorization change invalidates the prior send review; preserve permitted author work and explain the changed item without exposing newly forbidden data.

##### 4. Review without imposing a ceremonial confirmation on every email

The composing view is the ordinary review surface: exact sender/To/CC, canonical body with resolved permitted values, attachments and the chosen action are understandable before Send. **Preview email** is available on demand for the complete compact frame, signature, links and HTML/text output, with a narrow-screen option. It is not a fabricated delivery or email-client-compatibility guarantee.

Reusable-template authoring previews in Email Studio stay synthetic. Conversation-specific review uses only the current actor's and complete audience's authorized projection within Support, under the same content custody and retention rules as the draft. Do not import real donor records into the shared studio preview picker to make it convenient.

Before admission, the server validates the exact reviewed draft/content revision, dependencies, audience, action, source authority and D1 collision fence. An unchanged qualified ordinary reply needs no additional modal. If the server would produce materially different content/identity/audience, it sends nothing and returns a concrete **Review changes** state. Reconfirmation applies to that changed candidate, not a generic disclaimer.

##### 5. Stable primary send; explicit alternatives are immediate commands

Use the stable main button **Send reply** and adjacent **More send options** menu. The menu contains fully named commands such as **Send and set Open**, **Send and wait for requester**, **Send and wait on our side**, and **Send and resolve**. These are immediate submit commands after the same validation as primary Send, **not selections that invisibly stage a different default for the next click**. Opening, hovering, focusing, escaping or closing the menu does nothing. No last-used memory and no new personal Send-workflow preference are implied by D2.

Plain Send expresses **no work transition**. It does not write an old captured status value back to the conversation, clear a valid reminder, or create an Open/Resolved episode. Explicit Send and set Open carries D3's Open effect, including clearing deferral. Combined actions require eligibility for their named D3 work effect. Known failure of either intended local component admits neither; never silently downgrade a requested combination into Send-only or apply its work effect while preserving an unsent draft as though the answer reached the requester.

Ctrl/Cmd+Enter invokes the visible primary action only and has platform-correct visible/accessibility help. Enter inside a picker selects/inserts that picker item, and Enter in body text makes a line break. IME composition, key repeat, open nested selectors and in-flight admission cannot produce an extra send. When a combo item has focus, its own explicit activation submits that named command. Internal note mode has **Add note**, never Send and resolve email semantics.

Admission success is distinct from delivery success. Show the known state—such as reply queued—while message-level delivery evidence updates independently. Group partial failure identifies the affected recipient(s) only for authorized viewers. A late provider failure uses D3's causal Open-review rules. Reconcile an unknown outcome; do not invite another press of Send that creates a duplicate. A replay returns the original operation receipt without overwriting a newer work state.

##### 6. Keep the staff's place and the donor's answer usable

Successful admission and work changes retain the selected conversation and safe context; no automatic jump to another ticket. Filtering/counts remain accurate under D3. A saved reply does not erase a composed paragraph. Closing the picker, opening permitted owner context and returning, mobile keyboard changes, and a failed request retain the appropriate draft and selection. Access revocation removes forbidden context instead of exposing a cached draft; do not promise deletion from someone's memory or screen capture.

Reuse `@asym/ui`, its semantic tokens and Base UI interactions. Use accessible menu/combobox semantics, named preview buttons, sensible Escape/focus return and a live announcement for insertion/validation/outcome. No hover-only prerequisite. Core already supplies44px coarse-pointer minima; actual mobile layout must be checked rather than inferring dimensions from a local `h-8` class. At narrow widths use an appropriately sized existing sheet/dialog pattern without horizontal scrolling or a sticky action bar covering text/IME/focus. Avoid full desktop sidebar duplication on a phone.

Rendered messages use the same safe compiler for HTML and plain text, logical text order, meaningful link labels, useful images-blocked output, appropriate direction/language, and long-value wrapping. Test the pinned supported email-client matrix with real produced artifacts: browser iframe preview alone cannot prove Gmail/Outlook/Apple Mail rendering. No exact universal clipping threshold, supported-client version list or latency SLA is invented here; design/release proof must name the actual supported matrix and size limits.

#### Material concerns and exact required prevention

Likelihood is qualitative reasoning conditional on carrying the current code/pattern forward, not measured incidence. Severity describes credible impact within this bounded decision.

| Concern                                                   | What could go wrong / why it matters                                                                                                                                     | Severity; likelihood; evidence                                                                                                                    | Effect on A and exact amendment                                                                                                                                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01 — “template” conflates three authorities              | Every reply requires a system publication, or arbitrary template HTML bypasses the governed path. More friction or unsafe send authority results.                        | High; likely with an unqualified “use Email Studio templates.” ADR0030, Phase17:498 and current studio guide.                                     | **Amends implementation meaning, preserves A.** “Human reply content remains outside catalog truth; reuse qualified structured authoring, copied Saved Sections, approved presentation and preparation. No direct provider-template or browser-HTML authority.” |
| C02 — insertion mutates work                              | Staff chooses a helpful response; work resolves or moves before the message is even sent. Current client/server macro semantics differ.                                  | High; likely if macro picker is reused unchanged. Core runner evidence; Kustomer documented immediate effects.                                    | **Required before rollout.** “Saved-reply insertion is content-only. Any macro containing state/assignment/reminder actions is visibly separate and cannot execute through insertion or on opening Reply. Reconcile one command vocabulary with Phase34.”       |
| C03 — draft replacement and inconsistent document formats | A saved answer overwrites a careful draft, or raw HTML appears as literal content until another editor change occurs.                                                    | Medium; likely given `setValue(html)` and serializer fallback; production effect untested.                                                        | “Default insertion copies canonical safe content at the caret; replacement is explicitly named and undoable. Persist/review/send one canonical draft representation.”                                                                                           |
| C04 — wrong or forbidden variable value                   | A shared mailbox, multiple CRM associations or a newly added CC gets another person's personal data.                                                                     | High; plausible. D1/D2 boundaries; HubSpot documents association ambiguity; Core local donor-context helper.                                      | “Each typed fact binds the exact owner context and is separately authorized for the actor and complete recipient audience. Email matching, assignment and template access never confer disclosure permission.”                                                  |
| C05 — blank, stale or executable substitution             | Blank names make broken copy; stale financial facts mislead; a value containing markup/tokens changes output during the second pass.                                     | High for protected data; likely if current helper is carried forward. Core two-pass helper; Phase17 typed contract; Zendesk timing documentation. | “Missing behavior is declared per typed fact. Required/protected inputs fail closed; harmless neutral fallbacks are explicit. Resolve data once per reviewed candidate with context escaping; material changes require renewed review.”                         |
| C06 — template fill becomes a CRM edit                    | Staff fills a one-off greeting or requested detail and accidentally changes authoritative CRM.                                                                           | High; plausible external pattern, not observed Core behavior. HubSpot documented writeback.                                                       | “Composition and filling one-message text are read-only with respect to CRM. Contact/giving changes use an explicit owner-authorized command and history.”                                                                                                      |
| C07 — quiet subject/recipient/frame drift                 | Saved content changes subject/From, re-adds CC, or a mutable signature/layout changes after approval. Donor sees a wrong thread or unexpected disclosure.                | High; plausible. Front subject overwrite, current signature assembly, ADR0032 pins, D2.                                                           | “Content insertion preserves transport/thread/audience/work fields. Send binds reviewed subject, sender/reply identity, permitted body, assets and dependency revisions; no hidden changes after approval.”                                                     |
| C08 — review ceremony or inaccessible controls            | Full studio launch/mandatory modal for every reply slows routine work; icon/hover-only menus exclude keyboard/touch users.                                               | Medium; likely if studio UI is embedded wholesale. Source studio/composer split and Core accessibility standards.                                 | “Keep writing/inserting/sending in Support. One discoverable saved-reply entry, optional preview, explicit blockers only; use shared accessible primitives and retain focus/draft.”                                                                             |
| C09 — shortcut submits the wrong operation                | Modifier+Enter bypasses disabled UI, sends during composition/picker use, or repeats the last combo action.                                                              | High for accidental external reply; plausible. Current hotkey source.                                                                             | “All activation paths share one validated admission guard. Shortcut invokes the stable primary action; ignore composing/repeat/in-flight events and subordinate picker interactions.”                                                                           |
| C10 — coupled send degrades partially                     | Message goes out while intended Resolve was rejected, or work resolves while nothing was admitted. A retry mails twice.                                                  | High; plausible without unified command. Current macro action sequence; prior Q4 Zoho evidence.                                                   | “Admit approved local reply+named work effect together or reject both. Provider delivery is separate; retry/reconcile by the original durable intent, never by resending to repair status.”                                                                     |
| C11 — preview leaks or overclaims                         | Shared studio preview exposes real donor/care information; staff trusts a browser preview as every recipient's actual email rendering.                                   | High disclosure / Medium UX; plausible. Phase17 synthetic and client-proof requirements.                                                          | “Studio previews are synthetic. Support-specific review is permission- and audience-bound. Client compatibility requires named rendered-artifact fixtures, not screenshots of an iframe alone.”                                                                 |
| C12 — inaccurate labels and completion evidence           | “Send to donor” excludes legitimate requesters; “Reply sent” means only accepted API mutation; template default changes make everyone think status/owner task completed. | Medium; likely if current wording survives. Current ComposerActions and success toast; D3 separate facts.                                         | “Use requester-neutral Send reply; report admission/delivery truth separately; preserve current work on plain send, and never infer owner business completion.”                                                                                                 |

No separate new AI, portal, knowledge-base, template-marketplace, custom workflow-builder, CRM synchronization or approval-quorum feature is necessary to solve D4. Introducing them would be overengineering rather than a remedy for these concerns.

#### Acceptance scenarios that actually prove the proposed experience

1. **Routine progress update:** With Waiting on our side and a valid shared reminder, insert text, personalize ordinary wording and Send reply. The approved audience/content is admitted once; wait and reminder remain unchanged. Eventual failure can independently create Open review under D3; this does not mean Send itself changed status.
2. **Question and final answer:** Explicit Send and wait for requester or Send and resolve performs its eligible D3 effect and reply admission together. A known blocked resolve admits neither. The root's admission/delivery model must prove remote failure and concurrency separately.
3. **Nondestructive reuse:** In a two-paragraph draft, insert between paragraphs via toolbar and slash. Original text survives; Undo removes only the insertion. Replace requires the expressly named action. Changing the saved source never rewrites that draft.
4. **Unknown and ambiguous requester:** An unlinked sender can receive a normal human reply with a neutral greeting. No Party is created and no hidden association is chosen. Adding CC forces re-evaluation of disclosure eligibility without substituting historical recipients.
5. **Variable safety:** Null optional greeting uses its approved fallback; required unavailable fact blocks with a useful next action. `<`, quotes, URL controls, bidi names and literal template-looking content are data. A resolved field containing another token is not reevaluated. Inaccessible source values never appear in DOM/network/preview/logs.
6. **Staleness:** A changed recipient, source permission, relevant conversation revision or material prepared content blocks the prior approval and preserves only still-authorized draft content. Reopening a saved draft never silently refreshes its wording or sends the old recipient set. A newer ordinary saved-section version alone does not rewrite copied text.
7. **Protected owner action:** Staff inspects permitted receipt/giving context and returns to the same support draft. No template edit updates CRM or processes a refund. Official artifact correction and protected disclosures require the owner's qualified flow; Support completion does not certify that result.
8. **Keyboard and mobile:** Keyboard and screen-reader users find saved replies, preview, insert, escape and return to their caret. Ctrl/Cmd+Enter performs Send reply only. IME selection, holding the shortcut, slow network and an open picker never add a duplicate send. Mobile keyboard does not obscure recipients/action/focus.
9. **Private note isolation:** Inserted public content does not silently flip modes; internal note/mention context never enters outgoing mail, shared saved replies, a transcript template or provider input. Add note cannot use the email send menu.
10. **Delivery truth:** Accepted-but-unconfirmed provider outcomes show a bounded reconciliation state, not another Send button that creates a duplicate. Mixed recipient outcomes are truthful; replay receipts do not regress current work. “Undo” editing is not mail recall.
11. **Output fidelity:** Actual prepared HTML and text fixtures include long names, long URLs, long translations/RTL, no images, dark/light modes, narrow screen, useful link text, permitted signature and attachments. Neither layout nor content is clipped/hidden to create a false complete answer. The supported client/version matrix is recorded as release evidence.
12. **Source and permission changes:** Template/picker access is re-proved server-side on use, not only filtered in UI. Tenant switch, conversation transfer, permission revocation and missing/retired content cannot use stale cross-context caches. Copied human text and template provenance remain distinct from a live source dependency.

These are proposed outcome tests, not claims they pass today. Root should fold them into D4's traceability and rollout proof, retaining the existing D1–D3 transport/privacy/retention safeguards. Do not make a new end-user policy or guessed latency threshold to satisfy a research checklist.

#### Synthesis

Before recording the amended decision, settle the wording that **Send reply performs no work transition**, the distinction between copied answer content and governed presentation, and the immediate-command send menu. Capture typed fact disclosure, immutable review/preparation, nondestructive insertion and source-owned business actions as required design boundaries. During implementation, consolidate the divergent canned/macro paths, qualify Phase17/Phase6 transport preparation, and prove the above interaction/authorization/concurrency cases before real-domain activation.

The permanent path is a familiar reply composer backed by the existing Core owners. The mature-product lesson is fast content reuse with visible consequences—not copying every vendor's automation, template programming language or workflow side effect.

## Supplemental feedback and donor-care evidence

### D4 — Bounded feedback and donor-care evidence supplement

Checked 10 September 2026. Three directly relevant sources; research only. These strengthen the existing D4 safeguards and do not introduce a new product feature, change the selected Send reply default, or establish measured Asym staff behavior.

#### 1. Reported friction: visible placeholder text is not a send guard

**Source:** [HubSpot Community — Make Custom Placeholders work in standard emails via templates](https://community.hubspot.com/t/make-custom-placeholders-work-in-standard-emails-via-templates/19399).

**Date and scope:** Original report by `scubes13`, 12 March 2020; corroborating requests dated 15 December 2020 and 10 June 2021. The thread concerns HubSpot standard email templates and sequences, not a verified current Service Hub Help Desk build. Exact subscription/build was not independently established. A participant's quoted support response is second-hand, not an authenticated current vendor ruling.

**Reported experience:** The author describes a template inserting conspicuous missing-placeholder text while still allowing a standard email to be sent. Later replies request prevention of sending without completing the value; one describes the vigilance needed to avoid that mistake. These are reports of friction and exposure to error, not evidence that a donor received a bad email or a quantified failure rate.

**D4 relevance:** Supports the narrow test that a clearly marked unresolved input must still block the actual send path. Highlighting and relying on staff diligence is insufficient. It does not justify a mandatory confirmation dialog for every normal reply.

#### 2. Current documented behavior that corroborates the mechanism

**Source:** [HubSpot Knowledge Base — Add personalization tokens to a template or snippet](https://knowledge.hubspot.com/conversations/how-do-i-add-personalization-tokens-to-a-template-or-snippet).

**Date and scope:** Updated 15 October 2025, freshly retrieved. Article lists all products/plans and concerns sales-email templates/snippets; placeholder tokens are specific to sales-email templates. Do not turn this into a universal claim about every HubSpot editor.

**Verified documentation:** The page explicitly says an unfilled placeholder can still be sent and appear as placeholder text. It also distinguishes one-message placeholders, which do not update CRM properties, from property tokens that can write a supplied value back to an empty CRM field. Its multi-association warning remains relevant to exact source selection.

**D4 relevance:** This corroborates the reported failure mechanism without treating a six-year-old community report as current product proof. Asym should reject unresolved structural placeholders at server admission and keep one-message authoring read-only toward CRM. Those are Core product judgments, not claims that HubSpot has the same architecture or permissions.

#### 3. Nonprofit CRM: donor communication has deliberate business context

**Source:** [Bloomerang CRM — Add and Acknowledge New Donations at the Same Time](https://help.bloomerang.com/en/articles/12632499-add-and-acknowledge-new-donations-at-the-same-time).

**Date and scope:** 6 August 2026, freshly retrieved; specifically Bloomerang **CRM**, Fundraising → Donations & Pledges. Edition availability is not stated. This is an acknowledgment workflow, not proof of legal receipt issuance or donor-authentication policy.

**Verified documentation:** During donation entry, staff separately choose whether to acknowledge now and select an email/letter when applicable; the immediate acknowledgment choice defaults to No. Saving creates a constituent-timeline interaction with access to the generated correspondence. The article warns against manually sending an acknowledgment when Journey Automation already does so and distinguishes online payment confirmation receipts from acknowledgments.

**D4 relevance:** Demonstrates a real donor-management intersection: deliberate business communication selection, related timeline evidence and avoiding duplicate correspondence. Adopt coherent context and a single authoritative effect. Do not copy a generic Support “thank you” template into donation acknowledgment/receipt truth, claim a refund completed, or write another CRM interaction for an existing Phase6 communication. The page does not prove Bloomerang's internal authorization, transaction or idempotency design; Core's owning-domain contracts remain the authority for those safeguards.

#### Exact synthesis for the review

These sources reinforce three existing requirements:

1. **“Unknown or disallowed structural fields/nodes and missing required values block admission; declared harmless optional fallbacks remain valid. Visible placeholder warnings cannot replace the server gate.”**
2. **“Filling ordinary one-message content does not update CRM. A consequential CRM/giving/receipt/acknowledgment action requires the owning domain's explicit qualified command and history.”**
3. **“Support and CRM show the same canonical communication evidence where authorized. Selecting reusable wording or resolving Support work neither creates a second acknowledgment nor proves that an owner business action occurred.”**

No Asym usability study, actual donor-care incident, prevalence estimate, provider operation or vendor runtime exercise was performed. The historical feedback establishes a credible usability hypothesis; the current official article establishes the relevant supported behavior; the nonprofit documentation supplies a concrete adjacent workflow. Together they strengthen the bounded solution without broadening Phase26 into a CRM or fundraising product.

## Proof boundary

Completed: source/contract/provider research, independent adversarial reviews and correction pass, eight current-source helper checks, three mocked installed-SDK calls, complete23-category analysis, exact17clauses,18acceptance groups and the concrete execution/UX blueprint. Documentation links, formatting, statuses and output/canonical mirrors are validated separately by the record checker.

Not claimed: a deployed RLS scan, database transaction/concurrency proof, browser usability study, actual Resend group-member qualification, rendered mailbox-client compatibility, production sending or a completed Phase6/17 runtime. Those are explicit implementation/activation gates, not substitutes for the finished grooming analysis. No env secrets were read/printed/copied, no real message/provider setting/DNS/GitHub state changed, and no implementation/PRD/issues were created.
