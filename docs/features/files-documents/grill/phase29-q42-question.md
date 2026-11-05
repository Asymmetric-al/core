# Phase 29 Q42 — One home folder or additional folder references

**Status:** Conrad fully ratified Q42 A and every required amendment on
2026-10-25, Asia/Bangkok. The [completed review](phase29-q42-adversarial-review.md)
and [ADR-0042](../docs/adr/0042-one-home-folder-for-ordinary-request-evidence.md)
record the adopted exact package. Q01–Q42 are ratified; all 26 glossary
definitions are unchanged. Earlier preparation and selected-answer review
entries below are dated history. No implementation, activation or formal
owner/OpenSpec publication follows.

## Historical question preparation — 2026-10-24

**Status:** Researched question prepared 2026-10-24, Asia/Bangkok. Q01–Q41,
all required amendments and 26 glossary definitions are ratified. Private
Document Share is the newest term; the prior 25 definitions are unchanged.
Q42 has no selected answer, ADR or glossary term. This is grooming research,
not implementation, activation or formal owner/OpenSpec publication.

## One decision

**For ordinary request-document entries in the staff File Manager, should each
entry have one home folder, with labels and saved views for other ways of finding
it, or should staff also be able to add references to it in other folders?**

Folders, labels, views, source navigation and practical bulk handling are already
required. This question chooses ordinary folder placement behavior. It does not
ask whether folders should exist, where private bytes are stored, or who may
read/share them.

| Option                                                              | Practical behavior                                                                                                                                                                                          | Main tradeoff                                                                                                                                                                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — One home folder, with labels and saved views (recommended).** | Each eligible source entry has one home folder or remains Unfiled. Staff can apply the permitted labels and find it through search, saved views and its source record without making extra folder entries.  | Clear location and Move behavior; fewer reference/removal/conflict states. A second way of finding the entry uses a label or view rather than another folder.                                               |
| **B — One home folder plus additional folder references.**          | Keep one home folder or Unfiled, with explicit non-owning references to the same authorized source entry in other eligible folders. A reference does not copy bytes, change source meaning or grant access. | Helpful when staff repeatedly navigate different folder paths to the same entry. Adds reference-versus-home presentation, removal, stale/unavailable reference and duplicate-selection behavior to support. |

**Recommend A.** It gives staff a familiar location while retaining several
useful ways to find the same work through capabilities already required. It
avoids a second reference-management layer before evidence shows that labels
and views are insufficient. This is a product judgment about a smaller coherent
model, not measured Asym usage, a promise that labels suit everyone or a finding
that B is bad practice. B is a legitimate convenience when several folder-based
working arrangements are important.

Neither option is a forced filing exercise: Unfiled remains usable and staff
do not have to add a label just to receive or use evidence. Appearing in search,
a saved view or the owning request is not another folder placement.

## Concrete example and scope

Illustrative only, not an observed ministry workflow: Elena has a source-provided
entry for an equipment-inventory PDF supplied for an ordinary request. She wants
to find that same entry both with the **2026 Visit** work and with **Equipment**.

Under A, she places it in 2026 Visit, applies the permitted Equipment label and
can use an Equipment saved view. The entry remains in its authorized source view.
She can move its home later without reuploading it.

Under B, she can additionally choose **Add reference to folder → Equipment**.
The interface identifies that entry as a reference and offers a clear way to
reach its home/source. Removing that extra reference does not remove the
underlying source evidence or its other valid appearances.

The first cohort is **ordinary Private Document Request evidence entries**:
one admitted file contribution/use for a particular request/item, whether
durably received from the participant or supplied under Q28. It is not the
whole multi-file item, a physical byte object/digest, provider key, file name
or a new universal Logical Document.

Organization targets the actual source-owned entry/reference exposed for staff
filing. The source retains identity, qualified exact/current-version behavior,
correction lineage and history/read eligibility. Q42 does not assume that a
later correction inherits a location, that every version is another file to
file, or that folder placement determines the current/accepted version. Those
native mappings must be made precise in the selected-answer review.

The same bytes may be lawfully used by two different requests or domains.
Their independently governed uses do not become one universal folder placement
or a combined permission. Moving an entry cannot reparent its business source.

## Current primary research and strongest alternative

Primary pages were directly read on 2026-10-24. They show established patterns,
not an empirical verdict about Asym or permission to copy vendor defaults.

- [SharePoint custom document-library views](https://support.microsoft.com/en-us/sharepoint/libraries/create-a-custom-view-of-a-document-library)
  documents saved sorting, filtering and grouping. That supports multiple
  discovery routes without requiring extra folder placement. It does not
  establish that users always prefer tags/views, or authorize Core to adopt
  SharePoint permissions, arbitrary columns or its library model.
- [Google Drive shortcuts](https://support.google.com/drive/answer/9700156?hl=en&co=GENIE.Platform%3DDesktop)
  documents explicit references to original files/folders, separate original
  permission and removal of a shortcut without deleting the original. This is
  strong support for B's practical convenience. It also documents title
  visibility in a shortcut container even when the target cannot be opened.
  Core must preserve its stricter metadata authorization. Google's latest-info
  behavior and shortcut limits do not become Core version or capacity rules.
- [Box Collections](https://support.box.com/hc/en-us/articles/360048730094-Using-Collections)
  provides named private groupings of owned/shared content. This supports
  alternative organization, but the collections are visible only to their
  creator. It is not evidence for shared multi-folder permissions or a reason
  to add a new collections product here.
- [Blackbaud Grantmaking documents](https://help.blackbaud.com/docs/0/assets/grantmaking/content/manage-documents.html)
  distinguishes document files from document records and supports related-record
  access and tags. It is a relevant nonprofit comparison for finding documents
  in business context. Its replace-file and merged-PDF features do not establish
  Core's lineage, folder cardinality or bulk-export semantics.

Google's [single-location/shortcut migration page](https://support.google.com/drive/answer/10864219?hl=en)
describes a historical 2022 change, not a new 2026 rollout or direct proof of
Core's preferred UX. Both a simpler home-plus-views model and explicit extra
references are current credible choices. No vendor account was exercised,
staff interviewed, task-completion rate measured or cost benefit established.
Detailed source limits and journeys are in the
[comparative research](phase29-q42-comparative-research.md).

## Governing boundaries and why this question is open

The [owner research](phase29-q42-owner-research.md) and
[runtime research](phase29-q42-runtime-research.md) retain exact source/runtime
evidence and the comparison with other open frontiers.

1. **Ordinary folder cardinality remains open.** Founder brief §§8/16 and Q02
   require useful organization. Q38 settles authorized metadata/source-context
   discovery. None selects one versus additional ordinary folder placements.
   Q41 settles external reader admission and its first source cohort, not staff
   folder placement.
2. **Existing specialized folder decisions stay intact.** ADR-0162/D18 already
   defines Page/Article Content Library placement per Tenant × environment ×
   Site. ADR-0171/D27 separately defines Media-only organization, including
   one placement or Unfiled. They exclude a generic shared folder engine.
   Q42 neither changes those decisions nor silently imports their five-level
   limit, rehoming/removal rules, Site scope, adapter or transactions.
3. **Filing is not authorization.** Folder/reference presence, ancestry, labels
   and saved-view membership grant no body read, original download, sharing,
   request admission, acceptance, publication or retention. Existing current
   source/P12 rules govern both organization commands and each disclosed fact.
   An external Q41 reader gets no staff folder tree or other-use discovery.
4. **Metadata is protected too.** Apply current access before names, references,
   counts, facets, search, ordering, pagination and error serialization. An
   accessible container does not authorize revealing a protected target title.
   The Google shortcut-title behavior is explicit counterevidence that must
   not be copied into Core.
5. **Source identity remains authoritative.** One request item can have several
   independent file contributions and corrections. Folder operations target
   the qualified source-provided organization reference, not a digest or
   mutable newest object. Separate source uses keep their separate restrictions.
   Rename/move does not adopt a new version or create a new evidence act.
6. **Organization does not delete evidence.** Home move, extra-reference
   removal and source-owned disposition are different actions. Neither option
   grants recursive file deletion or weakens holds. Exact folder-removal and
   concurrency behavior belongs in the selected-answer design under current
   preservation rules; it is not inherited from another product's trash command.
7. **One placement question, not a new platform.** This choice does not select
   personal versus shared folder audiences, a new global source identity,
   cross-tenant/Site roots, automated filing, a schema designer, smart folders,
   a hierarchy depth number, external synchronization or a new storage provider.
   Use existing shared UI/source-view mechanics where their actual semantics
   qualify. Do not assume generic saved views or folder APIs are already built.
8. **Choose at the correct level.** Bulk delivery shape and exact-version
   review-comment location are other plausible frontiers. Neither generic
   bulk capability nor comments should be reasked as an existence question.
   Ordinary filing now addresses the broader organize/find journey without
   reopening Q41's already-ratified finite-end/action model or mechanically
   adding another notice-default question.

A chooses a smaller organizational model; it does not prevent the same entry
from appearing in several authorized views or source surfaces. B adds navigational
references, not duplicate documents, equal owning parents or broader authority.
Both still need an actual qualified ordinary source/organization command.

## Journeys and acceptance direction

These are necessary distinctions for the later selected-answer review, not a
selected specification or proof of current implementation.

| User or situation                                      | Required behavior                                                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff receives new ordinary evidence                   | Find it through its source and authorized lists without mandatory filing or labeling; Unfiled is useful.                                                       |
| Staff files one entry                                  | Review the actual source entry and permitted destination; moving organization changes no evidence/acceptance/access fact.                                      |
| Staff wants two ways to find it                        | A uses a permitted label/view; B may add an explicit non-owning folder reference. Neither copies bytes or grants access.                                       |
| Staff opens a saved view/search/source record          | Same currently authorized source entry and identity; appearing there is not another home or a new grant.                                                       |
| Staff moves the home                                   | Stable source relationships and existing lawful share terms survive; no reupload, source reparenting or version adoption.                                      |
| Staff removes an extra reference under B               | Clearly remove only that reference, preserving the source entry/evidence and other appearances.                                                                |
| Multi-file item or equal bytes in another source       | Organize the intended contribution/use, not the entire item or every other use of the physical bytes.                                                          |
| Source publishes a correction/new version              | Apply its actual entry/version/correction mapping and current read rules; no folder-driven automatic successor or history access.                              |
| Source or target becomes restricted/unavailable        | Current permission and safe metadata handling win; no stale label/title/count leak or public fallback.                                                         |
| Folder destination changes during a command            | Preserve valid organization or report a supported conflict; do not silently redirect to another tenant/source scope.                                           |
| Staff selects a finite bulk set                        | Retain exact selection and honest outcomes; references do not silently duplicate business effects or multiply downloads.                                       |
| Tenant administrator                                   | Source organization powers and defaults remain separate from disclosure/retention; no permission inheritance from a folder.                                    |
| External recipient, donor, missionary or public viewer | No newly exposed staff structure, source association or other document rights from ordinary filing.                                                            |
| Keyboard, touch or assistive-technology user           | A labeled Move/Add-reference action works without drag-and-drop; clear focus, destination and status.                                                          |
| Mobile, zoom, long/RTL names and low bandwidth         | Searchable readable picker, stable context and safe retry; no exhaustive tree loading or required desktop drag gesture.                                        |
| Folder removal, retention or restore                   | Preserve source evidence and governing restrictions. Organization recovery cannot resurrect ended access, delete retained material or replace source identity. |

## Current implementation, ratification and evidence limits

Local Core remains 3d85897ebf1515008ef5c676b1c58a15422fb9ab; current live
develop is c541b84bcf4b401937ab5ae300f40cb0f8e0b856, unchanged since the
Q41 review. The historical complete 67-path comparison was live4e31→c541,
not local→live. Source, current code and actual deployment remain distinct.

Current specialized CMS/Media collection and list-wrapper code, legacy document
storage paths and source-specific CRM view settings do not establish a complete
ordinary File Manager folder-placement or reference capability. Existing
personal gift-history views are not a generic shared saved-view implementation.
Neither A nor B is certified by that adjacent code; the selected ordinary source,
identity/reference mapping, command, authorization and UI still need proof.

Q41's exact 14,625-character, fourteen-paragraph decision and all substantive
review table rows were preserved on ratification. Private Document Share matches
the adopted report/ADR definition; the prior 25 glossary definitions remain
byte-preserved, giving 26 terms. The preservation census verified 363 other
files. These checks establish documentation consistency, not native behavior.
No runtime, schema, provider, private data or actual message was changed/tested.

## Historical preparation and next step

Independent owner, runtime and comparative/UX research informed this question.
Their whole-question reviews are closed with no unresolved material issue for
question readiness. B explicitly preserves Unfiled; Q41 is described as ratified
rather than natively usable. The linked notes retain source evidence, actual
review closure and the detailed journey mapping. Deterministic record checks
verify preservation and links, not native qualification.
No Q42 ADR or new term is written. Conrad chooses A or B, then the selected
answer receives the full adversarial review and exact required amendments.
Formal owner/OpenSpec publication remains /to-prd; implementation tickets
remain /to-issues.

## Historical selected answer and review — before ratification, 2026-10-25

Conrad selected **A — One home folder, with labels and saved views** and
requested full research/adversarial review. Disposition: **Accept with required
amendments**. The [full review](phase29-q42-adversarial-review.md) and
[ADR-0042](../docs/adr/0042-one-home-folder-for-ordinary-request-evidence.md)
record the exact fourteen-paragraph decision, Q42-C01–C14/P01–P30, all22
categories,18 lifecycle distinctions,22 journeys,six budget rows and six
operational controls. The complete package awaits ratification; A's selection
does not imply adoption of material amendments. No new glossary term is needed;
all26 definitions and Q01–Q41 remain unchanged.

One optional home belongs to an exact admitted ordinary request evidence use
within Tenant × environment × ordinary-request filing, not to shared bytes,
the entire item or a universal document. Labels/source/search/private saved
views are other discovery paths, not placement or access grants. Page/Article
and Media organization remain under their existing separate owners.

Independent new contributions/Q28 uses start Unfiled with no copied labels.
An actual Q03 correction or qualified Q28 replacement may carry only its
current qualified predecessor home once at ordered source admission, under
source-maintenance authority. It carries no labels/approval/rights; optional
filing failure leaves an otherwise lawful receipt Unfiled. Invalid source
admission still fails. Original carry-or-Unfiled is durable; no late latest-home
copy or propagation. Same-use non-byte changes preserve existing organization.

Folder removal is empty-only after complete structural proof, never a filtered
zero. Explicit finite all-or-none Move first clears entries/children. The same
current-authorized Move/Unfile commands and source-owned proven-stale-reference
reconciliation provide operator recovery without SQL, broad read grants or
source deletion. Protected metadata, source authority and exact-use identity
apply to every path, including old/new-row policy behavior, privileged and
trigger writes, cache/restore and minimal durable retry evidence.

Labels never stand in for acceptance. Invalid saved predicates cannot be
silently dropped; current private view audience is explicit, while required
shared-view outcomes remain for their separate owner-qualified audience
decision. Ordinary lists make their source/direct-folder scope visible. UI
uses Core controls, optional organization and non-drag accessible Move, with
truthful persistent status and recovery. No routine notification, approval,
new provider, hierarchy/label-policy engine or general drive follows.

Fresh live a6f6de55 and local3d85897 are distinct; the five-commit/nine-path
c541→a6f6 drift was classified and relevant current owner/runtime evidence
checked. Independent complete-report/ADR owner/runtime/UX reviews closed after
material fixes. Documentation checks preserve prior decisions/glossary and
verify parity/links/format; no new native RLS/race/load/provider/browser/user
proof or implementation is claimed. Formal owner/OpenSpec publication remains
/to-prd; implementation tickets remain /to-issues. Q43 is not selected or asked.

## Full ratification — 2026-10-25

Conrad explicitly instructed on 2026-10-25: “Yes, fully ratify Q42 A with all
required amendments. Record it and move to the next question in this Phase 29
grill-with-docs session, with research, practical options, and your recommendation.”

The exact fourteen-paragraph,12,227-character decision, Q42-C01–C14/P01–P30,
all22 categories,18 lifecycle distinctions,22 journeys,six qualification budget
rows and six operating controls are adopted without substantive change.
Q01–Q42 are fully ratified grooming intent. All26 glossary definitions are
byte-preserved; no new term is necessary. Q43's answer is not inferred.

Preserve one optional home for each exact admitted ordinary-request evidence
use, useful Unfiled, independent equal-byte uses, current source/P12 authority
and private organization metadata. Source evidence, acceptance, currentness,
Q38 discovery, Q41 share terms, retention and specialized P23 organization
remain authoritative and unchanged by filing.

An actual qualified Q03 correction or Q28 replacement may carry its exact
predecessor home once at ordered admission, without labels, review or access
inheritance. Independent new uses start Unfiled. Unknown optional filing leaves
an otherwise valid receipt Unfiled; invalid source admission still fails.
No late home copy, propagation or retry reinitialization follows.

Retain empty-only folder removal after explicit finite Move, complete hidden/
historical membership checks and actual source/operator Move/Unfile or proven-
stale-reference recovery. Keep labels distinct from acceptance and invalid
view predicates repairable without silent broadening. Initially private ordinary
views and qualified source/system views remain; shared-view audience requires
its separate owner-qualified decision and is not removed from product coverage.

All mutation paths preserve exact scope, current authority, expected state,
all-or-none finite Move, coherent restricted history, safe privileged/RLS paths
and durable replay-or-stale rejection. No routine notification, new policy/
hierarchy engine, broad read grant or general drive follows. Native source,
database, race, workload, migration/restore and composed accessible user proofs
remain required. Ratification is not qualification or activation.

Formal owner/OpenSpec publication remains /to-prd; tickets remain /to-issues.
Q43 research will identify the next current evidence and meaningful choice.
