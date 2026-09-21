# Domain Context Map

This repo uses feature-level domain contexts. Start here when a task asks for
domain language, ADRs, or product decisions outside the OpenSpec tree.

| Context ID          | Area                                    | Glossary / context                                              | ADR directory                                                 | Notes                                                                                                                            |
| ------------------- | --------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| contribution-detail | Mission Control contribution operations | `docs/features/mission-control/contribution-detail/CONTEXT.md`  | `docs/features/mission-control/contribution-detail/docs/adr/` | Pairs with `docs/prds/mission-control-contribution-operations/` and `openspec/changes/mission-control-contribution-operations/`. |
| support-hub         | Tenant support conversations            | `docs/prds/sitestacker-parity/phase-26-support-hub-glossary.md` | `docs/features/support-hub/docs/adr/`                         | Phase 26 specified in AL-1656; implementation pending. See `docs/features/support-hub/README.md` for authority and history.      |

When adding another feature-level glossary or ADR set, add a row here in the
same commit so agent routing never points at an unmapped context.
