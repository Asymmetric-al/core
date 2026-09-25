import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  findSupportAgentParticipant,
  getSupportAgentParticipant,
} from "../../../../../../apps/admin/features/support-hub/lib/participants";
import type { SupportAssignee } from "../../../../../../packages/database/collections/support-hub.schema";

const participantsPath = fileURLToPath(
  new URL(
    "../../../../../../apps/admin/features/support-hub/lib/participants.ts",
    import.meta.url,
  ),
);

const ADA: SupportAssignee = {
  id: "agent-ada",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null,
  title: "Agent",
};

describe("Support Hub agent participant lookup", () => {
  it("does not read a collection toArray snapshot", () => {
    const source = readFileSync(participantsPath, "utf8");

    expect(source).not.toContain("toArray");
    expect(source).not.toContain("supportAgentsCollection");
  });

  it("maps a matching agent into a participant envelope", () => {
    expect(findSupportAgentParticipant([ADA], "agent-ada")).toEqual({
      id: "agent-ada",
      role: "agent",
      name: "Ada Lovelace",
      email: "ada@example.com",
      avatarUrl: null,
    });
  });

  it("returns undefined when the agent list does not contain the id", () => {
    expect(findSupportAgentParticipant([ADA], "agent-missing")).toBeUndefined();
  });

  it("keeps agentId first on the exported lookup", () => {
    expect(getSupportAgentParticipant("agent-ada", [ADA])?.id).toBe(
      "agent-ada",
    );
  });
});
