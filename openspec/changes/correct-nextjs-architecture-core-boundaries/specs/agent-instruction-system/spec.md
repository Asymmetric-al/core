## ADDED Requirements

### Requirement: Architecture Skill Remaps Preserve Callable And Ownership Boundaries

Core architecture skill guidance MUST distinguish server reads from browser
hooks and callable client mutation boundaries. It MUST retain business reads,
mutations and server cache identities in the owning package, use published
contracts in Core examples, and label conflicting upstream placement as vendor
illustration. A local remap MUST be independently guarded rather than inheriting
proof from an unrelated later annotation.

#### Scenario: A client feature performs a privileged mutation

- WHEN an agent follows the Core architecture workflow
- THEN the client uses an approved hook or API route, or an authenticated Server
  Action adapter that validates input and delegates to the server owner
- AND an ordinary server export is not presented as directly client-callable

#### Scenario: A server owner renders a browser table

- WHEN a feature combines a server read and an approved browser hook
- THEN the read uses the published server contract and the hook runs in a client
  leaf without converting the server owner into a client module

#### Scenario: Server and browser caches describe related data

- WHEN the skill explains cache coordination
- THEN server tags and invalidation retain API ownership while browser keys stay
  with their client owner
- AND the API package does not import an app feature or duplicate tag strings

#### Scenario: A Core API example drifts from package exports

- WHEN an example imports a root or subpath absent from the actual export map
- THEN focused contract verification fails before the skill is accepted

#### Scenario: One local remap is removed during refresh

- WHEN a workflow, invariant or checklist annotation is removed while later
  annotations remain intact
- THEN its own bounded assertion fails
- AND upstream pins and provenance remain separate from the Core adaptation

### Requirement: Architecture References Preserve Versioned Behavior And Reviewed Refresh

Core reference recipes MUST use installed-version API contracts, distinguish
router refresh from server-cache invalidation, and state cache/metadata
prerequisites. Pending feedback MUST explicitly render its hook result;
optimistic success MUST commit canonical state. Layout guidance MUST preserve
variable-height grouping and distinguish isolated snapshots from exclusion.
Refresh MUST verify a reviewed immutable source with a pinned installer before
canonical copying, retain Core adaptations, and regenerate all required mirrors.
Raw upstream hashes MUST remain separate from adapted canonical content.

#### Scenario: Optimistic work succeeds or fails

- WHEN the reference mutation transition completes
- THEN success retains the canonical returned value and failure returns to the
  unchanged authoritative base with accessible error feedback
- AND a successful payload-bearing action cannot omit its declared data

#### Scenario: Navigation pending feedback is rendered

- WHEN a Link descendant consumes the pending hook result
- THEN the application explicitly adds or removes its pending attribute
- AND the hook is not described as mutating the DOM automatically

#### Scenario: Reviewed upstream content is refreshed

- WHEN a maintainer prepares a refreshed skill source
- THEN its exact commit and raw tree are verified before canonical replacement
- AND Core adaptations, source provenance and required Codex/Cursor/Claude
  mirrors survive validation without a floating installer or source reference
