# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actions taken in this repo's issue tracker. Only `ready-for-agent` maps to a label (`Ready`); the other roles are expressed by comments, assignees or closing the issue.

| Label in mattpocock/skills | Action in our tracker                                                    | Meaning                                  |
| -------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| `needs-triage`             | apply no readiness label; remove `Ready` if present                      | Maintainer needs to evaluate this issue  |
| `needs-info`               | post a triage-notes comment; do not apply `Ready` (remove it if present) | Waiting on reporter for more information |
| `ready-for-agent`          | apply the `Ready` label                                                  | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | do not apply `Ready` (remove it if present); assign a human owner        | Requires human implementation            |
| `wontfix`                  | close the issue with a comment; do not create a label                    | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), take the corresponding action from this table.

Edit the "Action in our tracker" column to match whatever vocabulary you actually use.
