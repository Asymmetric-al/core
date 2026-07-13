# Triage Labels

The skills speak in terms of two category roles and five state roles. This file
maps those roles to the actual labels or tracker actions used in this repo.

## Category roles

| Role in mattpocock/skills | Label/action in our tracker | Meaning                    |
| ------------------------- | --------------------------- | -------------------------- |
| `bug`                     | `bug`                       | Something is broken        |
| `enhancement`             | `enhancement`               | New feature or improvement |

## State roles

| Role in mattpocock/skills | Label/action in our tracker | Meaning                                  |
| ------------------------- | --------------------------- | ---------------------------------------- |
| `needs-triage`            | `needs-triage`              | Maintainer needs to evaluate this issue  |
| `needs-info`              | `needs-info`                | Waiting on reporter for more information |
| `ready-for-agent`         | `ready-for-agent`           | Fully specified, ready for an AFK agent  |
| `ready-for-human`         | `ready-for-human`           | Requires human implementation            |
| `wontfix`                 | `wontfix`                   | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the
corresponding label or action from this table.

Edit the right-hand column to match whatever vocabulary you actually use. If a
role is represented by an action rather than a label, write the action here.
