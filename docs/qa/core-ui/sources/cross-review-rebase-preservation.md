# Independent rebase preservation review

No introduced material source issue found in seven rebase overlaps or preserved mobile/Pro consumers.

Reviewed upstream `180dde9e41b849e0c3a649aeef8989f3974bf4cd` to integrated application `0cc25be9c47b5fd3ab739f8cf18c33bde3b90bb3`. Pre-rebase UI reference `5319246eb709a58b4f01d3cbce824087aeef7b3e`.

Independent read-only diff/source/contract assertion review plus exact Git blob and SHA256 identity checks. No source edits or new test/browser/build/lint execution; parent owns post-integration canonical preflight.

- apps/admin/app/(app)/crm/page-client.tsx: Only imports and CrmViewToolbar export/rendering differ. Query client, drawer snapshot resolution, URL donor/gift state, invalid gift cleanup, gift opener focus restoration and refresh logic retained.
- apps/admin/features/mission-control/care/components/TimezoneScheduler.tsx: useSyncExternalStore clock initialization, SSR null snapshot, ticking/cleanup, timezone Intl formatters and9..17 working-hours calculation retained; responsive/tokenized markup differs.
- apps/admin/features/support-hub/components/settings/assignment/AssignmentRulesForm.tsx: Assignment record/version reset, local edits/discard and save identity/payload retained; two explanatory foreground tokens differ.
- apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview.tsx: Loaded first-conversation default, stable selected ID through reorder, rule evaluation/explicit choice/Pick another retained; result/status/caption tokens and typography differ.
- apps/admin/features/support-hub/components/settings/inbox/InboxSettingsForm.tsx: Equivalent cache snapshots preserve draft; changed persisted record resets version/draft before commit. Field values, save/discard/payload retained; explanatory foreground tokens differ.
- apps/admin/features/support-hub/components/settings/notifications/NotificationPreferencesForm.tsx: Default/current agent and stable selection through reorder retained; drafts scoped by agent/persisted preference version, save/discard/payload and six switches unchanged. Border/foreground/caption styling differs.
- apps/admin/features/support-hub/components/toolbar/InboxToolbar.tsx: Persisted-query reset and200ms draft debounce/cleanup unchanged. InputGroup preserves controlled input, accessible name, value/onChange and immediate clear callback. URL filter/layout handlers unchanged.

All 7 upstream regression test files and Contributions/Email page-client files are byte-identical to upstream. Donor/missionary/shared component source and test files are byte-identical to the reviewed pre-rebase UI; the listed metadata/configuration changes came from upstream. All 4 Pro settings source files and explicit mobile selection/Giving/shell files retain their pre-rebase hashes.

Installed Base UI1.8.0 ToggleGroup multiple=false default supports controlled CRM[value]. Empty deselection ignored to preserve existing view. InputGroupAddon ignores descendant button clicks and forwards controlled Input props.

All frozen final screenshot captures are Next16.3.8 pre-integration evidence. No Next16.4 runtime verification executed by this reviewer; source preservation and forthcoming canonical checks remain separate.

Exact file hashes/blobs and tests are recorded in the JSON companion.
