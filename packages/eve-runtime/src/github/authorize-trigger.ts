/** Authorization for a signature-verified GitHub event, before Eve starts a turn. */
const CORE = "/repos/Asymmetric-al/core";
const WRITE_ROLES = new Set(["write", "maintain", "admin"]);
const GITHUB_ACTIONS_APP_ID = 15368;
// Numeric GitHub bot accounts for the installed Cursor, Codex Connector, Eve,
// and Core PR Loop Apps.
// This is used only for signed PR events, which lack performed_via_github_app.
export const APPROVED_PR_AUTOMATION_BOT_IDS: ReadonlySet<number> = new Set([
  206_951_365, 199_175_422, 299_239_962, 301_899_336,
]);

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
  approvedBotAccountIds?: ReadonlySet<number>;
  onLookupError?: (error: unknown) => void;
  request: GithubRequest;
}): Promise<boolean> {
  const { actor, request } = input;
  if (!Number.isSafeInteger(actor.id) || actor.id <= 0) return false;
  if (!/^[A-Za-z0-9-]+(?:\[bot\])?$/u.test(actor.login)) return false;

  if (actor.type === "Bot") {
    const proof = record(input.appProof);
    return (
      (typeof proof?.id === "number" &&
        input.approvedAppIds?.has(proof.id) === true &&
        typeof proof.slug === "string" &&
        proof.slug.length > 0) ||
      input.approvedBotAccountIds?.has(actor.id) === true
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
  } catch (error) {
    // An unavailable Members:read or Metadata:read API fails this command only.
    if (record(error)?.status !== 404) input.onLookupError?.(error);
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
