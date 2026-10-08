# Commercial ReUI Pro source in Core

Actual `base-maia` Pro settings source is integrated into shared Core modules,
then consumed by donor and missionary settings. This source is commercial;
it is not covered by [the public ReUI MIT notice](./LICENSE-ReUI-MIT.md).

The [repository owner’s confirmation](../../../guides/development/reui-source-license.md)
states that a separate agreement permits public AGPL source distribution and
contributor access. The agreement document was not supplied or independently
reviewed. Account authentication proves registry/MCP access separately from
this distribution permission. No credential or private agreement text is stored
in these artifacts.

| Source file                              | Exact source SHA256                                                | Core derivative                                                                                                  | Adaptation                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| settings-7/account-settings.tsx          | `857150c8ecf673f36b84be5771817321ac6abe9d9624ca7210515156caabbf61` | [SettingsLayout](../../../../packages/ui/components/settings/settings-layout.tsx)                                | Controlled responsive rail uses existing Base UI Tabs, stable initial markup and Core 1024px desktop hook. Existing caller panels and their mounting rules remain. |
| settings-7/settings-card.tsx             | `6358f4ece0e4edd29965f47124e82925ac3ac4421bd98b088d459f6ded03359a` | [SettingsCard](../../../../packages/ui/components/settings/settings-card.tsx)                                    | Header/content/optional footer anatomy uses existing default Maia Card slots, responsive footer and ReactNode content. Vendor appearance overrides are removed.    |
| settings-11/notification-preferences.tsx | `66d1ad091745e6c90695f91e09350794a77d0c074772eb76b583bf21092eee0b` | [NotificationPreferencesMatrix](../../../../packages/ui/components/settings/notification-preferences-matrix.tsx) | Named table and scoped row/channel headers preserve current app-controlled Switches, icons, IDs, descriptions, values and local Save behavior.                     |

Donor uses the responsive rail and six card sections. Missionary uses five card
sections and the six-category In-app/Email/SMS matrix. Existing fields,
validation, exact patch payloads, pending/error/retry state, dirty/Save behavior,
conditional tab panels and unfinished prototypes remain app-owned. Vendor
records, billing/account engines, uncontrolled Checkbox state, upload hooks,
providers and appearance forks are omitted.

Actual paid app-shell-18 source was also fetched and inspected. Core retains its
existing shell because that task-demo/AI panel/theme composition does not fit
forced-light, tenant/permission, provider, Eve/Web Studio and routing boundaries.
This is a fit/compatibility decision, not a remaining licensing block.

[Registry research](./reui-pro-research.json) preserves exact payload/source
hashes, dependency metadata, verified install commands, previews and usage
validation. [Derivative mappings](./reui-pro-settings.json) preserve current
Core hashes, attribution, public exports, consumer files, focused tests and
adaptation limits. All three derivative hashes were checked against actual
source bytes at integration. No wholesale registry output was accepted.

Canonical shared typecheck and the 103-file/461-test shared suite passed after
Pro integration. Donor’s integration suite passed 28 files/170 tests; later
checkout, History and public-header focused checks are separately recorded.
Missionary’s latest scoped suite passed 47 files/250 tests, including Pro settings
and the Giving card. These owner runs overlap and are not an aggregate total.
Runtime-owned indexes establish only actual captured states and limits; final
recapture and delivery gates must be read from those records, not inferred from
MCP validation or a source hash.
