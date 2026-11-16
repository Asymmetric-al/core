// TEST-ONLY loopback fixture for the Playwright run (127.0.0.1:39994).
// It serves the synthetic Archon HTTP surface and answers the two fake
// executables the production Console spawns unchanged:
//   tests/fixtures/archon-cli.mjs  -> POST /fixture/cli     (archon state get|list)
//   tests/fixtures/control-cli.mjs -> POST /fixture/control (control.mjs commands)
// Nothing here is used by the production build.
import { randomUUID } from "node:crypto";
import { createServer, type ServerResponse } from "node:http";

import { createEngine } from "./fixtures/engine-fixture";
import {
  FixtureControl,
  createFixtureState,
  type FireHook,
} from "./fixtures/factory-fixture";
import { seedScale } from "./fixtures/scale-fixture";

const PORT = 39994;

function build() {
  const engine = createEngine();
  const state = createFixtureState();
  const timers: ReturnType<typeof setTimeout>[] = [];
  const fire: FireHook = (workflow, inputs) => {
    const runId = randomUUID();
    if (workflow === "answer") {
      engine.start(runId, "core-answer", "Synthetic Samson turn");
      timers.push(
        setTimeout(() => {
          const name = `core/chat/${inputs.conversation}`;
          const doc = state.value<{ messages: unknown[] }>(name) ?? {
            messages: [],
          };
          const question = inputs.question;
          const hold = /hold\s*#?(\d+)/i.exec(question);
          const priority = /priorit\w*\s*#?(\d+)/i.exec(question);
          const operation = hold
            ? {
                kind: "hold",
                issue: Number(hold[1]),
                issues: [],
                endState: "unchanged",
                reason: "Operator asked to hold it",
                status: "proposed",
              }
            : priority
              ? {
                  kind: "reprioritize",
                  issue: Number(priority[1]),
                  issues: [],
                  endState: "unchanged",
                  reason: "Operator asked to reprioritize",
                  status: "proposed",
                }
              : /stop the factory/i.test(question)
                ? {
                    kind: "stop",
                    issue: 0,
                    issues: [],
                    endState: "unchanged",
                    reason: "Operator asked to stop",
                    status: "proposed",
                  }
                : null;
          const at = new Date().toISOString();
          state.set(name, {
            v: 1,
            messages: [
              ...doc.messages,
              { role: "operator", text: question, request: inputs.request, at },
              {
                role: "samson",
                request: inputs.request,
                at,
                run: runId,
                text: `Synthetic Samson reply: ${operation ? `I can ${operation.kind} as proposed below.` : "two rounds are running (#101 build, #102 reviews)."}`,
                sources: ["core/issues/101", "core/issues/102"],
                operation,
              },
            ].slice(-24),
          });
          engine.finish(runId);
        }, 1200),
      );
    } else {
      engine.start(runId, "core-analyze", "Synthetic analysis");
      timers.push(
        setTimeout(() => {
          const at = new Date().toISOString();
          state.set(`core/analysis/reports/${runId}`, {
            v: 1,
            run: runId,
            scope: inputs.scope,
            trigger: "operator",
            status: "completed",
            problem: "",
            at,
            result: {
              result: "no-actionable-concern",
              observations: [
                {
                  text: "Synthetic observation: rounds are progressing",
                  evidence: ["E1"],
                },
              ],
              findings: [],
              coverage_limits: ["Synthetic fixture packet"],
            },
          });
          const index = state.value<{ reports: unknown[] }>(
            "core/analysis",
          ) ?? { reports: [] };
          state.set("core/analysis", {
            v: 1,
            reports: [
              ...index.reports,
              {
                run: runId,
                scope: inputs.scope,
                trigger: "operator",
                status: "completed",
                at,
                findings: 0,
              },
            ],
          });
          engine.finish(runId);
        }, 1200),
      );
    }
    return {
      ok: true,
      outcome: "accepted",
      status: 200,
      receipt: `receipt-${runId.slice(0, 8)}`,
    };
  };
  const control = new FixtureControl(state, {
    cancel: (runId) => engine.cancel(runId),
    fire,
  });
  return { engine, state, control, timers };
}

let world = build();

function send(
  response: ServerResponse,
  status: number,
  body: unknown,
  type = "application/json",
) {
  response.writeHead(status, { "Content-Type": type });
  response.end(typeof body === "string" ? body : JSON.stringify(body));
}

type Invocation = { argv?: string[]; env?: Record<string, string | undefined> };

/** The Console must pass the documented minimal environment and project. */
function environmentProblem(env: Invocation["env"]) {
  if (
    !env?.ARCHON_HOME ||
    env.ARCHON_USER_ID !== "core-factory" ||
    !env.HOME ||
    !env.PATH
  )
    return "fixture: missing or unexpected factory environment";
  if (Object.keys(env).some((key) => /PASSWORD|CONSOLE_/.test(key)))
    return "fixture: Console variables leaked into the child environment";
  return null;
}

async function archonCli({ argv = [], env }: Invocation) {
  const problem = environmentProblem(env);
  if (problem) return { code: 64, stdout: "", stderr: problem };
  const project = argv[argv.indexOf("--project") + 1];
  if (project !== "_folder/control")
    return { code: 64, stdout: "", stderr: "fixture: wrong project" };
  const [group, verb] = argv;
  if (group !== "state")
    return { code: 64, stdout: "", stderr: "fixture: unsupported command" };
  try {
    if (verb === "get")
      return {
        code: 0,
        stdout: JSON.stringify(await world.state.get(argv[2])),
      };
    if (verb === "list" && argv.includes("--values")) {
      const prefix = argv[argv.indexOf("--prefix") + 1];
      return {
        code: 0,
        stdout: JSON.stringify({ documents: await world.state.list(prefix) }),
      };
    }
  } catch (error) {
    return { code: 1, stdout: "", stderr: String(error) };
  }
  return { code: 64, stdout: "", stderr: "fixture: unsupported state command" };
}

async function controlCli({ argv = [], env }: Invocation) {
  const problem = environmentProblem(env);
  if (problem) return { code: 64, stdout: "", stderr: problem };
  const result = await world.control.run(argv);
  return {
    code: result.exit ?? 1,
    stdout: result.json ? `${JSON.stringify(result.json)}\n` : "",
  };
}

async function readJson(request: AsyncIterable<Buffer | string>) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return body ? (JSON.parse(body) as Record<string, unknown>) : {};
}

const server = createServer(async (request, response) => {
  const url = request.url ?? "/";
  const path = new URL(url, `http://127.0.0.1:${PORT}`).pathname;
  try {
    if (path === "/fixture/reset" && request.method === "POST") {
      for (const timer of world.timers) clearTimeout(timer);
      world = build();
      return send(response, 200, { reset: true });
    }
    // TEST-ONLY: replace the factory state with the labeled synthetic scale
    // fixture (about 2,000 issues with long histories).
    if (path === "/fixture/scale" && request.method === "POST") {
      const body = await readJson(request);
      const issues = Math.min(5000, Math.max(1, Number(body.issues) || 2000));
      const history = Math.min(40, Math.max(1, Number(body.history) || 40));
      world.state.docs.clear();
      for (const [name, value] of Object.entries(
        seedScale({ issues, history }),
      ))
        world.state.set(name, value);
      return send(response, 200, { issues, history });
    }
    if (path === "/fixture/state-failure" && request.method === "POST") {
      const body = await readJson(request);
      world.state.failure =
        typeof body.reason === "string" ? body.reason : null;
      return send(response, 200, { failure: world.state.failure });
    }
    if (path === "/fixture/engine-health" && request.method === "POST") {
      const body = await readJson(request);
      world.engine.setHealthy(body.healthy !== false);
      return send(response, 200, { healthy: body.healthy !== false });
    }
    if (path === "/fixture/calls")
      return send(response, 200, { calls: world.control.calls });
    if (path === "/fixture/cli" && request.method === "POST")
      return send(
        response,
        200,
        await archonCli((await readJson(request)) as Invocation),
      );
    if (path === "/fixture/control" && request.method === "POST")
      return send(
        response,
        200,
        await controlCli((await readJson(request)) as Invocation),
      );
    if (path.startsWith("/api/")) {
      const result = await world.engine.handle(request.method ?? "GET", url);
      return send(
        response,
        result.status,
        await result.text(),
        result.headers.get("content-type") ?? "text/plain",
      );
    }
    return send(response, 404, { error: "No test fixture endpoint" });
  } catch (error) {
    return send(response, 500, { error: String(error) });
  }
});
server.listen(PORT, "127.0.0.1");
process.once("SIGTERM", () => server.closeAllConnections());
