Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-adversarial"></a>

# Adversarial findings resolved in this specification

<a id="web-h-1-current-stable-vendor-release-is-not-the-required-core-engine-cohort"></a>

## 1. Current stable vendor release is not the required Core engine cohort

Observed: Core pins an internal Payload 4 build; the current stable GitHub release endpoint returns 3.89.0. This does not prove no public v4 prerelease exists. Resolution: Q01 must qualify an exact coherent cohort under the existing v4 decision; do not swap majors to make a demo work. No enterprise visual-editor dependency (R03; E05–E07).

<a id="web-h-2-a-custom-cms-frontend-does-not-inherit-all-payload-admin-behavior"></a>

## 2. A custom CMS frontend does not inherit all Payload Admin behavior

Observed: the current editor imports native form/save/publish state. Resolution: custom forms must preserve required validation, acknowledged revisions, references, permissions, locale, history and recovery through typed adapters. Two form engines cannot own one draft (R04; R07; R09).

<a id="web-h-3-one-transaction-is-a-real-connection-requirement"></a>

## 3. “One transaction” is a real connection requirement

Observed: Payload transactions propagate via its request context. That says nothing about a separate Supabase request. Resolution: Q02 proves content/lease/receipt/outbox on one physical transaction. This is an implementation integration gate, not a fictitious transactional API pasted into a spec (E02).

<a id="web-h-4-puck-is-a-useful-ui-toolkit-not-canonical-content-or-permission-authority"></a>

## 4. Puck is a useful UI toolkit, not canonical content or permission authority

Its composition/slot APIs support the desired UI, but its overrides are experimental and external-data selection can copy values. Resolution: one bounded adapter; declarative fields; actual round-trip tests; server grammar and current owner references. No copied operational facts and no permanent dual document (E09–E16).

<a id="web-h-5-pucks-internal-iframe-does-not-isolate-it-from-mission-control"></a>

## 5. Puck’s internal iframe does not isolate it from Mission Control

Resolution: the whole composer runs as one context on a separate qualified origin. Its same-origin viewport stays within that origin. The trusted shell holds product authority. Only admitted first-party renderers receive actual authorized content; unreviewed development remains synthetic and isolated. The spec makes this residual trust explicit rather than claiming arbitrary renderer code can safely edit real data (E15; E31).

<a id="web-h-6-arbitrary-react-cannot-automatically-become-completely-visually-editable"></a>

## 6. Arbitrary React cannot automatically become completely visually editable

Registered components and source mapping are useful patterns visible in Builder, Storyblok and Sanity. They require intentional bindings. Resolution: explicit semantics/controls and standard fallback, actual field-to-render tests, and new schema meaning through the catalog owner. A code file’s name or DOM inspection cannot invent correct authoring metadata (E26–E28).

<a id="web-h-7-git-workflows-and-content-workflows-are-complementary"></a>

## 7. Git workflows and content workflows are complementary

Repository ownership is confirmed, but ordinary staff should not need Git. Configuration/source delivery can be governed without overwriting editorial records; Craft's configuration documentation provides a relevant example. Resolution: exact code artifacts and private editorial revisions have separate owners, converging only at qualified publication. No mandatory embedded IDE or automatic repository writes for content (R01; E29).

<a id="web-h-8-a-green-check-controlled-by-the-code-author-is-not-independent-admission"></a>

## 8. A green check controlled by the code author is not independent admission

Resolution: capture exact bytes, isolate build/install scripts, strip tokens, run trusted policy tests separately, bind evidence to artifact and retain safe old versions. No source hash, signature or passing test alone proves a program safe. Qualified packages remain reviewed first-party code, not a general sandboxed customer runtime (R16; E22).

<a id="web-h-9-review-freshness-is-not-always-latest"></a>

## 9. Review freshness is not “always latest”

Earlier informal discussion suggested all later edits should invalidate a candidate. That is too broad. Resolution: fixed reviewed inputs remain fixed and newer private drafts are excluded. Actual safety/authority/cohort and required compatibility invalidation still block. This also preserves exact scheduled intent and prevents a timer from selecting unintended later work (R07–R08; R17).

<a id="web-h-10-cancellation-and-deduplication-are-not-rollback-and-exactly-once-execution"></a>

## 10. Cancellation and deduplication are not rollback and exactly-once execution

Inngest event dedupe has a bounded window; cancellation does not erase committed domain effects. GitHub does not automatically redeliver failed webhooks. Resolution: product receipts, semantic keys, work claims, generation fences and bounded reconciliation decide outcomes beyond transport behavior (E21; E23–E25).

<a id="web-h-11-more-visual-freedom-needs-an-explicit-bounded-successor"></a>

## 11. More visual freedom needs an explicit bounded successor

Current D7 is intentionally flat. Resolution: HA-A1 proposes Stack/Split/Grid with exact Page-only grammar, limited depth, finite tokens and preserved DOM order. This is a real new design decision, not reinterpretation of a previous promise. A future arbitrary freeform design language needs its own scope decision (R06).

<a id="web-h-12-last-known-good-does-not-override-current-safety"></a>

## 12. “Last known good” does not override current safety

Resolution: keep safe admitted artifacts available during source outages, but current withdrawal/rights/safety can make previous public output ineligible. Restoration produces a new validated successor over current content. No rollback re-exposes restricted facts for convenience (R15–R17).

<a id="web-h-13-thoroughness-must-not-create-unrelated-products"></a>

## 13. Thoroughness must not create unrelated products

Resolution: this specification contains 18 Web Studio workflows and 12 fixed automations. It does not model help desks, external issue escalation, generic process builders, arbitrary tenant scripts, hosted AI billing, app marketplaces or customer server runtimes. General shared capability reuse is bounded to actual dependencies.

<a id="web-h-remaining-evidencenot-unmade-product-decisions"></a>

## Remaining evidence—not unmade product decisions

The exact qualified Payload cohort, Puck cross-origin/browser fit, adapter transaction implementation, production provider/resource fit and measured staff usability cannot be truthfully asserted from documentation. Q01–Q09 define the exact tests and failure dispositions. Their absence prevents runtime admission, not completion of this design artifact. No runtime benchmark, deployment or security-certification result is claimed here.

---
