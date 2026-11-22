import { resolveEveSandboxNetworkDecision } from "@asym/api/eve/sandbox";

async function main(): Promise<void> {
  try {
    const decision = await resolveEveSandboxNetworkDecision();
    process.stdout.write(
      `${JSON.stringify({
        allowed: decision.allowed,
        reason: decision.reason,
      })}\n`,
    );
  } catch {
    process.stdout.write(
      `${JSON.stringify({
        allowed: false,
        reason: "governance_unavailable",
      })}\n`,
    );
  }
}

await main();
