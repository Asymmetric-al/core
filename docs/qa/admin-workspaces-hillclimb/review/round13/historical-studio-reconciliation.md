# Historical Round 12 Web Studio review reconciliation

Collected 2026-11-12 from completed task `2987c522-b18b-4ac0-9afd-7ee02614a28b`. The review compares round11 with round12 in the original frozen checkout; it explicitly excludes the current implementation worktree. Its preference for A is historical and supplies no Round 13 score or acceptance.

## Account blocker: subsequent evidence

The historical reviewer rejected B primarily because Account rendered a generic error page. Round 13 source now distinguishes Payload's route invocation from its form invocation in `apps/admin/src/cms-ui/web-studio/shell/studio-account-view.tsx:37`, and uses `contentAs="div"` for the enclosing Studio layout.

Existing `runtime-account-dom.json` records the real hydrated route on candidate port 3031: Account form and preferences present, no error boundary, one visible Account heading, one visible unnested main, no page overflow. `candidate-13-preflight/` contains native Account screenshots at 1440, 1024, 640 and 390. This addresses the recorded render blocker; preference saves and full production identity integration remain unverified.

## Important finding still present

`apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView.tsx:208` returns an empty set when the secondary published-version request fails. Its catch does likewise at line 221. The status derivation at line 268 treats absence from that set as Draft. A failed lookup can therefore remove the Changed distinction for a draft with a published predecessor, without displaying uncertainty.

After the active frozen-source captures finish, add a red/green regression at the existing missionary hub seam for HTTP and transport failures of the versions lookup. Preserve a visible unknown/unavailable status and retry path rather than asserting Draft. Retain working directory data and existing protections against duplicate page creation. Refreeze and recapture affected evidence after any fix.

## Remaining reconciliation

- Public-address preservation has a separate completed Round 13 implementation and report in `max/published-link-fix.md`. Actual published-to-draft-to-new-publication browser proof remains required.
- The historical selected-template validation and directory pagination improvements already belonged to B; do not reintroduce A's permissive template gate or fixed first-200 directory request.
- Intermediate-width table pressure and mobile gallery efficiency require current screenshots. Round 13 builders changed grid widths and template previews, so historical screenshots cannot certify current behavior.
- Bulk-publish confirmation scope was a polish observation without demonstrated wrong-scope mutation. Inspect the current confirmation during visual acceptance before adding work.
- The secondary version failure is distinct from the primary giving-page error scenario; existing primary-error screenshots do not establish its handling.

No product source changes, new captures or new test runs were made for this reconciliation. Candidate source remains frozen for the active evidence collectors.
