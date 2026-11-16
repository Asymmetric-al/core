# Care Hub (Member Care)

The Care Hub is the Mission Control module for member care: contact history,
care goals and requirements, attention flags and private notes for
missionaries and other personnel.

## Where it lives

| Layer               | Path                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Routes              | `apps/admin/app/(app)/care` (`/care`, `/care/directory`, `/care/directory/[id]`, `/care/settings`)                      |
| UI, hooks, types    | `apps/admin/features/mission-control/care/` (`components/`, `hooks/use-care.ts`, `member-care.*.ts`)                    |
| API routes          | `apps/admin/app/api/admin/member-care/{activity,attention,dashboard,directory,goals,private-notes,requirements,thread}` |
| Reads               | `packages/api/src/reads/member-care.ts` (cached; directory capped at `MEMBER_CARE_DIRECTORY_LIMIT`, 250)                |
| Commands and access | `packages/api/src/admin/member-care/` (`mutations.ts`, `private-notes.ts`, `route-helpers.ts`)                          |

## Rules that apply here

- Access: member-care API routes call `requireMemberCareAccess`, which
  requires an authenticated user with a tenant and a `staff`, `admin` or
  `super_admin` role; the private-notes route instead uses `withOperation`
  with the same three roles. Keep tenant scoping on every read and write.
- Writes go through the Zod schemas and commands in
  `packages/api/src/admin/member-care/mutations.ts`; route handlers only parse
  the request and call them.
- Dashboard notifications and priorities are derived on the client from the
  loaded personnel data (`member-care.derived.ts`); they are not stored or
  sent anywhere.
- Date helpers (`daysSince`, `formatDate`, `isOverdue`) live in
  `apps/admin/features/mission-control/care/utils.ts`; reuse them rather than
  adding per-component date math.
