/** Authorization for a signature-verified GitHub event, before Eve starts a turn. */
const CORE = "/repos/Asymmetric-al/core";
const WRITE_ROLES = new Set(["write", "maintain", "admin"]);
const GITHUB_ACTIONS_APP_ID = 15368;

type GithubResponse = { body: unknown; status: number };
type GithubRequest = (input: {
  method: "GET";
  path: string;
}) => Promise<GithubResponse>;

export interface GithubActor {
  id: number;
  login: string;
  type: string;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function approvedCommandAppIds(value: string | undefined): Set<number> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((id) => Number.isSafeInteger(id) && id > 0),
  );
}

export async function authorizeEveGithubActor(input: {
  actor: GithubActor;
  appProof?: unknown;
  approvedAppIds?: ReadonlySet<number>;
  request: GithubRequest;
}): Promise<boolean> {
  const { actor, request } = input;
  if (!Number.isSafeInteger(actor.id) || actor.id <= 0) return false;
  if (!/^[A-Za-z0-9-]+(?:\[bot\])?$/u.test(actor.login)) return false;

  if (actor.type === "Bot") {
    const proof = record(input.appProof);
    return (
      typeof proof?.id === "number" &&
      input.approvedAppIds?.has(proof.id) === true &&
      typeof proof.slug === "string" &&
      proof.slug.length > 0
    );
  }
  if (actor.type !== "User") return false;

  try {
    const membership = await request({
      method: "GET",
      path: `/orgs/Asymmetric-al/memberships/${encodeURIComponent(actor.login)}`,
    });
    const member = record(membership.body);
    const user = record(member?.user);
    if (
      membership.status !== 200 ||
      member?.state !== "active" ||
      user?.id !== actor.id
    ) {
      return false;
    }
    const permission = await request({
      method: "GET",
      path: `${CORE}/collaborators/${encodeURIComponent(actor.login)}/permission`,
    });
    const role = record(permission.body)?.permission;
    return (
      permission.status === 200 &&
      typeof role === "string" &&
      WRITE_ROLES.has(role.toLowerCase())
    );
  } catch {
    // An unavailable Members:read or Metadata:read API fails this command only.
    return false;
  }
}

export function authorizeEveGithubCheckSuite(input: {
  appId: unknown;
  appSlug: string | null;
  conclusion: string | null;
}): boolean {
  return (
    input.appId === GITHUB_ACTIONS_APP_ID &&
    input.appSlug === "github-actions" &&
    input.conclusion === "success"
  );
}
