// Pure snapshot for one Samson chat turn: factory facts, work items and the
// open attention items that analysis raised for Samson's triage. No unsealed
// review content or worker transcripts are included.
const ATTENTION = 10;

export function chatSnapshot({
  observedAt,
  factory,
  scope,
  selection,
  issues,
  attention,
}) {
  const workItems = (issues?.documents ?? [])
    .filter((entry) => /^core\/issues\/\d+$/.test(entry.name))
    .map((entry) => {
      const value = entry.value ?? {};
      return {
        issue: value.issue,
        status: value.status,
        control: value.control,
        route: value.route,
        round: value.round,
        branch: value.branch,
        head: value.head,
        pr: value.pr?.url ?? null,
        blocker: value.blocker,
        acceptance: value.acceptance?.revision ?? null,
        reviews: value.reviews,
        final: value.final?.decision ?? null,
        lease: entry.lease
          ? { run: entry.lease.runId, live: entry.lease.live }
          : null,
        history: (value.history ?? []).slice(-5),
      };
    });
  return {
    observedAt,
    factory: factory ?? null,
    scope: scope ?? null,
    selection: selection?.decisions?.slice(-5) ?? [],
    attention: (attention?.items ?? [])
      .filter((item) => item.status === "open")
      .slice(-ATTENTION),
    workItems,
  };
}
