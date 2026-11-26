function serverOf(address) {
  try {
    const url = new URL(address);
    return `${url.hostname.toLowerCase()}:${url.port || "5432"}`;
  } catch {
    return null;
  }
}

export function poolingPlan({ poolerUrl, directUrl }) {
  const pooler = typeof poolerUrl === "string" ? poolerUrl.trim() : "";
  if (!pooler) {
    return {
      kind: "skipped",
      reason:
        "no pooler address (PAYLOAD_QUALIFICATION_POOLER_URL): the run is on direct Postgres",
    };
  }
  const server = serverOf(pooler);
  if (!server) {
    return { kind: "skipped", reason: "the pooler address does not parse" };
  }
  if (server === serverOf(directUrl)) {
    return {
      kind: "skipped",
      reason:
        "the pooler address is the direct server: the run is on direct Postgres",
    };
  }
  return { kind: "run", url: pooler };
}

export function judgePoolingProbe(probe) {
  return Boolean(
    probe &&
    Array.isArray(probe.written) &&
    probe.written.length > 0 &&
    Array.isArray(probe.errors) &&
    probe.errors.length === 0 &&
    probe.written.includes(probe.stored) &&
    probe.versions >= probe.written.length,
  );
}

export function judgeSuppliedMediaIds(proof) {
  return Boolean(
    proof &&
    proof.servicePortKept === true &&
    proof.restCreateStatus === 403 &&
    proof.actorCreateRefused === true &&
    proof.pageCreateDiscardedId === true,
  );
}

export function judgeLedgerKey(ledger) {
  return Boolean(
    ledger && ledger.idType === "uuid" && ledger.sequence === null,
  );
}

export function summarizeQualification(results) {
  const passed = results.filter((result) => result.outcome === "PASS").length;
  const failed = results.filter((result) => result.outcome === "FAIL").length;
  const skipped = results.filter(
    (result) => result.outcome === "SKIPPED",
  ).length;
  return {
    passed,
    failed,
    skipped,
    exitCode: failed === 0 && passed > 0 ? 0 : 1,
  };
}
