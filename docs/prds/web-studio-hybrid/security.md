Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-security"></a>

# Security, authorization and permissions

<a id="web-h-principals-and-responsibility"></a>

## Principals and responsibility

Content editor, visual composer, design publisher, repository manager and developer are task personas, not new fixed role names. Existing Phase 12 capabilities decide each operation. A person may hold several capabilities; a role label, support assignment, GitHub membership or component ownership proves none by itself. A GitHub identity used to install/connect an App does not create a second Asym login.

Proposed capability labels below are design references only. Reuse/map exact existing capabilities at adoption before adding new names. Never make frontend checks the authority.

| Operation                     | Required current authorization                            | Additional boundary                                                 |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| Read Page and versions        | Exact Site/locale/resource read and relevant safety floor | History/field visibility independently enforced                     |
| Edit content                  | Resource content-edit                                     | D12 session lease, expected revision and valid structure            |
| Change composition            | Content edit plus approved composition permission         | Grammar/slot/family restrictions on server                          |
| Change Site design settings   | Existing Site appearance capability                       | Separate axis, exact setting schema, affected cohort                |
| Take over editing             | Distinct current takeover capability                      | Pre-takeover checkpoint and new fence                               |
| Preview                       | Relevant candidate source read and preview capability     | Every request authorized; no bearer-ID access                       |
| Publish content               | Existing publication policy and capability                | D1 exact selection/current safety; no blanket added manual approval |
| Schedule                      | Existing D13 appointment capability                       | Organization authorization, exact revision/time                     |
| Connect/rebind source         | Integration-management capability for exact project       | Verified provider installation/repository relationship              |
| Request source build          | Project source/build permission                           | Quota, current binding and approved profile                         |
| Admit executable code         | Platform-owned independent qualification authority        | Not granted by ministry repository admin status                     |
| Activate Site design          | Existing D10 design-release capability                    | Admitted artifact, fixed cohort, exact expected heads               |
| Read build diagnostics        | Relevant project/evidence read                            | Redacted/minimized; archive paths and signed URLs not grants        |
| Delete source connection      | Connection management                                     | Fence new source intake; no content/artifact cascade                |
| Export/replace source or data | Existing export/custody permission and rights policy      | No restricted-data export inferred from source ownership            |

Capabilities may be delegated through the existing owner. Do not introduce a separate GitHub-driven tenant permission system. Developer access to source is controlled at the ministry's repository; developer access to Asym content is a distinct grant. Removing one does not falsely claim the other was revoked. Previously disclosed source/content cannot be recalled remotely.

<a id="web-h-trust-zones"></a>

## Trust zones

1. **Trusted product:** Asym UI/global controls, server operations, Supabase identity/Phase 12, CMS-private adapters, release records. Holds product authority.
2. **Trusted source intake:** Fetches only selected authorized source with a narrowed short-lived provider token; validates archive boundaries; strips secrets before handoff.
3. **Untrusted execution:** Source builds, dependency scripts, local/remote development previews and unadmitted code. No production data, permanent provider key, database token or publish permission.
4. **Qualified authoring display:** Isolated composer origin receiving minimal authorized content and admitted first-party components. It may propose edits but cannot commit or publish independently.
5. **Admitted public presentation:** Reviewed first-party renderer over exact safe serialized inputs and capability islands. Admission is explicit trust; it is not arbitrary tenant-code isolation.
6. **Artifact custody:** Immutable byte identity and current access/retention evidence. An object path/digest does not grant download or publication access.

No crossing is authorized by being in the same Tenant alone. Every bridge, callback, cache and worker rechecks its exact purpose/scope. Do not give public presentation a direct connection to operational tables. Operational capabilities preserve their own authorization and durable receipts.

<a id="web-h-mandatory-threat-controls"></a>

## Mandatory threat controls

| Threat                                         | Prevention and required proof                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Forged GitHub setup/installation               | One-time scoped state, provider authorization verification, current Asym capability; forged callback cannot bind                           |
| Repository transfer/confused deputy            | Stable provider identity, current owner evidence, binding epoch and re-verification; no cross-Tenant reuse                                 |
| Hostile source/archive                         | Reject traversal, symlink escapes, expansion bombs and unsupported submodule/LFS fetches; resource ceilings                                |
| Dependency or postinstall abuse                | Controlled dependency acquisition, no production credentials, isolated runtime, restricted egress, immutable toolchain profile             |
| Poisoned build cache                           | Trust/profile namespace and integrity verification; no customer cache can satisfy independent approval evidence                            |
| Forged green CI/self-certification             | Platform-controlled admission tests and evidence outside submitted source; digest ties verdict to artifact                                 |
| Malicious renderer/CSS/JS                      | Pre-admission isolation; no raw HTML/scripts or arbitrary origins; reviewed first-party admission; CSS confined away from admin shell      |
| Preview cookie/iframe escape                   | Separate ephemeral origin, minimal content projection, exact postMessage source/origin/schema/nonce validation; no broad token to composer |
| Arbitrary slot/config manipulation             | Server validates grammar, stable node identity, field schema, family, scope, references and current manifest                               |
| Cross-Tenant database write                    | Composite constraints, RLS USING/WITH CHECK, immutable trusted attribution, purpose-scoped privileged ports; real-role tests               |
| Stale lease or approval                        | Monotonic fencing plus CAS, current authority reproof and immutable selected candidate                                                     |
| Restricted fact through media/summary/fixtures | Phase 10/public projection before render; approved media references; no production snapshots or operational record copying                 |
| HTML/prose/link injection                      | Existing D11 grammar, safe URL schemes and qualified embed rules; no DOM-derived arbitrary HTML stored as canonical content                |
| Source disclosure through logs/maps            | Redacted diagnostics, build logs restricted/size-bounded, editor source maps absent from public output; no secrets in exception payloads   |
| Resource/tenant starvation                     | Bounded intake/compute/concurrency with fairness; shared workers do not define authority                                                   |
| Public rollback to unsafe content              | Current adverse owner overrides last-known-good; restoration is new qualified successor                                                    |

No static verifier, sanitizer, CSP, signature, TypeScript type, agent skill or passing test proves arbitrary code harmless. Defense-in-depth and review are required, and any desire to run untrusted customer code in production changes the architecture and must not be disguised as an extension of this package.

<a id="web-h-data-minimization-and-retention"></a>

## Data minimization and retention

Git contains code and intentionally approved assets/fixtures, not donor records, private drafts, credential files, restricted-worker facts, CMS database snapshots or platform secrets. Build workers use synthetic fixture profiles by default. An authorized developer preview can receive only the approved public-safe projection, with rights and current policy applied. Public-safe refers to the qualified projection, not simply a field marked `public` by a caller.

Durable evidence records identity, hash, owner/policy version, safe cause, outcome, timings and counts; it need not duplicate source or private content. Access logs, operation receipts, security audits and business history have distinct owners/retention. No new generic log store becomes a source of truth. Purge follows existing holds/retention and verified complete use evidence. Public content withdrawal cannot undo disclosures already made to an external repository or AI provider; prevent inappropriate export first.

<a id="web-h-emergency-controls"></a>

## Emergency controls

Provide narrowly scoped source-ingestion pause, build-admission pause, package withdrawal, preview revocation and design-activation containment through existing operations. No general Force button or raw database repair. Disabling new builds must not disable ordinary safe CMS edits. A safety owner may suppress an unsafe public package/content immediately; normal availability goals never override that decision. Re-enabling a capability rechecks current bindings, epochs, versions and evidence rather than replaying every old event optimistically.

---
