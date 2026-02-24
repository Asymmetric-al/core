import { expect, test } from "@playwright/test";

test.describe("Demo auth preflight", () => {
  test("donor demo account is configured and sign-in endpoint returns session cookie", async ({
    request,
  }) => {
    const availabilityResponse = await request.get("/api/auth/demo-account");
    expect(availabilityResponse.ok()).toBeTruthy();

    const availabilityPayload = (await availabilityResponse.json()) as {
      availableRoles?: Partial<Record<"donor", boolean>>;
    };

    expect(availabilityPayload.availableRoles?.donor).toBe(true);

    const signInResponse = await request.post("/api/auth/demo-account", {
      data: { role: "donor" },
    });
    expect(signInResponse.ok()).toBeTruthy();

    const setCookie = signInResponse.headers()["set-cookie"];
    expect(typeof setCookie).toBe("string");
    expect(setCookie?.length ?? 0).toBeGreaterThan(0);
  });
});
