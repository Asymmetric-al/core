# Shared packages

Workspace packages imported by the apps as `@asym/<name>` with `workspace:*`
dependencies. Packages with their own `AGENTS.md` have local rules; read them
before editing.

| Package       | Owns                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `api`         | Server business logic and data access called by thin app route handlers (`AGENTS.md`)                                        |
| `auth`        | Authentication, sessions and the shared proxy middleware (`AGENTS.md`)                                                       |
| `database`    | Supabase clients, generated types, approved browser collections and hooks (`AGENTS.md`)                                      |
| `ui`          | Shared `base-maia` UI components, tokens and fonts (`AGENTS.md`)                                                             |
| `env`         | Environment schema and validation (`README.md`)                                                                              |
| `email`       | Email rendering and Resend delivery (`README.md`)                                                                            |
| `eve-runtime` | Product Eve agent runtime (`AGENTS.md`)                                                                                      |
| `lib`         | Cross-app utilities and hooks                                                                                                |
| `config`      | Shared site, navigation and studio configuration                                                                             |
| `missionary`  | Missionary workspace components used by `apps/missionary` (`apps/admin` declares the dependency but imports nothing from it) |
| `graphql`     | GraphQL handler used by the donor app                                                                                        |
| `mock-data`   | Demo fixtures (`docs/guides/development/mock-data.md`)                                                                       |

Lint and TypeScript configuration packages live in `tooling/*`.
