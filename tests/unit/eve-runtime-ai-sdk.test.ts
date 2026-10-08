import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

const runtimeRoot = path.resolve(
  import.meta.dirname,
  "../../packages/eve-runtime",
);

// Resolve both public packages from the runtime workspace, including Eve's
// own AI peer. The child receives no provider credentials and rejects fetch.
const offlineFixture = `
let fetchCalls = 0;
globalThis.fetch = async () => {
  fetchCalls += 1;
  throw new Error("AI compatibility fixture attempted a network request");
};
const { generateText, streamText, stepCountIs, tool } = await import("ai");
const { mockModel } = await import("eve/evals");
const { z } = await import("zod");
const scenario = process.argv[1];
let result;
if (scenario === "generate") {
  const generated = await generateText({
    model: mockModel({
      modelId: "core-offline-qualification",
      respond: ({ lastUserMessage }) => ({
        text: "Verified: " + lastUserMessage,
        usage: { inputTokens: 13, outputTokens: 7 },
      }),
    }),
    prompt: "release remains disabled",
  });
  result = {
    text: generated.text,
    finishReason: generated.finishReason,
    usage: generated.usage,
    modelId: generated.response.modelId,
  };
} else if (scenario === "stream") {
  const streamed = streamText({
    model: mockModel({
      respond: ({ lastUserMessage }) => ({
        text: "Streamed: " + lastUserMessage,
        usage: { inputTokens: 11, outputTokens: 5 },
      }),
    }),
    prompt: "offline only",
  });
  const chunks = [];
  for await (const chunk of streamed.textStream) chunks.push(chunk);
  result = {
    text: await streamed.text,
    chunks,
    finishReason: await streamed.finishReason,
    usage: await streamed.usage,
  };
} else if (scenario === "tools") {
  const executedInputs = [];
  const generated = await generateText({
    model: mockModel(({ toolResults }) =>
      toolResults.length === 0
        ? { toolCalls: [{ name: "read_fixture", input: { recordId: "safe-local-record" } }] }
        : "Read: " + toolResults[0].output.recordId,
    ),
    prompt: "Read the local fixture",
    tools: {
      read_fixture: tool({
        inputSchema: z.object({ recordId: z.literal("safe-local-record") }),
        execute: async (input) => {
          executedInputs.push(input);
          return input;
        },
      }),
    },
    stopWhen: stepCountIs(2),
  });
  result = {
    text: generated.text,
    finishReason: generated.finishReason,
    steps: generated.steps.length,
    executedInputs,
  };
} else {
  throw new Error("Unknown compatibility fixture");
}
if (fetchCalls !== 0) throw new Error("The fixture attempted provider access");
console.log(JSON.stringify({ ...result, fetchCalls }));
`;

function runOfflineFixture(scenario: string) {
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", offlineFixture, scenario],
    {
      cwd: runtimeRoot,
      env: { PATH: process.env.PATH },
      encoding: "utf8",
      timeout: 15_000,
    },
  );
  if (result.error) throw result.error;
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout);
}

describe("AI SDK compatibility with Eve's offline model", () => {
  it("generates text and preserves usage from Eve's model protocol", () => {
    expect(runOfflineFixture("generate")).toMatchObject({
      text: "Verified: release remains disabled",
      finishReason: "stop",
      modelId: "core-offline-qualification",
      usage: { inputTokens: 13, outputTokens: 7, totalTokens: 20 },
      fetchCalls: 0,
    });
  });

  it("settles a streamed reply and usage without provider access", () => {
    expect(runOfflineFixture("stream")).toMatchObject({
      text: "Streamed: offline only",
      chunks: ["Streamed: offline only"],
      finishReason: "stop",
      usage: { inputTokens: 11, outputTokens: 5, totalTokens: 16 },
      fetchCalls: 0,
    });
  });

  it("validates a tool call with the runtime's Zod and resumes from its result", () => {
    expect(runOfflineFixture("tools")).toEqual({
      text: "Read: safe-local-record",
      finishReason: "stop",
      steps: 2,
      executedInputs: [{ recordId: "safe-local-record" }],
      fetchCalls: 0,
    });
  });
});
