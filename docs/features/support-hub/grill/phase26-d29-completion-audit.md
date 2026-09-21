# D29 completion and traceability audit

**Fully founder-ratified, 13 September 2026. D29 and every adopted amendment are accepted; D1–D29 are fully ratified.** The appended ratification governs earlier answer-stage status. This remains feature grooming, not implementation or release proof.

**Historical opening (superseded status, preserved evidence):** **Disposition: Accept with required amendments.** A/contact priority is selected; the finished detailed amendment package is proposed for full ratification. This audit records completed research/grooming, not permission to implement or proof of a deployed feature. The [main decision](phase26-d29-adversarial-review.md) governs the reconciled answer.

## Finished package

| User requirement                                 | Completed artifact and exact coverage                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Easy direct tenant contact, optional information | R01–R06, R09, R25–R26; [UX blueprint](phase26-d29-ux-blueprint.md): form visible immediately, required reply email/message, optional unsplit name, published email, optional actual phone, up to three secondary guides.                                                                                                                |
| Complete requester journey                       | Public, signed-in/on-behalf, guide reading/return, submit/receipt, unknown outcome, validation, session/context changes, low bandwidth, mobile, accessibility and alternate contact are specified in the UX blueprint and P01–P18/P40–P44.                                                                                              |
| Complete staff and maintenance journey           | One canonical form-origin source; actual first email reply; CRM-first/Support-first continuity. Requester help management delegates public/app/route/content owners with separate draft/publication/readiness and zero-effect previews. R14/R20/R24/P24–P26/P32/P38–P39.                                                                |
| Current, relevant research and alternatives      | [Evidence synthesis](phase26-d29-evidence.md), [independent UX research](phase26-d29-ux-research.md), immutable source registries. Contact alone and A plus an optional full library receive honest comparisons; no forced self-service strawman.                                                                                       |
| Database, source and authorization scrutiny      | [Data contract](phase26-d29-data-contract.md) and [independent review](phase26-d29-data-review.md): authoritative owners, public/app adapters, tenant-aware relations, effective RLS/grants/service paths, immutable provenance, genuine guest/form origin, finite custody and native-source compatibility.                             |
| Email Studio seam                                | [Full integration contract](phase26-d29-email-studio-integration.md) and [owner review](phase26-d29-owner-review.md): browser receipt versus optional web acknowledgement, distinct source/recipient profile, exact P17 material, P6 finality, Off-only recent copy, shared courtesy, full human precedence and first real staff reply. |
| Every requested adversarial category             | The main decision's 23 individually numbered rows state material concern, consequence/evidence, conditional severity/likelihood, effect on A and exact permanent fix clauses. No category is skipped.                                                                                                                                   |
| Exact corrected language and synthesis           | R01–R30, the main corrected decision, staged owner qualifications, P01–P44 and O01–O06. The founder need not reconstruct a decision from criticism.                                                                                                                                                                                     |
| Traceability and no premature authority          | Feature ADR0029 and four narrow proposed glossary terms, session log/handoff and canonical report mirrors. All prior D1–D28 artifacts/ADRs and Q29 comparisons preserved. No Q30/formal spec/ticket/runtime/provider/GitHub mutation.                                                                                                   |

## Independent adversarial closure

Three independent agents reviewed the **actual completed root documents**, not only an initial outline:

| Review              | Material corrections incorporated                                                                                                                                                                                                                                                                                                                   | Final record                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| UX                  | Context-only authorization loss must remove invalid source references/prefill while preserving only still-permitted visitor text for a deliberate context-free path. Actual logout/account/tenant switch clears the full draft. Immediate contact, source-safe optional guides and current independent alternatives remain coherent.                | [Final UX review](phase26-d29-ux-final-review.md), Pass at document level.       |
| Data/architecture   | Exact optional Page leaf qualification, separate public/app releases, certified Support-only primary, immutable form origin, recovery after route change and no duplicate CRM state. P16 expressly covers a crash after durable acceptance but before materialization: discoverable accepted pending work, same occurrence, original clocks, once.  | [Final data review](phase26-d29-data-final-review.md), Pass at document level.   |
| Email/source owners | Web confirmation requires its own qualified source/recipient/publication. Recent sent copy is Off-only; no permanent generated body/subject. A later human reply ends additional acknowledgement call/decryption authority even after possible submission, while in-flight reconciliation remains. Human failure never revives the acknowledgement. | [Final owner review](phase26-d29-owner-final-review.md), Pass at document level. |

Initial independent findings remain historical evidence in their reports. The root clauses and appended final verification resolve them. Independent review does not certify real migrations, provider delivery, RLS enforcement, accessibility or user satisfaction.

## Exact category coverage

All 23 categories have a material concern in an underspecified implementation of A. Severity is impact; likelihood is a conditional qualitative estimate, not observed incident frequency. Shared underlying risks are evaluated separately for their consequences.

| Category                                  | Main permanent-fix trace    |
| ----------------------------------------- | --------------------------- |
| Problem validity, necessity, alternatives | R01–R03/R06                 |
| Brittleness                               | R05–R08/R10–R12/R25/R28     |
| Technical debt                            | R08/R10/R13–R18/R24         |
| Edge cases                                | R03–R15/R20/R25             |
| Footguns                                  | R05/R13–R19                 |
| Tenant safety                             | R07/R10–R13/R21–R25         |
| Database, RLS and authorization           | R13–R15/R21–R23             |
| Overengineering                           | R01–R08/R24/R27             |
| UX/UI friction                            | R02–R05/R09/R11/R15–R16/R26 |
| Source of truth and invariants            | R06–R10/R13–R22             |
| Support–CRM continuity                    | R11–R14/R20–R22             |
| Hidden coupling                           | R08/R10/R17–R19/R25         |
| Failure modes                             | R13–R18/R25                 |
| Lifecycle, time, concurrency, idempotency | R13–R19/R21/R28             |
| Data integrity                            | R10–R15/R19–R22             |
| Security and privacy                      | R07–R12/R17/R21–R23         |
| Scalability and performance               | R04/R08/R13/R23/R27         |
| Operational burden                        | R05/R24–R25/O01–O06         |
| Observability and auditability            | R13–R23/R27                 |
| Dependencies and integrations             | R08/R10/R14/R17–R18/R26     |
| Migration, rollout and upgrades           | R21–R22/R28                 |
| Testability, traceability and proof       | R29–R30/P01–P44             |
| Other hazards                             | R01/R09/R19–R20/R22/R27     |

## What must happen, and when

**Resolved before recording:** contact priority; minimal fields and input bounds; guide selection/reach/reading; separate public/app authority; native form source; exactly one Support primary; receipt truth; shared CRM/detail; optional acknowledgement's source, courtesy, custody and human precedence. These are stated decisions, not hidden implementation choices.

**Required in later explicitly authorized design/spec:** copy the exact R/P/O trace and owner amendments. P23 needs the precise ordinary-inquiry mapping and optional Page leaf; the app needs its own qualified consumer; Support needs form-origin and recipient contracts; D14/D28 need explicit form-origin admission. Email Studio/P17/P6 need the new optional web confirmation profile and common safety gates. This is narrow conformance work under existing owners, not a generic workflow platform.

**Required before activation:** prove source scope, atomic primary acceptance and discoverable recovery first. Then qualify current requester/recipient/privacy/grants, public/app rendering and optional guidance containment. Optional visitor email can remain Off until its full profile is ready. Complete mixed-version, no-JS, accessibility, load and moderated journey proofs. A guide or template preview cannot substitute for any acceptance proof.

**Monitor only after qualification:** O01–O06 name the exact source/operations owners, signals, thresholds and responses. Security/wrong-route/false-Received/duplicate-effect/forced-contact-gate signals trigger at one observed occurrence. Optional guidance maintenance uses 48 elapsed hours, while contact qualification loss is actionable immediately. Performance has a declared p95/error window and minimum sample, not vague “slow” or “large” language. No monitor postpones a known material defect.

## Documentary verification and limits

The [validation record](phase26-d29-validation.json) records the checks actually performed: exact clause/category/proof/control counts; independent final reviews; immutable source hashes and line links; relative links; formatting; canonical/output byte equality; preservation of 229 prior decision artifacts, 28 prior ADRs, eight historical Q29 artifacts and earlier validation receipts; glossary append-only continuity; unchanged source HEAD/origin and grooming-only paths.

The [reference examples](phase26-d29-reference-experiments.json) executed **24** finite synthetic checks. The URL-encoded Unicode fixture is **126,677 bytes** within the proposed **262,144-byte** ceiling. Exclusive primary and acknowledgement cardinality include negative examples. These are explanatory reference functions; they are not tests of Core's actual transaction, RLS, provider, browser or accessibility behavior. The script is retained with the package for reproducibility.

The complete proposal defines **30 clauses**, **23 category outcomes**, **44 required release proof groups** and **six operational controls**. All 44 real proof groups remain **required and unexecuted** in this grooming stage. No actual throughput, availability, conversion, donor satisfaction, provider delivery or production security result is claimed. Supabase was not queried or changed. No real request, email, call, inbox/DNS change or GitHub mutation occurred.

The finished result is a documented, source-checked and independently challenged **decision package**. Full detailed ratification remains a subsequent founder action; D1–D28 remain fully ratified. No next question is advanced during this review.

## Full founder ratification — 13 September 2026

The founder explicitly ratifies **D29 A — Contextual guides and direct contact**, including every amendment, addition, adjustment, change and update in **D29-R01–R30**; all **23 individually evaluated adversarial categories**, findings, consequences, severity/likelihood assessments and permanent fixes; the complete requester, staff, CRM and maintainer journeys; all data, Supabase/RLS, source ownership, privacy, lifecycle, migration and recovery requirements; all independent final corrections; **four glossary terms**; **P01–P44** required release proof groups; and **O01–O06** operating controls with named signals, thresholds, owners and responses. **D1–D29 and every adopted amendment are fully ratified.** Earlier proposed/pending/no-next-question language, including D29-R30's answer-stage recording status, is historical and creates no remaining ratification gate.

The complete accepted design is contact-first: the ordinary Help form is immediately available; reply email and message are required, name is optional and unsplit; the tenant publishes a monitored email and may publish an actual phone channel; up to three exact currently eligible Listed public guides remain optional. Message/name limits are 10,000/200 Unicode scalars under the documented normalization, with a 256 KiB raw request ceiling. Native/no-JS submission, accessible errors/receipt, safe draft/context preservation and explicit identity-switch clearing are accepted requirements. Guide-only failure must preserve an otherwise qualified contact path; whole-scope uncertainty never permits an unsafe fallback.

Separate public P23 and authenticated app consumers retain their own trusted scope and release boundaries while using one qualified purpose/occurrence/Support handoff. Exactly one durable primary outcome precedes Received. Accepted pending intake remains discoverable and recovers the same form-origin source once with original clocks, even after route changes. No fake inbound email, automatically verified Party, duplicate CRM Activity or hidden cross-channel fallback is permitted. CRM shows the same currently authorized canonical Support detail; relevant business actions remain owner-authorized.

**Email Studio and shared communication roles are fully ratified.** Browser Received is not email delivery and needs no template. The standard Help form's optional Visitor Acknowledgement starts Off and requires the new exact web-Contact source/recipient/P17 publication profile, not reuse of D13's receiving-email-only trigger/key. Email Studio owns governed wording, qualified Tiptap authoring, presentation and immutable prepared material. P23 owns the optional child/source request, Support owns request/work/source history, and P6 owns dispatch/outcome/reconciliation. The web confirmation's Recent sent copy is Off-only: body-free actual-state history, no permanent generated body/subject, and synthetic Template used preview only.

The accepted web confirmation has a 15-minute utility from trusted form admission and shares the tenant/mailbox 24-hour receipt courtesy domain with D13 email confirmations. Full D13-R15 human precedence applies before and after possible acknowledgement submission: a qualifying human reply ends further acknowledgement call/decrypt authority, preserves reconciliation of already-in-flight outcomes and cannot be undone by later human-send failure. First human replies use qualified form-response recipient authority and real outgoing lineage; later actual email follows normal correlation. D14 uses genuine form admission/coverage and D28 still requires actual accepted human correspondence plus every eligibility guard. Form receipt, guide use and automated email earn no human reply or completion credit.

Ratification accepts all documented safeguards and proof obligations; it does not turn 24 synthetic examples, immutable source checks or three independent document reviews into actual SQL/RLS, concurrency, provider, browser, accessibility or usability evidence. All 44 real release groups remain required and unexecuted. Original source/experiment/validation evidence is preserved. The session may now continue with one researched unresolved question; no formal specification, implementation, tickets, GitHub/provider/DNS/inbox mutation or real messages are authorized by this recording.
