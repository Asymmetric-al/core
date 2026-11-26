import { isLoopbackDatabaseUrl } from "../../../../packages/env/src/database-url.mjs";
import { requireDisposableDatabase } from "../../../../scripts/lib/environment-marker.mjs";

type RequireDisposable = (options: {
  databaseUrl: string;
  action: string;
}) => unknown;

type RoleClient = {
  query(text: string): Promise<unknown>;
  escapeLiteral(value: string): string;
};

const ROLE = /^[a-z_][a-z0-9_]{0,62}$/;

export function requireDisposableAdmin(
  adminUrl: string,
  requireDisposable: RequireDisposable = requireDisposableDatabase,
): void {
  if (!isLoopbackDatabaseUrl(adminUrl)) {
    throw new Error(
      "This suite changes the password of a role, which belongs to the whole cluster (D-34), so it runs only on a loopback database address; TENANT_GUARD_IT_ADMIN_DATABASE_URL names another.",
    );
  }
  requireDisposable({
    databaseUrl: adminUrl,
    action: "change a cluster-wide role's password from",
  });
}

export async function setDisposableRolePassword({
  adminUrl,
  client,
  role,
  password,
  requireDisposable = requireDisposableDatabase,
}: {
  adminUrl: string;
  client: RoleClient;
  role: string;
  password: string | null;
  requireDisposable?: RequireDisposable;
}): Promise<void> {
  if (!ROLE.test(role)) throw new Error("The role must be a plain role name.");
  requireDisposableAdmin(adminUrl, requireDisposable);
  await client.query(
    `ALTER ROLE ${role} PASSWORD ${password === null ? "NULL" : client.escapeLiteral(password)}`,
  );
}
