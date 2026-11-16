# Applications

Each directory is an independent Next.js App Router application. Read its
`AGENTS.md` before changing it.

| App               | Package                 | Dev port | Surface                                                                                                    |
| ----------------- | ----------------------- | -------: | ---------------------------------------------------------------------------------------------------------- |
| `admin`           | `@asym/admin`           |     3030 | Mission Control (staff operations) and Payload CMS / Web Studio                                            |
| `donor`           | `@asym/donor`           |     3000 | Public ministry website (`app/(public)`) and donor portal (`app/(dashboard)/donor-dashboard`)              |
| `missionary`      | `@asym/missionary-app`  |     4000 | Missionary workspace                                                                                       |
| `factory-console` | `@asym/factory-console` |     3092 | Private operator console for the software factory VM (`apps/factory-console/AGENTS.md`); not a product app |

Apps own surface-specific routes and UI. Shared behavior belongs in
`packages/*` and is imported as `@asym/*`; an app never imports from another
app. Start one app with `bun run dev:<app>` or all product apps with
`bun run dev`.
