# Eve runtime package

This package uses Eve 0.25.1. Before changing Eve-authored files, read the
relevant installed guide under `node_modules/eve/docs/`; installed package docs
are the API source of truth.

Keep this package isolated from `apps/admin`, `apps/donor`, and
`apps/missionary` until issue #428 proves and owns the admin mount. Shared
server boundaries from `@asym/api` are allowed. The runtime must remain
disabled by default and may not introduce a live model, provider, tool,
sandbox, or production effect without the applicable accepted OpenSpec change
and governance gate. Route auth and session ownership must fail closed outside
the loopback-only deterministic verification path.
