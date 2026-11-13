# Core factory Console · VM 100

Thin owner-only Next.js operator Console for the Core factory: one pinned
Archon **0.14.0** engine (`core-archon`, guest loopback `127.0.0.1:39190`) plus
the installed Core pack (`scripts/archon-factory/pack`). Archon executes and
persists everything. The Console is a read model and a control surface over
that backend: it keeps **no** factory state, scheduler, queue, database,
browser-held record or second backend.

## Backend contract

| Need                                                                        | Source                                              | How the Console reaches it                                                                                                                               |
| --------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine health, runs, run detail (node states + lifecycle events), artifacts | Archon HTTP API                                     | `GET /api/health`, `/api/dashboard/runs`, `/api/workflows/runs/{id}`, `/api/runs/{id}/artifacts` (`src/server/archon.ts`)                                |
| Durable factory state                                                       | Archon state documents in project `_folder/control` | spawns `archon state get <name> --project _folder/control` / `archon state list --prefix <p> --values --project _folder/control` (`src/server/state.ts`) |
| Every operator effect                                                       | `.shared/control.mjs`                               | spawns `node control.mjs <command> … --request <id> --by <owner>` and parses its one JSON line (`src/server/control.ts`)                                 |

Spawning always uses an argv array (never a shell), an explicit minimal
environment (`ARCHON_HOME`, `ARCHON_USER_ID`, `CLAUDE_CONFIG_DIR`, `HOME`,
`PATH`, `CORE_FACTORY_CONFIG`; no Console variable is inherited), a
bounded timeout and bounded output. `CLAUDE_CONFIG_DIR` is the owner's Claude
profile (`FACTORY_CLAUDE_PROFILE`): `control.mjs` verifies the retained
identity for retry, reopen, release and adopt-policy only in that environment. Failures report _unavailable_ with a fixed message; stderr
and paths never reach the browser. Documents are parsed with zod schemas in
`src/lib/factory.ts` that select fields (everything else, e.g. profile digests,
is stripped) and every string is scrubbed for credentials and private paths.
Node events are reduced to lifecycle timing and the model the engine reports;
node outputs and structured outputs (which hold unsealed review findings) are
never forwarded. Deliberately stripped as well: the profile digests a retry,
reopen or release records (only that the profile was re-bound is shown; the
policy revisions are shown), the run's start head, the PR's GraphQL node id,
and each feedback disposition's comment identity (`lastComment`) and GitHub
update time, which only let readiness notice a newer reply.

## Journeys

| #   | Journey                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Reads                                                                                                               | Writes                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | **Overview**: running / next / blocked / needs you / completed recently; factory mode, intake, merge hold; Samson's last selection as timestamped facts                                                                                                                                                                                                                                                                                                                           | `core/factory`, `core/scope`, `core/issues/*`, `core/selection`, `core/attention`, engine runs + live round details | factory controls                                                                       |
| 2   | **Live work map**: one lane per live or pending issue; the round's role steps (claim, scope, define, build, freeze, parallel Micaiah/Luke reviews, assess, conditional adjudication, final, publish, feedback, readiness, record) derived from the run's real node states; repair/oracle returns from history; accessible list view                                                                                                                                               | `core/issues/*` + `GET /api/workflows/runs/{id}`                                                                    | —                                                                                      |
| 3   | **Phases & issues**: the authorized scope (the phase), counts (not admitted / pending / active / waiting / blocked / PR ready / merged / stopped), filterable issue table                                                                                                                                                                                                                                                                                                         | `core/scope`, `core/issues/*`                                                                                       | assign scope                                                                           |
| 4   | **Issue detail**: request link, assignment, protected-path authorization, brief, acceptance + revision, candidate/base/branch, work and feedback rounds, parked areas, last refused claim, sealed review decisions, final acceptance, PR and readiness (who merged, merge request, pending base integration, closeout), round history (parked, reconciled, merged outside the factory), feedback dispositions with fix state, operator requests with policy re-binding, run links | `core/issues/<n>`, `core/issues/<n>/feedback`, `core/scope`                                                         | hold / release / stop / retry / reopen / reconcile, prioritize, cancel the current run |
| 5   | **Agents & runs**: running nodes with role, run id, model when reported, node start from server event timestamps, waiting (paused / cooldown) vs running; paged run list; run detail with node table, lifecycle events and artifact inventory                                                                                                                                                                                                                                     | engine runs + run detail                                                                                            | cancel a run                                                                           |
| 6   | **Controls** (on the surfaces above)                                                                                                                                                                                                                                                                                                                                                                                                                                              | —                                                                                                                   | `control.mjs factory                                                                   | issue | scope | prioritize | cancel-run | analyze` |
| 7   | **Samson chat**: conversations from `core/chat/*`; send through `control.mjs ask`; pending until the `core-answer` run records the turn; proposed operations with an explicit **Apply**                                                                                                                                                                                                                                                                                           | `core/chat/*`, `core/chat/<id>`, unfinished `core-answer` runs                                                      | `ask`; Apply → the matching control                                                    |
| 8   | **Health & capacity**: engine health/slots, admitted vs capacity (the selector's `limits.admittedIssues` from `core-factory.json`; unavailable when it cannot be read), attention items, analysis reports with findings and coverage limits, **Analyze now**, usage shown as unavailable                                                                                                                                                                                          | `GET /api/health`, `core/attention`, `core/analysis`, `core/analysis/reports/<run>`                                 | `control.mjs analyze`                                                                  |

Further surfaces (all read-only, built on the server and paged there):

- **Checks & reviews** (`GET /api/console/ledger?view=evidence`): sealed
  Micaiah/Luke decisions and Ezra's final acceptance (internal), the hooked
  pre-push recorded at publication and Ezra's prescribed checks (local),
  dispositions of GitHub check runs (GitHub) and of review threads, reviews
  and PR comments (external), pending repairs with the role they return to,
  round returns and failures. Each row is current or superseded by comparing
  its bound candidate and acceptance revision with the work item's present
  head; links are built only from recorded ids (`safeHref`).
- **History & decisions** (`GET /api/console/ledger?view=history`): selector
  decisions with reasons and sources, assignments, round outcomes, deliveries
  (marked verified or not, with the reason), blocks, operator directions
  (issue, factory and scope requests, chat questions), Samson proposals and
  whether they were applied, feedback dispositions, analyst recommendations
  and analysis runs; searchable and filterable by kind on the server.
- **Performance** (`GET /api/console/performance`): verified deliveries
  (published head carries CLEAR reviews from both reviewers and a PASS final
  acceptance for the current acceptance revision), cycle time per outcome,
  waiting between rounds, rework, a modest per-owner comparison and a
  drill-down of every delivery. Below five comparable verified deliveries a
  statistic says there is not enough history instead of estimating; nothing
  is ranked by lines, tokens or a score.
- **Elapsed time** (issue sheet): issue wall time, this attempt (running,
  waiting, between steps), running vs waiting across rounds, local check time
  (freeze and publish), waiting on GitHub before feedback rounds, per-role
  totals and uncertain gaps, all from the engine's lifecycle events and the
  work item's records (`src/lib/timing.ts`). Spans are merged before they are
  measured, so parallel reviews never add up; the browser clock only extends
  intervals that are still open, so refresh, sleep or reconnect cannot reset
  a total.

### Controls: requested → observed

1. Each click first calls `POST /api/console/request-ids`; the server mints a
   request id signed with a key derived from the Console password.
2. `POST /api/console/controls {requestId, action, confirmed?}` validates the
   action (zod union), verifies the id was minted by this Console, requires
   `confirmed: true` for destructive actions (factory stop/drain, issue stop,
   cancel a run; the UI shows a confirmation dialog), then runs exactly one
   `control.mjs` command.
3. The receipt maps control.mjs's JSON to _applied_, _already applied_
   (repeated id), _requested_ (cancel accepted, run not ended yet), _started_
   (ask/analyze accepted), _refused_ (pack refusal code with an explanation),
   _incomplete_ (the run ended but labelled executor containers remain),
   _not sent_ (runner could not start) or _unknown_ (timeout, crash, ambiguous
   write, containers that could not be listed). The server then re-reads the
   target document and reports whether it records the request id.
4. _Retry_ resends the same action with the same id, which control.mjs treats
   as idempotent (ask/analyze use the id as the webhook delivery id; reusing it
   with different input is refused). A new click mints a new id.

Cancel-run is ok only once the engine reports the run ended and no executor
container labelled with the run remains. control.mjs first holds the issue
whose round the run is (so the round is not started again; release it to
resume); the receipt names the held issue, how many containers were removed
and which remain, and re-reads that issue's control. The docker error text is
never forwarded. Reconcile (`issue <n> reconcile`, not destructive) settles an
item a cancelled or unrecorded run left active once its lease has ended, or
re-arms an idle item's next round; the issue sheet disables it while the
round's lease is live and explains every refusal code (`lease-live`,
`run-not-terminal`, `run-changed`, `run-unconfirmed`, `not-active`).

Samson proposals are applied through `POST /api/console/chat/apply`: the server
re-reads the proposal from `core/chat/<id>` (the browser cannot alter it), maps
it to the control, and uses a deterministic request id derived from the
conversation and turn (no secret, so it survives a Console password change).
Before running anything the server checks the target document
(`core/factory`, `core/scope` or `core/issues/<n>`): if it records the
proposal's id, the receipt is _already applied_ and nothing runs. "Applied" is
shown only from that durable record. The pack keeps only the last 20 entries of
each document's `requests[]`; when a turn is older than the oldest retained
entry of a full history, the Console shows **Unknown: may already be applied**
and Apply requires an explicit confirmation. Reprioritize needs an
operator-chosen priority; assign-scope with `endState: unchanged` keeps the
current end state; stop/drain proposals need confirmation.

## Security boundary

- HTTP Basic auth (owner alias + ≥24-character password) on every request
  (`src/proxy.ts` and again in the route handler), exact loopback origin and
  Host, `Origin` must equal `CONSOLE_ORIGIN` for every write
  (`src/server/security.ts`). Reach it only through the owner's SSH tunnel.
- No `NEXT_PUBLIC_*` variable. Paths, executables, tokens and profiles stay on
  the server; only the store id, owner alias and codebase id are rendered.
- Text from agents is rendered as plain text (no Markdown/HTML rendering); only
  `https://github.com` links become anchors.

## Configuration

All configuration is server-side; see `.env.example` for every variable with
its VM 100 value. `FACTORY_*` defaults are built in and match VM 100, so the
VM needs only the first block (`CONSOLE_*`, `ARCHON_URL`, `ARCHON_STORE_ID`,
`ARCHON_CODEBASE_ID`) plus `FACTORY_NODE` if the control script should run with
a node other than the Console's own.

Scope owners and the admission limit have no Console setting. The server reads
`owners` and `limits.admittedIssues` from `FACTORY_CONFIG_FILE` (default
`/srv/core-factory/control/core-factory.json`), the same file it passes to
`control.mjs` as `CORE_FACTORY_CONFIG`, on every read. Only the owner aliases
and the number reach the browser. When the file or a field cannot be read, the
Console shows that value as unavailable (and refuses scope writes while the owners are unavailable); it never
substitutes a built-in owner or limit. `control.mjs` stays the writer and
refuses an owner the file does not list. A Samson scope proposal keeps the
current scope's owner, or the file's only owner when there is no scope yet.

## Commands

```powershell
cd apps/factory-console
bun run test        # vitest: adapters, factory service, routes, round derivation
bun run typecheck
bun run lint
bun run build       # standalone output for the VM service
bun run test:e2e    # Playwright against the TEST-ONLY loopback fixtures
```

`dev`/`start` bind `127.0.0.1:3092` for local work; the VM service runs the
standalone `server.js` on `127.0.0.1:39342` (`core-factory-console.service`).

## Tests and fixtures

Fixtures live only under `tests/`. Unit tests inject an in-memory state store
and a fake control runner at the `StateReader` / `ControlRunner` seams and a
synthetic Archon transport (`tests/fixtures/*`). The Playwright run starts a
loopback fixture server (`tests/native-fixture.ts`, port 39994) and points the
production build's `FACTORY_ARCHON_CLI` and `FACTORY_CONTROL_SCRIPT` at two
fake executables (`tests/fixtures/archon-cli.mjs`, `control-cli.mjs`), so the
real spawn, argv, environment and parsing paths are exercised end to end; the
fixture server rejects a call without the documented environment or project.
The fake control runner mirrors the documented control.mjs contract; it is not
the pack and proves nothing about VM 100. Live qualification is parent-owned.

The Playwright run sets the TEST-ONLY `FACTORY_FIXTURE_LABEL`, so every page
shows a "Synthetic test fixture" banner; production never sets it. The
fixture server's TEST-ONLY `POST /fixture/scale` swaps in a generated,
labeled factory of about 2,000 issues with 40-round histories
(`tests/fixtures/scale-fixture.ts`); `tests/e2e/scale.spec.ts` checks paging,
render time, overflow and bounded browser memory against it.

## Display

Shared `@asym/ui` components only (base-maia, Base UI). Dark mode uses the
shared `ThemeProvider` and `ThemeToggle` (light by default; the choice is a
per-browser display preference stored by next-themes, not factory state). The
toggle renders after mount so server HTML never contradicts the stored choice.
Following the OS preference would need the shared toggle to read the resolved
theme (a `packages/ui` change, not made here). Tab panels stay mounted (hidden when
inactive) so an in-flight chat turn, a control receipt or a same-id retry
survives switching tabs; the hidden chat panel stops polling unless a reply is
awaited. Freshness (45 s) is measured on the browser clock from when each read
arrived, so VM/browser clock skew does not matter. Controls in the issue sheet
and run dialog are also gated by the freshness of their own read.

The app icon is `src/app/icon.svg`. Any address other than `/` renders
`src/app/not-found.tsx` inside the same layout and behind the same owner
authentication; it reads nothing, runs no control and links back to the Console.

## Deliberate omissions

The Console is one owner's control surface, reached only through that owner's
SSH tunnel. As built it has none of the four things below, which the
repository's Shadscan audit expects of an application. The Shadscan ledger
(`tooling/shadscan/findings.json`) records each as a product decision bound to
this section, and `tests/shell.test.ts` fails if one of them appears without
that review.

**Status: proposed, not yet ratified.** The reasons below were written on
2026-11-12, when the Console first came under the Shadscan gate, from how the
Console is built. No earlier owner decision about them is on record. The
repository owner accepts or rejects each one: an accepted decision is noted
under "Core's intentional contracts" in `docs/guides/development/shadscan.md`,
where the product applications' decisions are recorded; a rejected one is built
and its ledger entry removed. Update this paragraph with the outcome.

- **No toast channel.** A control's outcome is the receipt rendered beside the
  control that requested it (requested → observed, above): a polite live region
  that stays on screen with its request id and a same-id Retry. A toast leaves
  on its own timer and is detached from the control and request it reports,
  which is the wrong shape for an outcome the operator may need to read again
  or retry. No toast runtime is installed, none is mounted, and no shared
  component the Console imports raises a toast, so no message is dropped for
  want of one. Shadscan's own plan marks this finding "decide", not "fix", and
  advises against mounting an unused provider for the score.
- **No command menu, so no Cmd/Ctrl+K.** The Console is a single page. Its nine
  sections are an always-visible tab list (a scrolling strip on a narrow
  screen) and every action is a visible, labeled control beside the state it
  changes. A navigation palette would only repeat those nine tabs; an action
  palette would be a second, hidden route to controls that change what the
  factory does, away from their state and receipts. Neither is mounted, so
  there is nothing for Cmd/Ctrl+K to open. Shadscan marks this finding "decide"
  as well.
- **No dark-mode keyboard shortcut.** Dark mode is switched with the shared
  `ThemeToggle` in the header, a labeled switch reached with Tab and operated
  with Space. The Console registers no window or document key listener. A
  single-key shortcut such as D would fire for anyone typing or dictating
  outside a field unless it could be turned off or remapped (WCAG 2.1 SC
  2.1.4), and the chord Shadscan suggests instead, Cmd/Ctrl+Shift+D, already
  belongs to the browser (bookmark all tabs in Chrome, Edge and Firefox;
  Reading List in Safari).
- **No social preview image.** The Console is never published or shared:
  `robots` is `noindex, nofollow`, every page and API request needs owner
  authentication and the service binds loopback only. No crawler or link
  preview can reach the page, so there is no Open Graph or Twitter image. The
  private admin and missionary applications record the same decision.

## Not available (shown as such, never inferred)

- Waiting time across issues: history entries do not record when each round
  started (`startedAt`), so Performance says waiting is unavailable; the issue
  sheet still measures it from the engine's run records.
- GitHub check runs that Samson did not dispose of: the pack does not record
  each required check's name, conclusion, head and job link in factory state.
- Local check receipts: kept in each run's directory, not in factory state.
- Whether Samson accepted, routed or rejected an analyst recommendation: the
  attention document records open items only.
- Granting or revoking protected-path access (`control.mjs allow-protected`):
  the issue sheet shows `core/scope.allowProtected` read-only (a malformed
  grant is shown as none); the grant itself stays an operator shell action.
- Which scope or priority change a scope request made: `core/scope.requests`
  records who and when only.

- Usage: subscription allowance, context occupancy, session usage and
  API-equivalent cost have no qualified source in Archon 0.14.0 or the pack.
- Stopping a Samson reply mid-turn (no qualified entry point).
- A durable "applied" record for Samson proposals beyond the pack's 20-entry
  `requests[]` window (see above); a pack-side record (for example
  `core/applied/<proposal id>`) would remove the _unknown_ state.
- Matching an unfinished `core-answer` run to its conversation: the ask
  receipt carries no run id, and the turn's question is only recorded with
  the reply, so a pending turn is shown from the browser's in-flight request
  until the reply is recorded; after a reload only the engine's unfinished
  answer runs are shown.
