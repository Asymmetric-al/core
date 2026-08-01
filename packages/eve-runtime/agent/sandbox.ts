import {
  recordEveSandboxAction,
  resolveEveSandboxNetworkDecision,
} from "@asym/api/eve/sandbox";
import { defaultBackend, defineSandbox } from "eve/sandbox";

const denyAllNetwork = "deny-all" as const;

export default defineSandbox({
  description:
    "Disposable writable engineering workspace with app-owned network authorization and no mounted credentials.",
  backend: defaultBackend({
    docker: { networkPolicy: denyAllNetwork },
    microsandbox: { networkPolicy: denyAllNetwork },
    vercel: { networkPolicy: denyAllNetwork },
  }),
  revalidationKey: () =>
    `core-develop-sanitized-v1:${process.env.VERCEL_GIT_COMMIT_SHA ?? "local"}`,
  async bootstrap({ use: acquireSandbox }) {
    const sandbox = await acquireSandbox();
    // Bootstrap egress is governed like every other sandbox network use. The
    // clone below reaches the public internet, so refuse to open the network
    // at all when governance denies it; otherwise a kill switch would still
    // leave provisioning able to egress.
    const decision = await resolveEveSandboxNetworkDecision();
    if (!decision.allowed) {
      throw new Error(
        `Sandbox bootstrap is not authorized: ${decision.reason}.`,
      );
    }
    await sandbox.setNetworkPolicy(decision.networkPolicy);
    try {
      const clone = await sandbox.run({
        command:
          "git clone --filter=blob:none --branch develop --single-branch https://github.com/Asymmetric-al/core.git /workspace/repo",
      });
      if (clone.exitCode !== 0) {
        throw new Error("The public Core checkout could not be provisioned.");
      }

      const sanitize = await sandbox.run({
        command:
          "find /workspace/repo -type f \\( -name '.env' -o -name '.env.*' \\) -delete && git -C /workspace/repo add -A && git -C /workspace/repo -c user.name='Eve Sandbox' -c user.email='eve-sandbox@invalid.example' commit --allow-empty -m 'chore: sanitize sandbox checkout'",
      });
      if (sanitize.exitCode !== 0) {
        throw new Error("The Core checkout could not be sanitized.");
      }
    } finally {
      // Deny-first: a failed restore must fail the bootstrap rather than cache
      // a workspace snapshot whose network may still be open.
      await sandbox.setNetworkPolicy(denyAllNetwork);
    }
  },
  async onSession({ ctx, use: acquireSandbox }) {
    const sandbox = await acquireSandbox();
    const decision = await resolveEveSandboxNetworkDecision();
    const runId = crypto.randomUUID();
    const auditRecorded = await recordEveSandboxAction({
      action: "network_policy",
      decision,
      result: decision.allowed ? "started" : "blocked",
      runId,
      sessionId: ctx.session.id,
      target: decision.networkPolicy,
    });

    if (!decision.allowed || !auditRecorded) {
      try {
        await sandbox.setNetworkPolicy(denyAllNetwork);
      } catch {
        throw new Error("Sandbox networking could not be denied safely.");
      }
      return;
    }

    try {
      await sandbox.setNetworkPolicy(decision.networkPolicy);
    } catch {
      await recordEveSandboxAction({
        action: "network_policy",
        decision,
        result: "failed",
        runId,
        sessionId: ctx.session.id,
        target: decision.networkPolicy,
      });
      throw new Error("Sandbox networking could not be enabled safely.");
    }

    const completionRecorded = await recordEveSandboxAction({
      action: "network_policy",
      decision,
      result: "succeeded",
      runId,
      sessionId: ctx.session.id,
      target: decision.networkPolicy,
    });
    if (!completionRecorded) {
      try {
        await sandbox.setNetworkPolicy(denyAllNetwork);
      } catch {
        throw new Error("Sandbox networking could not be denied safely.");
      }
      throw new Error("Sandbox network authorization could not be audited.");
    }
  },
});
