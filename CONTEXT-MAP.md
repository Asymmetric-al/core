# Context map

Domain language and architectural decisions are scoped per feature area. Engineering skills (`diagnose`, `tdd`, `improve-codebase-architecture`, `grill-with-docs`, etc.) should read this map before exploring code.

| Context ID                            | When to use                                                                                                                      | `CONTEXT.md`                                                                                                                   | ADRs                                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `mission-control/contribution-detail` | Mission Control contribution detail UI/API, gifts, donations, designation lines, receipts, correction approval, CRM gift history | [`docs/features/mission-control/contribution-detail/CONTEXT.md`](docs/features/mission-control/contribution-detail/CONTEXT.md) | [`docs/features/mission-control/contribution-detail/docs/adr/`](docs/features/mission-control/contribution-detail/docs/adr/) |

## Adding a context

1. Add a row to the table above with a stable context ID (use `/` for nesting, e.g. `area/feature`).
2. Create or maintain `CONTEXT.md` and `docs/adr/` at the paths you list.
3. No change to `CLAUDE.md` is required — agents discover contexts through this map and [`docs/agents/domain.md`](docs/agents/domain.md).
