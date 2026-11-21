import { vi } from "vitest";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    log: vi.fn(),
    logDonation: vi.fn(),
    logPost: vi.fn(),
    logRoleChange: vi.fn(),
  })),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(
    (
      context: {
        isAuthenticated?: boolean;
        userId?: string | null;
        tenantId?: string | null;
        role?: string | null;
        profileId?: string | null;
      },
      roles: string[],
    ) => {
      if (
        !context?.isAuthenticated ||
        !context.userId ||
        !context.tenantId ||
        !context.role ||
        !context.profileId
      ) {
        throw new Error("Unauthorized");
      }
      if (!roles.includes(context.role)) {
        throw new Error(`Forbidden: requires one of ${roles.join(", ")} role`);
      }
    },
  ),
}));

vi.mock("../../src/stripe/tenant-client", () => ({
  resolveTenantStripe: vi.fn(),
}));

vi.mock("../../src/donate/saga", () => ({
  processDonationSagaOutboxEvent: vi.fn(),
}));

vi.mock("../../src/money/settlement", () => ({
  resolveTenantSettlementCurrency: vi.fn(),
}));
