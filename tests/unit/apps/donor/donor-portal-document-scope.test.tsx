// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import {
  isValidElement,
  Suspense,
  type ReactElement,
  type ReactNode,
} from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthContextModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

/**
 * The donor portal renders inside a document scope taken from the person's
 * one live donor membership (WP2b, AL-2675; plan 12, WP2 "Interim rules until
 * WP3"), so the own-API wrapper, the browser client and the query cache read
 * the same scope as in Mission Control and the missionary workspace. The role
 * gate stays in the layout as defence in depth behind the proxy, which
 * remains the primary gate.
 *
 * Council round 1 on slice B, SB10: this reads what the layout returns, not
 * its source. The layout's element tree is walked, its async gate is called
 * with the request's auth context, and the skeleton frame is rendered.
 */

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContextModule>()),
  getAuthContext: h.auth,
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  redirect: h.redirect,
}));
// The header's own behaviour has its own suites; here it is a marker.
vi.mock(
  "../../../../apps/donor/features/donor/components/donor-portal-header",
  () => ({ DonorPortalHeader: () => null }),
);

import { PortalDocument } from "@asym/auth/portal-document";
import { RetainedDraftPageTenant } from "@asym/ui/hooks";

import DonorDashboardLayout from "../../../../apps/donor/app/(dashboard)/donor-dashboard/layout";
import { DonorPortalFrameSkeleton } from "../../../../apps/donor/app/(dashboard)/donor-dashboard/donor-portal-frame-skeleton";
import { DonorPortalHeader } from "../../../../apps/donor/features/donor/components/donor-portal-header";

const USER = "00000000-0000-4000-9000-0000000000d1";
const TENANT = "00000000-0000-0000-0000-000000000001";
const ROW = "00000000-0000-4000-8000-0000000000d1";

function donorAuth(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    isAuthenticated: true,
    userId: USER,
    email: null,
    tenantId: TENANT,
    role: "donor",
    profileId: "00000000-0000-4000-8000-0000000000d9",
    memberships: [
      {
        tenantId: TENANT,
        role: "donor",
        staffRole: null,
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: {
      assignmentId: ROW,
      userId: USER,
      tenantId: TENANT,
      revision: "1",
      membershipRole: "donor",
      staffRole: null,
      isTenantAdmin: false,
    },
    assignmentDenial: null,
    ...overrides,
  } as AuthContext;
}

/** Every element in `node`'s subtree, through `children` only. */
function elementsIn(node: ReactNode): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap(elementsIn);
  if (!isValidElement(node)) return [];
  const children = (node.props as { children?: ReactNode }).children;
  return [node, ...elementsIn(children)];
}

const page = <p>the page</p>;

function layoutTree() {
  const tree = DonorDashboardLayout({ children: page });
  const boundary = elementsIn(tree).find((el) => el.type === Suspense);
  expect(boundary, "the layout's Suspense boundary").toBeDefined();
  const props = boundary!.props as { fallback: ReactNode; children: ReactNode };
  const gate = props.children as ReactElement<{ children: ReactNode }>;
  return { tree, boundary: boundary!, fallback: props.fallback, gate };
}

async function openGate(gate: ReactElement<{ children: ReactNode }>) {
  const render = gate.type as (props: {
    children: ReactNode;
  }) => Promise<ReactElement>;
  return render(gate.props);
}

beforeEach(() => {
  h.auth.mockReset();
  h.redirect.mockClear();
});
afterEach(() => cleanup());

describe("the donor portal layout", () => {
  it("renders the header and the pages behind one boundary, with the skeleton frame as its fallback", () => {
    const { tree, boundary, fallback, gate } = layoutTree();

    expect(isValidElement(fallback) && fallback.type).toBe(
      DonorPortalFrameSkeleton,
    );
    const insideGate = elementsIn(gate.props.children);
    expect(insideGate.some((el) => el.type === DonorPortalHeader)).toBe(true);
    expect(insideGate).toContain(page);
    // Nothing that reads portal data, and no page, renders outside it.
    const outside = elementsIn(tree).filter(
      (el) => !elementsIn(boundary).includes(el),
    );
    expect(outside.some((el) => el.type === DonorPortalHeader)).toBe(false);
    expect(outside).not.toContain(page);
  });

  it("scopes the document to the donor's one live membership, and keys retained drafts by it", async () => {
    h.auth.mockResolvedValue(donorAuth());
    const { gate } = layoutTree();

    const document = await openGate(gate);

    expect(h.auth).toHaveBeenCalledWith(undefined, { roleClass: "donor" });
    expect(document.type).toBe(PortalDocument);
    const { scope, children } = document.props as {
      scope: unknown;
      children: ReactNode;
    };
    expect(scope).toEqual({
      userId: USER,
      tenantId: TENANT,
      assignmentId: ROW,
      addressPrefix: "",
    });
    const scoped = elementsIn(children);
    const drafts = scoped.find((el) => el.type === RetainedDraftPageTenant);
    expect(drafts?.props).toEqual({ userId: USER, tenantId: TENANT });
    expect(scoped.some((el) => el.type === DonorPortalHeader)).toBe(true);
    expect(scoped).toContain(page);
  });

  it.each([
    [
      "a signed-out visitor goes to sign in",
      donorAuth({ isAuthenticated: false, userId: null } as never),
      "/login?next=/donor-dashboard",
    ],
    [
      "a staff member is refused",
      donorAuth({
        role: "admin",
        memberships: [
          {
            tenantId: TENANT,
            role: "staff",
            staffRole: "development",
            isActive: true,
            isTenantAdmin: false,
          },
        ],
        assignment: null,
      } as never),
      "/no-access",
    ],
    [
      "a donor with live memberships in two tenants is refused until WP3",
      donorAuth({ assignment: null } as never),
      "/no-access",
    ],
  ])("%s", async (_case, auth, destination) => {
    h.auth.mockResolvedValue(auth);
    const { gate } = layoutTree();

    await expect(openGate(gate)).rejects.toThrow(`redirect:${destination}`);
  });

  it("holds the header's place with a frame that keeps the skip target and reads no portal data", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<DonorPortalFrameSkeleton />);

    expect(document.querySelector("main#main-content")).not.toBeNull();
    expect(
      screen.getByRole("status", { name: "Loading your portal" }),
    ).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
