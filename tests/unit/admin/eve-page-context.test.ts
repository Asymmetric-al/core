import { describe, expect, it } from "vitest";
import { navigation } from "@asym/config/navigation";

import {
  buildEvePageContext,
  prepareEveSend,
} from "../../../apps/admin/app/eve/page-context";

describe("buildEvePageContext", () => {
  it.each([
    ["/help", "Help"],
    ["/settings", "Settings"],
    ["/workflows", "Workflow runs"],
    ["/workers", "Workers"],
  ])("allowlists %s", (pathname, pageIdentity) => {
    expect(
      buildEvePageContext({ panelOpen: false, pathname, tenant: null }),
    ).toMatchObject({ route: pathname, pageIdentity });
  });
  it.each(["/settings", "/settings/teams", "/settings/eve", "/settings/sites"])(
    "maps %s to the /settings Settings identity",
    (pathname) => {
      expect(
        buildEvePageContext({ panelOpen: false, pathname, tenant: null }),
      ).toMatchObject({ route: "/settings", pageIdentity: "Settings" });
    },
  );
  it.each(["/admin", "/admin/teams", "/admin/eve"])(
    "falls back to Home for retired %s paths",
    (pathname) => {
      expect(
        buildEvePageContext({ panelOpen: false, pathname, tenant: null }),
      ).toMatchObject({ route: "/", pageIdentity: "Home" });
    },
  );
  it.each(navigation)(
    "uses the navigation identity for $href without exposing record IDs",
    ({ href, title }) => {
      const context = buildEvePageContext({
        panelOpen: true,
        pathname: href === "/" ? "/" : `${href}/private-record-id`,
        tenant: null,
      });
      expect(context.route).toBe(href);
      expect(context.pageIdentity).toBe(
        href === "/settings" ? "Settings" : title,
      );
      expect(JSON.stringify(context)).not.toContain("private-record-id");
    },
  );
  it("includes only the approved route, page, organization, and safe UI fields", () => {
    const tenantWithSensitiveExtras = {
      id: "tenant-1",
      name: "Give Hope",
      slug: "give-hope",
      donor: { email: "private@example.com" },
      payment: { amount: 5000 },
    };
    const context = buildEvePageContext({
      panelOpen: true,
      pathname: "/contributions/receipt/secret-record-id",
      tenant: tenantWithSensitiveExtras,
    });

    expect(context).toEqual({
      organization: {
        id: "tenant-1",
        name: "Give Hope",
        slug: "give-hope",
      },
      pageIdentity: "Contributions",
      route: "/contributions",
      ui: {
        panel: "open",
        surface: "mission-control",
      },
    });
    expect(JSON.stringify(context)).not.toContain("private@example.com");
    expect(JSON.stringify(context)).not.toContain("secret-record-id");
    expect(JSON.stringify(context)).not.toContain("5000");
  });

  it("falls back to the dashboard identity for unknown routes", () => {
    expect(
      buildEvePageContext({
        panelOpen: false,
        pathname: "/private-record/customer@example.com",
        tenant: null,
      }),
    ).toEqual({
      organization: null,
      pageIdentity: "Home",
      route: "/",
      ui: {
        panel: "closed",
        surface: "mission-control",
      },
    });
  });
});

describe("prepareEveSend", () => {
  it("attaches the allowlisted context to every outbound turn", async () => {
    const context = buildEvePageContext({
      panelOpen: true,
      pathname: "/crm/donors/private-id",
      tenant: { id: "tenant-1", name: "Give Hope", slug: "give-hope" },
    });

    expect(
      prepareEveSend(context)({ message: "Help me with this screen" }),
    ).toEqual({
      message: "Help me with this screen",
      clientContext: context,
    });
  });
});
