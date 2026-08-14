# ADR-0143: Candidate-bound Public Content Sharing Attestation

**Status:** Accepted (founder-ratified Phase 22 D26 A-prime-R, 2026-08-14)

## Context

Missionaries, teammates, and staff need one understandable reminder that they
are responsible for the words and images they deliberately submit or publish.
An extra checkbox, legal modal, permission matrix, evidence-upload workflow, or
staff rights-review queue would add friction and false confidence. A mutable
Page-level Boolean would be worse: it could silently float to changed prose,
new media, translations, imports, clones, staff revisions, and later actors.

Phase 22 already has one immutable Public Content Release Candidate and one
deliberate **Submit for review** or **Publish changes** action. Phase 10 owns the
current safety ceiling and known direct publication objections; D9 owns media
sanitization and withdrawal; D2 and D11 own Page and Ministry Update release
evidence. The attestation must fit those boundaries without becoming a second
rights, consent, review, or release system.

## Decision

Adopt the exact founder-ratified Phase 22 D26 A-prime-R formulation:

> **A-prime-amended-and-hardened (A-prime-R)** — one calm, action-bound Public
> Content Sharing Attestation for each exact immutable Public Content Release
> Candidate: the currently authorized Public Page Contributor or staff actor
> responsible for the words and images they deliberately submit or publish
> sees one plain sentence immediately beside the existing D4/D5 action — **“By
> submitting, you confirm you’re allowed to share the words and images on this
> page publicly.”** or **“By publishing, you confirm you’re allowed to share
> the words and images on this page publicly.”** The existing **Submit for
> review** or **Publish changes** action is the affirmative attestation; upload,
> autosave, preview, recovery, reviewer approval of an unchanged candidate, and
> Page setup are not. Image selection quietly says **“Use a photo you’re
> allowed to share. We remove hidden location and file details before it
> appears publicly.”**, with optional short **Photo sharing tips** for
> recognizable people and children. The immutable candidate records one
> code-owned statement identifier/version, actual actor, server time, exact
> Tenant, Legal Entity, environment, Site, Page Family, Page or independently
> released Ministry Update, locale, candidate identifier and normalized content
> digest, and submit/publish action; the owning release evidence — D2’s Page
> Release Manifest for a Page or D11’s Audience Release Manifest and Release
> Projection for an Update — pins that exact candidate and attestation rather
> than creating a second permission record.
>
> Any material staff revision is a new D24-attributed candidate and carries the
> same single action-bound confirmation; a clone, import, different scope,
> translation, changed candidate, or later Page release never inherits an old
> attestation. This is the submitter’s recorded confirmation, not verified
> ownership, person-by-person consent, legal advice, staff rights review, or a
> grant of edit or release authority. For Phase 22 only, it is the ordinary
> whole-candidate permission input and narrowly qualifies Phase 10’s earlier
> mandatory `publish_name`/`publish_photo`/`publish_story` checklist: absent
> granular records do not create another Page workflow, while any known direct
> objection, hard `do_not_publish`, restricted-person rule, safety ceiling, or
> stricter current Phase 10 prohibition remains subtractive and non-overridable.
> D1/Phase 12 retain contributor authority; D4/D5 retain candidate and review
> truth; D2 retains Page reach and release truth; D11 retains Update audience
> and projection release truth; D9/Phase 29 retain media sanitization, placement
> withdrawal, and byte custody; and D18 retains adverse-first public
> convergence. A currently assigned contributor may be responsible for content
> they submit, but no “Page owner” role, subject-derived right, or authority over
> another contributor is created — without an extra checkbox, modal, terms
> wall, participant or asset permission matrix, consent database, rights-proof
> upload, expiry or renewal policy, legal-review queue, staff verification task,
> face or child detection, frightening warranty or indemnity language, public
> attestation data, fabricated legacy evidence, admin bypass, or any claim that
> attested, verified, consent-complete, safe, reviewed, approved, released,
> cached, publicly reachable, or still publicly available are the same fact.

The attestation is compact immutable evidence inside the existing candidate,
not a D26 table, Page Boolean, public field, or runtime lookup. Candidate and
attestation commit atomically through one idempotent, compare-and-swap-guarded
command. D2 or D11 pins the exact candidate in its own release evidence; neither
creates another attestation.

The rule is prospective. Existing safe releases are not removed solely because
historical attestation evidence was not captured, and they must not be falsely
labelled attested. The next editorial, imported, cloned, translated, or
reach-widening candidate receives a fresh attestation from its actual current
submitter. A changed statement version applies to future candidate actions.

For Phase 22 only, missing granular Phase 10 `publish_name`, `publish_photo`, or
`publish_story` records do not create a checklist or release failure. Any known
direct objection, `do_not_publish`, restricted-person rule, safety ceiling, or
stricter current Phase 10 prohibition still blocks or contains affected public
output. Other Phase 10 purposes and separately required evidence are unchanged.

## Consequences

### Positive

- The user sees one calm, just-in-time statement with no extra interaction.
- Evidence describes the exact content, actor, scope, wording, and action.
- Staff approval of unchanged work remains editorial judgment, not rights
  verification; material staff revisions remain attributable.
- Public rendering and release do not gain a rights graph or attestation join.
- Known safety objections and adverse removal remain independently effective.

### Costs and constraints

- Every submission and direct-publication path, including service and provider
  adapters, must be unable to bypass candidate-bound evidence.
- Service and provider adapters may prepare or validate a candidate only. The
  submission or publication command must carry a verified human caller and
  current authorization context through the user-bound D4/D5 action; a
  background or service identity cannot supply the attestation's actual actor.
- Candidate normalization and digest behavior must be deterministic and
  versioned across upgrades.
- Migration surfaces must distinguish **not captured** from false, denied, or
  verified.
- Copy, localization, accessibility, concurrency, tenant isolation, ambiguous
  outcomes, and adverse containment require production-shaped proof.

## Rejected alternatives

### One standing Page permission Boolean

Rejected because it can silently cover different content, actors, scopes, and
future releases.

### A separate required checkbox or modal

Rejected because the existing consequential action can provide active,
recorded confirmation without another step or click-through habit.

### Per-person or per-asset consent and rights management

Rejected because it creates an unproven legal and operational subsystem,
burdens contributors and staff, and still cannot verify every legal basis.

### Staff re-attestation or rights verification at approval

Rejected because an unchanged candidate already identifies its submitter and
staff editorial review must not imply legal verification.

### Inheriting evidence across revisions, translations, imports, or clones

Rejected because the old statement does not describe the new exact candidate.

Ratification of this planning decision authorizes no implementation, migration,
legal determination, notification, issue publication, or production activation.

## References

- [Phase 22 ratified D26 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d26--who-confirms-that-the-words-and-images-on-a-public-page-may-be-shared)
- [Phase 22 ratified D26 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#49-ratified-d26-research--one-calm-page-content-sharing-attestation)
- [ADR-0122 — Simple Public Page review with quiet Phase-10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0126 — Release-bound Public Ministry Media Assets](./0126-release-bound-public-ministry-media-assets.md)
- [ADR-0128 — Canonical Ministry Update audience release projections](./0128-canonical-ministry-update-audience-release-projections.md)
- [ADR-0141 — Attribution-preserving Staff-authored Page Revisions](./0141-attribution-preserving-staff-authored-page-revisions.md)
- [ADR-0142 — Derived editorial actionability and bounded recovery](./0142-derived-editorial-actionability-and-bounded-recovery.md)
