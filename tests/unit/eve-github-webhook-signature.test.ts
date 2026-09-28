import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

const eveRequire = createRequire(
  path.resolve("packages/eve-runtime/package.json"),
);
const { githubChannel } = await import(
  eveRequire.resolve("eve/channels/github")
);

describe("Eve GitHub webhook ingress", () => {
  it("rejects an invalid signature before dispatching a command", async () => {
    const onComment = vi.fn(() => null);
    const channel = githubChannel({
      botName: "eve-test",
      credentials: { webhookSecret: "test-secret" },
      onComment,
    });
    const route = channel.routes?.find((candidate) =>
      candidate.path.endsWith("/github"),
    );
    if (!route) throw new Error("GitHub webhook route is missing");
    const send = vi.fn();
    const response = await route.handler(
      new Request("https://example.test/eve/v1/github", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-github-event": "issue_comment",
          "x-github-delivery": "invalid-signature",
          "x-hub-signature-256": "sha256=invalid",
        },
        body: "{}",
      }),
      { send, waitUntil: vi.fn() } as never,
    );
    expect(response.status).toBe(401);
    expect(onComment).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
