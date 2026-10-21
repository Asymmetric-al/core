import assert from 'node:assert/strict';
import {hasRole, derivePrimaryRole, canAccessDashboard, STAFF_SUBROLE_CAPABILITIES} from './packages/auth/permissions.ts';
import {routeForProfileRole} from './packages/auth/roles.ts';
const checks = [];
function check(name, fn) { fn(); checks.push(name); }
const membership = (role, isActive = true, tenantId = 'tenant_a', staffRole = null) => ({tenantId, role, staffRole, isActive});
check('No coach route or primary role exists', () => {
  assert.equal(routeForProfileRole('coach'), null);
  assert.equal(derivePrimaryRole({profileRole: 'coach', memberships: []}), null);
});
check('Staff substitute reaches admin dashboard and CRM/gifts/reports capabilities', () => {
  const snapshot = {profileRole: 'donor', memberships: [membership('staff', true, 'tenant_a', 'member_care')]};
  assert.equal(canAccessDashboard(snapshot, 'admin_dashboard'), true);
  for (const cap of ['admin.crm.manage','admin.gifts.manage','admin.reports.view']) assert.ok(STAFF_SUBROLE_CAPABILITIES.member_care.includes(cap));
});
check('Inactive missionary membership alone does not defeat missionary profile fallback', () => {
  assert.equal(hasRole({profileRole: 'missionary', memberships: [membership('missionary', false)]}, 'missionary'), true);
});
check('Inactive staff membership alone does not defeat admin profile fallback', () => {
  assert.equal(hasRole({profileRole: 'admin', memberships: [membership('staff', false)]}, 'staff'), true);
});
check('Role helper has no tenant selector and unions the supplied active membership array', () => {
  const snapshot = {profileRole: null, memberships: [membership('donor', true, 'tenant_a'), membership('staff', true, 'tenant_b')]};
  assert.equal(hasRole(snapshot, 'donor'), true);
  assert.equal(hasRole(snapshot, 'staff'), true);
  assert.equal(derivePrimaryRole(snapshot), 'staff');
});
console.log(JSON.stringify({runtime:process.version,source:'actual repository pure auth modules',passed:checks.length,checks,limits:['No server, browser, database, JWT, RLS, invitation or provider behavior executed','Cross-tenant array demonstrates helper precondition only; current loaders scope to profile tenant']}, null, 2));
