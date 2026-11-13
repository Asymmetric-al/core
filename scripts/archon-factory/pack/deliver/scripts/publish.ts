// Publish: after Ezra's PASS, run Core's normal pre-push hook (ci:preflight)
// inside the credential-free executor while pushing to the private outbox,
// then push exactly that verified commit to GitHub and open or update the PR.
// Nothing is pushed unless both first-pass reviews are CLEAR and Ezra's DONE
// PASS are recorded for this candidate and acceptance revision, and no
// acceptance correction is still pending. A final FAIL goes to its owner. The
// PR body states only the hook evidence freeze and publication recorded.
import { createGitHub, githubToken } from "../../.shared/github.mjs";
import { publishCandidate } from "../../.shared/publication.mjs";
import {
  emit,
  input,
  openRound,
  workItem,
  writeWorkItem,
} from "../../.shared/round.mjs";
import { planCheckpoint } from "../../.shared/workitem.mjs";
import {
  briefText,
  criterionOwner,
  failRepair,
  finalDecision,
  hooksLine,
  publicationGate,
  reviewsLine,
} from "./publish-logic.mjs";
import { normalizeRepair } from "./repair-logic.mjs";

const round = openRound();
const final = input("final");
const freeze = round.ledger.read("freeze");
let document = await workItem(round);
let value = document.value;
const respond = (
  out: Record<string, string>,
  ledger: Record<string, unknown>,
) => {
  round.ledger.write("publish", ledger);
  emit(out);
  process.exit(0);
};
const candidate = freeze.candidate;

if (!final)
  respond(
    { published: "no", pr: "", reason: "Final acceptance did not run" },
    {
      blocked: {
        code: "no-final",
        detail: "Ezra's final acceptance is missing",
      },
    },
  );
if (
  final.candidate_sha !== candidate ||
  final.acceptance_revision !== value.acceptance.revision
)
  respond(
    {
      published: "no",
      pr: "",
      reason: "Final acceptance is bound to another candidate",
    },
    {
      blocked: {
        code: "final-identity",
        detail: `${final.candidate_sha} / ${final.acceptance_revision}`,
      },
    },
  );
const { decision, unmapped, notes } = finalDecision(final, value.acceptance);
await writeWorkItem(
  round,
  planCheckpoint(document, {
    runId: round.runId,
    fields: {
      final: {
        decision,
        taskStatus: final.task_status,
        candidate,
        acceptanceRevision: final.acceptance_revision,
        criteria: final.criteria.map(
          (criterion: {
            id: string;
            result: string;
            evidence: string;
            owner?: string;
          }) => ({
            id: criterion.id,
            result: criterion.result,
            owner: criterionOwner(criterion),
            evidence: criterion.evidence.slice(0, 300),
          }),
        ),
        at: round.now(),
        run: round.runId,
      },
    },
    now: round.now(),
  }),
);
document = await workItem(round);
value = document.value;
if (decision === "FAIL")
  respond(
    { published: "no", pr: "", reason: "Ezra found unmet criteria" },
    failRepair(final),
  );
if (decision !== "PASS")
  respond(
    { published: "no", pr: "", reason: "Final acceptance is INCONCLUSIVE" },
    {
      blocked: {
        code: "final-inconclusive",
        detail: [
          ...notes,
          ...unmapped.map((id) => `${id} unmapped`),
          ...final.limitations,
        ]
          .join("; ")
          .slice(0, 1200),
      },
    },
  );
const missing = publicationGate({ value, candidate });
if (missing.length)
  respond(
    { published: "no", pr: "", reason: "Publication evidence is incomplete" },
    {
      blocked: {
        code: "publication-gate",
        detail: missing.join("; ").slice(0, 1200),
        recovery:
          "Retry the round so both reviews and final acceptance run on this candidate",
      },
    },
  );

const publication = await publishCandidate(round, {
  branch: value.branch,
  candidate,
});
if (!publication.ok)
  respond(
    { published: "no", pr: "", reason: publication.reason },
    publication.repair
      ? {
          repair: normalizeRepair(publication.repair, "publish"),
          fingerprint: publication.fingerprint,
        }
      : { blocked: publication.blocked },
  );

const token = await githubToken({
  gh: round.config.github.executable,
  configDir: round.config.github.configDir,
});
const github = createGitHub({ token, repo: round.config.repository.slug });
const issue = await github.issue(round.issue);
const criteria = value.acceptance.criteria
  .map(
    (criterion: { id: string; statement: string }) =>
      `| ${criterion.id} | ${criterion.statement.replace(/\|/g, "\\|").slice(0, 200)} | ${value.final.criteria.find((item: { id: string }) => item.id === criterion.id)?.result ?? "?"} |`,
  )
  .join("\n");
const body = [
  briefText(value.brief.summary),
  "",
  `Closes #${round.issue}`,
  "",
  "## Acceptance (Ezra)",
  "",
  "| Criterion | Statement | Final |",
  "| --- | --- | --- |",
  criteria,
  "",
  "## Factory evidence",
  "",
  `- Candidate \`${candidate}\` on base \`${value.base}\`, acceptance \`${value.acceptance.revision.slice(0, 16)}\``,
  reviewsLine(value.reviews),
  hooksLine(freeze.hooks, publication.hooks),
  `- Round ${value.round}, assignment \`${round.assignment}\`.`,
  "",
  "Produced by the Core factory on VM 100 (Samson, Ezra, Bezalel, Micaiah, Luke, Agabus).",
].join("\n");
const title = `${issue.title} (#${round.issue})`.slice(0, 240);
let pr = (await github.pullsForHead(value.branch)).find(
  (candidatePr: { state: string }) => candidatePr.state === "open",
);
try {
  if (pr) pr = await github.updatePull(pr.number, { body });
  else
    pr = await github.createPull({
      title,
      head: value.branch,
      base: round.config.repository.targetBranch,
      body,
      draft: false,
      maintainer_can_modify: true,
    });
} catch (error) {
  if ((error as { outcome?: string }).outcome !== "unknown") throw error;
  pr = (await github.pullsForHead(value.branch)).find(
    (candidatePr: { state: string }) => candidatePr.state === "open",
  );
  if (!pr)
    respond(
      {
        published: "no",
        pr: "",
        reason: "PR creation outcome unknown and no PR found",
      },
      {
        blocked: {
          code: "pr-unknown",
          detail: "Reconcile the pull request on GitHub",
        },
      },
    );
}
await writeWorkItem(
  round,
  planCheckpoint(document, {
    runId: round.runId,
    fields: {
      pr: {
        number: pr.number,
        url: pr.html_url,
        nodeId: pr.node_id,
        head: candidate,
        publishedAt: round.now(),
      },
    },
    now: round.now(),
  }),
);
respond(
  {
    published: "yes",
    pr: pr.html_url,
    reason: `Published ${candidate.slice(0, 12)} as PR #${pr.number}`,
  },
  { published: true, pr: pr.number, url: pr.html_url, candidate },
);
