import { expect, test } from "@playwright/test";

import { getDemoRoleMap } from "./helpers/demo-auth";

test("demo auth availability endpoint returns a role map", async ({
  request,
}) => {
  const response = await request.get("/api/auth/demo-account");
  expect(response.ok()).toBe(true);

  const roles = getDemoRoleMap(await response.json());

  expect(roles).toBeDefined();
  expect(typeof roles?.admin).toBe("boolean");
  expect(typeof roles?.donor).toBe("boolean");
  expect(typeof roles?.missionary).toBe("boolean");
});
