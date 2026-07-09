# Triage Labels

The skills speak in terms of two category roles and five state roles. This file
maps those roles to this repo's required issue taxonomy from
`docs/ai/rules/general.md`.

## Category roles

| Triage category in mattpocock/skills | Repo tracker action                                       | Meaning                    |
| ------------------------------------ | --------------------------------------------------------- | -------------------------- |
| `bug`                                | apply exactly one `type:bug` label                        | Something is broken        |
| `enhancement`                        | apply exactly one matching repo `type:*` label; see below | New feature or improvement |

For `enhancement`, classify the requested work rather than the source wording:
use `type:feature` for product or capability changes, `type:docs` for
docs-only work, `type:refactor` for behavior-neutral refactors, and
`type:chore` for repo maintenance that is neither feature, docs, nor refactor.

## State roles

| Triage state in mattpocock/skills | Repo tracker action                                       | Meaning                                  |
| --------------------------------- | --------------------------------------------------------- | ---------------------------------------- |
| `needs-triage`                    | apply exactly one `status:todo` label                     | Maintainer needs to evaluate this issue  |
| `needs-info`                      | apply exactly one `status:blocked` label                  | Waiting on reporter for more information |
| `ready-for-agent`                 | apply exactly one `status:ready` label                    | Fully specified, ready for an AFK agent  |
| `ready-for-human`                 | apply exactly one `status:ready` label and assign a human | Requires human implementation            |
| `wontfix`                         | close the issue with a comment; do not create a label     | Will not be actioned                     |

Every open issue must still carry exactly one `type:*`, one `status:*`, and one
`complexity:*` label. Preserve an existing `complexity:*` label. If no
complexity is present and there is not enough evidence to classify it, apply
`complexity:medium` as the triage default and call that out in the triage note.
Do not create or apply extra labels named `bug`, `enhancement`, `needs-triage`,
`needs-info`, `ready-for-agent`, `ready-for-human`, or `wontfix`.

When a skill mentions a role (for example, "apply the AFK-ready triage label"),
use the corresponding repo tracker action from this table.
