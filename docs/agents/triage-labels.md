# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those
roles to this repo's required issue taxonomy from
`docs/ai/rules/general.md`.

| Triage role in mattpocock/skills | Repo tracker action                                       | Meaning                                  |
| -------------------------------- | --------------------------------------------------------- | ---------------------------------------- |
| `needs-triage`                   | apply exactly one `status:todo` label                     | Maintainer needs to evaluate this issue  |
| `needs-info`                     | apply exactly one `status:blocked` label                  | Waiting on reporter for more information |
| `ready-for-agent`                | apply exactly one `status:ready` label                    | Fully specified, ready for an AFK agent  |
| `ready-for-human`                | apply exactly one `status:ready` label and assign a human | Requires human implementation            |
| `wontfix`                        | close the issue with a comment; do not create a label     | Will not be actioned                     |

Every open issue must still carry exactly one `type:*`, one `status:*`, and one
`complexity:*` label. Do not create or apply extra labels named
`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, or
`wontfix`.

When a skill mentions a role (for example, "apply the AFK-ready triage label"),
use the corresponding repo tracker action from this table.
