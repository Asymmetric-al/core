# Design

The roster uses the existing shared table's manualPagination option with hidden
pagination controls because the API already owns incremental page loading.

Profile and tag updates keep their tenant, missionary and donor predicates and
add a JSONB containment predicate requiring the explicit boolean false recipient
anonymity preference. This matches the current donor-row redactor, rejects
missing/null/malformed preferences, and evaluates alongside the write rather
than introducing a read-then-write authorization race. The server never trusts
the UI's is_anonymous flag. Other donor/task/activity authorization is unchanged.

The view-model rejects opening/saving these edits for anonymous rows, and current
row visibility controls open dialogs after a refresh. Shared Base UI primitives
and exact base-maia remain the UI owners. Tests use the actual roster/shared
table and view-model plus deterministic server update predicates; no live data
or provider writes are needed.

The detail header retains the existing partner type and missing-location fallback.
Tag selection uses the installed FieldSet, FieldLegend and Checkbox components;
the activity selector uses the installed Base UI ToggleGroup array-value API.
The existing empty states, cards and button loading content compose the shared
components. Extracted feature styles use semantic theme tokens. These are local
compositions: shared primitives, theme defaults and their APIs remain unchanged.

Behavioral tests mount the actual provider and components to select tags, choose
an activity type, locate accessible contact actions and read the header metadata.
Existing source checks retain privacy/mutation boundaries and explicitly check
manual pagination; obsolete raw-color/pressed-chip assertions follow the new
semantic-token and checkbox contract. No assertion is removed to mask a defect.

The shared Tabs component owns panel visibility. Removing a redundant
AnimatePresence wrapper avoids duplicate child identities, verified by switching
real panels and observing React errors. Compact viewports wrap the five detail
tabs into three columns so labels stay readable without document overflow.

The focused browser harness imports the actual provider, roster, detail, stats
and shared components with the application's MotionProvider and theme CSS.
Only data/auth hooks and mutation/provider I/O use local fixtures. It exercises
keyboard selections, dialog Escape/focus restoration, loaded row fifteen, tab
visibility and an anonymity refresh. This component browser proof does not
replace final Next.js/auth/API integration gates on the coordinator's latest base.
