# Teams & Permissions (Mission Control)

The Mission Control Dashboard features a professional-grade organizational management layer, allowing for granular control over user access and team collaboration.

## 🚀 Key Features

### 1. Granular Permission Matrix

The permission system provides precise control over every module in Mission Control (CRM, Care, Contributions, etc.) using four distinct levels:

- **None**: No access to the module.
- **View**: Read-only access to module data.
- **Manage**: Ability to edit and create records within the module.
- **Admin**: Full administrative control over the module, including setting configurations.

### 2. Tab Integration

Permissions are tightly integrated with the `tiles` configuration. Every "tab" or "module" in the dashboard can be precisely controlled per team, ensuring that users only see and interact with the tools they are authorized to use.

### 3. Visual Indicators

- **ShieldCheck Icon**: Indicates Admin-level access.
- **Lock Icon**: Indicates restricted or "None" access.
- **Color-coded Badges**: Module previews in the team list show active permissions at a glance.

### 4. Advanced Team Management UI

The Teams page (`/mc/admin/teams`) uses a modern, high-fidelity interface:

- **Drill-Down Sheets**: Clicking "Manage" on a team opens a slide-over with a triple-tab surface:
  - **Permissions**: Configure the granular permission matrix for all modules.
  - **Members**: Manage team members, view roles, and handle invitations.
  - **Settings**: General team configuration and metadata.
- **Focused Profile Dropdown**: The profile dropdown has been refined (`w-64`) to focus on essential administrative routes.

## 🛠️ Implementation Details

### Files

- **Teams Page**: `src/app/(admin)/mc/admin/teams/page.tsx`
- **Admin Hub**: `src/app/(admin)/mc/admin/page.tsx`
- **Profile Dropdown**: `src/components/shadcn-studio/blocks/dropdown-profile.tsx`
- **Tile Config**: `src/config/tiles.ts`

### UI Components

The system leverages **Shadcn/UI** components for a "Vega Style" aesthetic, utilizing high-contrast **Slate/Zinc** scales for a premium feel.

## 🔐 Backend authorization foundation (2026-02)

Permission checks are enforced in two layers:

1. **BFF route/API layer (primary)** via auth middleware + server-side role checks.
2. **Database RLS (backup)** for tenant-scoped platform tables.

### Membership storage

Tenant memberships now use row-per-role storage in `authz.memberships`:

- `role`: `donor | missionary | staff`
- `staff_role`: `finance | mobilizer | development | hr | member_care` (required for `staff`)

This supports one login with multiple dashboard permissions by adding multiple membership rows for the same `user_id + tenant_id`.

### MVP policy

For MVP, **all staff sub-roles have full Mission Control dashboard access**.
The sub-role map is explicit in code so each sub-role can be narrowed to specific capabilities in later phases without changing route call sites.

---

Built with ❤️ for Mission Control.
