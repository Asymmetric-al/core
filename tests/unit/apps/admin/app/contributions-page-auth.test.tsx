import { isValidElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactElement, ReactNode } from "react";

const { getAuthContextMock, hasContributionPermissionMock } = vi.hoisted(
  () => ({
    getAuthContextMock: vi.fn(),
    hasContributionPermissionMock: vi.fn(),
  }),
);

type PageClientProps = {
  canManageContributions?: boolean;
};

type PageComponent = () => Promise<ReactElement>;

type AuthContextShape = {
  email: string | null;
  isAuthenticated: boolean;
  memberships: unknown[];
  profileId: string | null;
  profileRole: string | null;
  role: string | null;
  tenantId: string | null;
  userId: string | null;
};

let Page: PageComponent;

function unauthenticatedContext(): AuthContextShape {
  return {
    email: null,
    isAuthenticated: false,
    memberships: [],
    profileId: null,
    profileRole: null,
    role: null,
    tenantId: null,
    userId: null,
  };
}

function authenticatedContext(): AuthContextShape {
  return {
    email: "finance@example.com",
    isAuthenticated: true,
    memberships: [],
    profileId: "profile_1",
    profileRole: "admin",
    role: "admin",
    tenantId: "tenant_1",
    userId: "user_1",
  };
}

function assertElement(value: ReactNode): ReactElement {
  expect(isValidElement(value)).toBe(true);
  return value as ReactElement;
}

async function renderPageClientProps(): Promise<PageClientProps> {
  const pageElement = assertElement(await Page());
  const pageChildren = (pageElement.props as { children: ReactNode }).children;
  const pageClientElement = assertElement(pageChildren);

  return pageClientElement.props as PageClientProps;
}

describe("apps/admin/app/(app)/contributions/page auth gate", () => {
  beforeEach(async () => {
    vi.resetModules();
    getAuthContextMock.mockReset();
    hasContributionPermissionMock.mockReset();

    vi.doMock("@asym/auth/context", () => ({
      getAuthContext: getAuthContextMock,
    }));
    vi.doMock("../../../../../packages/auth/context", () => ({
      getAuthContext: getAuthContextMock,
    }));
    vi.doMock("@asym/api/admin/contribution-operations", () => ({
      hasContributionPermission: hasContributionPermissionMock,
    }));
    vi.doMock(
      "../../../../../packages/api/src/admin/contribution-operations/index",
      () => ({
        hasContributionPermission: hasContributionPermissionMock,
      }),
    );
    vi.doMock(
      "../../../../../apps/admin/app/(app)/contributions/page-client",
      () => ({
        default: () => null,
      }),
    );

    Page = (
      await import("../../../../../apps/admin/app/(app)/contributions/page")
    ).default as PageComponent;
  });

  it("does not expose contribution management actions to unauthenticated visitors", async () => {
    getAuthContextMock.mockResolvedValue(unauthenticatedContext());

    const props = await renderPageClientProps();

    expect(props.canManageContributions).toBe(false);
    expect(hasContributionPermissionMock).not.toHaveBeenCalled();
  });

  it("threads denied finance permission into the client page actions", async () => {
    const auth = authenticatedContext();
    getAuthContextMock.mockResolvedValue(auth);
    hasContributionPermissionMock.mockReturnValue(false);

    const props = await renderPageClientProps();

    expect(hasContributionPermissionMock).toHaveBeenCalledWith(
      auth,
      "finance:manage_contributions",
    );
    expect(props.canManageContributions).toBe(false);
  });

  it("threads granted finance permission into the client page actions", async () => {
    const auth = authenticatedContext();
    getAuthContextMock.mockResolvedValue(auth);
    hasContributionPermissionMock.mockReturnValue(true);

    const props = await renderPageClientProps();

    expect(hasContributionPermissionMock).toHaveBeenCalledWith(
      auth,
      "finance:manage_contributions",
    );
    expect(props.canManageContributions).toBe(true);
  });
});
