import { createHash } from "node:crypto";

import { hasUnconfirmedCleanup } from "../../.shared/cleanup-state.mjs";
import {
  RESERVATIONS,
  TERMINAL,
  factoryPermitsIntake,
  heldElsewhere,
  issueDocument,
  validWorkItem,
} from "../../.shared/workitem.mjs";
import { scopeDigest } from "./intake-logic.mjs";

const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const number = (value) => Number.isSafeInteger(value) && value > 0;
const digest = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourcePath = /(?:docs|openspec)\/[A-Za-z0-9._/-]+\.md\b/g;
const sharedAreas = [
  "migrations",
  "lockfile",
  "shared-ui",
  "api-contract",
  "ci",
  "factory-policy",
];

function prose(text) {
  return String(text ?? "")
    .replace(/```[^\n]*\n[\s\S]*?(?:```|$)/g, "")
    .replace(/^\s*>.*$/gm, "");
}

function references(text, repo) {
  const found = new Set();
  const foreign = new Set();
  const pattern =
    /https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/(?:issues|pull)\/(\d+)|\b([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)#(\d+)|(?<![\w/#])#(\d+)\b/g;
  for (const match of text.matchAll(pattern)) {
    const repository = match[1] ?? match[3];
    const target = Number(match[2] ?? match[4] ?? match[5]);
    if (!number(target)) continue;
    if (repository && repository.toLowerCase() !== repo.toLowerCase())
      foreign.add(`${repository}#${target}`);
    else found.add(target);
  }
  return { local: [...found], foreign: [...foreign] };
}

function dependencyKind(text) {
  if (/\boptional\b/i.test(text) && !/\b(?:non[- ]|not )optional\b/i.test(text))
    return { kind: "optional" };
  if (/\b(?:informational|related)\b/i.test(text))
    return { kind: "informational" };
  if (/\bdispatch\b/i.test(text))
    return { kind: "dispatch", requires: "dispatch-ready" };
  if (/\b(?:qualification|release)\b/i.test(text)) {
    const kind = /\bqualification\b/i.test(text) ? "qualification" : "release";
    return {
      kind,
      requires: kind === "qualification" ? "qualified" : "released",
      gatesAdmission:
        !/does not gate admission|non[- ]gating|after admission|post[- ]admission/i.test(
          text,
        ),
    };
  }
  return {
    kind: "implementation",
    requires:
      /\bimplemented\b/i.test(text) && !/\b(?:integrated|merged)\b/i.test(text)
        ? "implemented"
        : "integrated",
  };
}

function dependencyText(text, source, repo) {
  const edges = [];
  const problems = [];
  let section = null;
  let sectionAdmissionKnown = false;
  let depth = 0;
  const directive =
    /\b(?:(?:implementation|dispatch|qualification|release)\s+(?:prerequisites?|dependencies|gates?)|prerequisites?|dependencies|depends on|blocked by|requires|after|(?:non[- ]|not )?optional|informational|related)\b/i;
  for (const raw of prose(text).split(/\r?\n|;\s*/)) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(raw.trim());
    if (heading && heading[1].length <= depth) section = null;
    const line = (heading?.[2] ?? raw).replace(/[*`]/g, "").trim();
    if (!line) continue;
    const match = directive.exec(line);
    if (heading) {
      section = match ? dependencyKind(line) : null;
      sectionAdmissionKnown = /admission|non[- ]gating/i.test(line);
      depth = heading[1].length;
    }
    const list = /^(?:[-+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/.test(line);
    if (!match && !(section && list)) continue;
    const firstReference =
      /https:\/\/github\.com|\b[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#\d+|#\d+/.exec(
        line,
      );
    const classification = firstReference
      ? line.slice(0, firstReference.index)
      : line;
    const kind = match
      ? dependencyKind(classification.slice(match.index))
      : section;
    const { local: targets, foreign } = references(
      match ? line.slice(match.index) : line,
      repo,
    );
    if (
      foreign.length &&
      !["optional", "informational"].includes(kind.kind) &&
      kind.gatesAdmission !== false
    )
      problems.push({
        source,
        code: "unresolved-foreign-dependency",
        targetIds: foreign,
        text: line.slice(0, 300),
      });
    if (!targets.length && !foreign.length) {
      const label = line.replace(/^[-+]\s+/, "");
      // A directive word inside ordinary prose ("GitHub requires that
      // context", "optional notes are related reading") declares nothing.
      // Without a reference, only an item in a dependency section, a
      // statement that opens with a hard directive ("Requires the producer")
      // or a soft word used as a label ("After: the migration") is an
      // unresolved declaration.
      if (match && !heading && !(section && list)) {
        const opens = match.index === line.length - label.length;
        const soft =
          /^(?:after|(?:non[- ]|not )?optional|informational|related)$/i.test(
            match[0],
          );
        const labelled = /^\s*(?:\([^)]*\))?\s*:/.test(
          line.slice(match.index + match[0].length),
        );
        if (!opens || (soft && !labelled)) continue;
      }
      const declaration =
        /^(?:(?:implementation|dispatch|qualification|release)\s+)?(?:prerequisites?|dependencies|gates?|optional|informational|related|depends on|blocked by|requires|after)(?:\s*\([^)]*\))?\s*:?\s*$/i.test(
          label,
        );
      if (
        !heading &&
        !declaration &&
        !/\bnone\b|no (?:hard )?(?:prerequisites?|dependencies)\b/i.test(label)
      )
        problems.push({
          source,
          code: "unresolved-dependency",
          text: line.slice(0, 300),
        });
      if (!list && match && !heading) {
        section = kind;
        sectionAdmissionKnown = /admission|non[- ]gating/i.test(line);
      }
      continue;
    }
    if (firstReference && directive.test(line.slice(firstReference.index)))
      problems.push({
        source,
        code: "ambiguous-dependency-classification",
        text: line.slice(0, 300),
      });
    if (
      (kind.kind === "qualification" || kind.kind === "release") &&
      !/admission|non[- ]gating/i.test(line) &&
      !(!match && sectionAdmissionKnown)
    )
      problems.push({
        source,
        code: "ambiguous-admission-gate",
        text: line.slice(0, 300),
      });
    for (const target of targets)
      edges.push({ ...kind, targetId: `#${target}`, source });
  }
  return { edges, problems };
}

export function reconcileDependencies({ native, texts, repo }) {
  const problems = [];
  const observed = [];
  for (const item of native) {
    if (
      !number(item?.number) ||
      (item.repository_url &&
        item.repository_url.toLowerCase() !==
          `https://api.github.com/repos/${repo}`.toLowerCase())
    ) {
      problems.push({
        source: "GitHub blocked_by",
        code: "malformed-native-dependency",
      });
      continue;
    }
    observed.push({
      kind: "implementation",
      targetId: `#${item.number}`,
      requires: "integrated",
      source: "GitHub blocked_by",
    });
  }
  for (const { text, source } of texts) {
    const parsed = dependencyText(text, source, repo);
    observed.push(...parsed.edges);
    problems.push(...parsed.problems);
  }
  const dependencies = [];
  const classified = new Map();
  const signature = (edge) =>
    JSON.stringify([
      edge.kind,
      edge.targetId,
      edge.requires,
      edge.gatesAdmission,
    ]);
  for (const { source, ...edge } of observed) {
    const previous = classified.get(edge.targetId);
    if (previous && signature(previous.edge) !== signature(edge))
      problems.push({
        source,
        code: "conflicting-dependency",
        targetId: edge.targetId,
        otherSource: previous.source,
      });
    if (
      !dependencies.some(
        (dependency) => signature(dependency) === signature(edge),
      )
    )
      dependencies.push(edge);
    classified.set(edge.targetId, { edge, source });
  }
  return {
    dependencies,
    reconciled: problems.length === 0,
    sources: observed,
    problems,
  };
}

function closesIssue(body, target, repo) {
  const pattern =
    /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s*((?:https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/\d+|(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)?#\d+)(?:(?:\s*,\s*|\s+and\s+)(?:https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/\d+|(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)?#\d+))*)/gi;
  return [...prose(body).matchAll(pattern)].some((match) =>
    references(match[1], repo).local.includes(target),
  );
}

async function integrated({ github, config, issue, existing }) {
  const { slug, targetBranch } = config.repository;
  const timeline = await github.paginate(
    `/repos/${slug}/issues/${issue.number}/timeline`,
  );
  if (!Array.isArray(timeline)) throw new Error("GitHub timeline unavailable");
  const candidates = new Set();
  if (number(existing?.pr?.number)) candidates.add(existing.pr.number);
  for (const event of timeline) {
    const linked =
      event.event === "cross-referenced" ? event.source?.issue : null;
    if (
      linked?.pull_request &&
      number(linked.number) &&
      linked.html_url === `https://github.com/${slug}/pull/${linked.number}`
    )
      candidates.add(linked.number);
  }
  for (const candidate of candidates) {
    const pull = await github.pull(candidate);
    if (
      !pull ||
      pull.number !== candidate ||
      pull.merged !== true ||
      pull.base?.ref !== targetBranch ||
      pull.base?.repo?.full_name?.toLowerCase() !== slug.toLowerCase() ||
      !/^[a-f0-9]{40}$/.test(pull.merge_commit_sha ?? "") ||
      !closesIssue(pull.body, issue.number, slug)
    )
      continue;
    const compare = await github.compare(pull.merge_commit_sha, targetBranch);
    if (
      ["identical", "ahead"].includes(compare?.status) &&
      compare.merge_base_commit?.sha === pull.merge_commit_sha
    )
      return { source: pull.html_url, revision: pull.merge_commit_sha };
  }
  return null;
}

// `files` caches governing file reads for one observation pass, so a document
// many issues cite is fetched once.
async function governingTexts(github, config, originals, files = new Map()) {
  const texts = [...originals];
  const sources = [];
  const problems = [];
  const pending = [];
  function enqueueSources(text, pattern, defaultRef) {
    const links = [...text.matchAll(/https?:\/\/[^\s`<>\)]+/g)];
    for (const match of text.matchAll(pattern)) {
      const relative = match[0];
      const link = links.find(
        (candidate) =>
          candidate.index <= match.index &&
          candidate.index + candidate[0].length > match.index,
      );
      let ref = defaultRef;
      if (link) {
        const url = new URL(link[0]);
        const prefix = `/${config.repository.slug}/blob/`;
        if (
          url.hostname !== "github.com" ||
          !url.pathname.toLowerCase().startsWith(prefix.toLowerCase()) ||
          !url.pathname.endsWith(`/${relative}`)
        ) {
          problems.push({
            source: link[0],
            code: "foreign-or-unresolved-governing-source",
          });
          continue;
        }
        ref = decodeURIComponent(
          url.pathname.slice(prefix.length, -(relative.length + 1)),
        );
        if (!ref || /[\0\r\n]/.test(ref)) {
          problems.push({
            source: link[0],
            code: "unresolved-governing-revision",
          });
          continue;
        }
      }
      pending.push({ relative, ref });
    }
  }
  for (const original of originals) {
    const text = prose(original.text);
    enqueueSources(text, sourcePath, config.repository.targetBranch);
    for (const line of text.split(/\r?\n/))
      if (
        /\b(?:governing|authoritative|owning)\b/i.test(line) &&
        /https?:\/\/|(?:docs|openspec)\//.test(line) &&
        ![...line.matchAll(sourcePath)].length
      )
        problems.push({
          source: original.source,
          code: "unresolved-governing-source",
          text: line.slice(0, 300),
        });
  }
  const seen = new Set();
  let bytes = 0;
  while (pending.length) {
    const { relative, ref } = pending.shift();
    const key = `${ref}:${relative}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const source = `https://github.com/${config.repository.slug}/blob/${ref}/${relative}`;
    if (
      seen.size > 32 ||
      relative.split("/").some((part) => part === "." || part === "..")
    ) {
      problems.push({ source, code: "governing-source-limit-or-path" });
      continue;
    }
    try {
      if (!files.has(key))
        files.set(
          key,
          github
            .request(
              "GET",
              `/repos/${config.repository.slug}/contents/${relative.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`,
            )
            .then((response) => response.data),
        );
      const file = await files.get(key);
      if (
        file?.type !== "file" ||
        file.encoding !== "base64" ||
        !/^[a-f0-9]{40}$/.test(file.sha ?? "") ||
        typeof file.content !== "string"
      )
        throw new Error("Unsupported governing file response");
      const buffer = Buffer.from(file.content, "base64");
      bytes += buffer.length;
      if (bytes > 160_000) throw new Error("Governing source budget exceeded");
      const text = buffer.toString("utf8");
      texts.push({ text, source });
      sources.push({ source, revision: file.sha, digest: digest(text) });
      enqueueSources(
        prose(text),
        /openspec\/contracts\/[A-Za-z0-9._/-]+\.md\b/g,
        ref,
      );
    } catch {
      problems.push({ source, code: "governing-source-unavailable" });
    }
  }
  return { texts, sources, problems };
}

export async function observeAdmission({
  github,
  archon,
  config,
  candidateAreas = {},
  nowMs = Date.now(),
  // One pass must finish well inside the selector node's timeout. Whatever is
  // not observed in time is reported unavailable, which blocks only the
  // issues that need it.
  budgetMs = 180_000,
  clock = Date.now,
}) {
  const started = clock();
  let budgetExceeded = false;
  const files = new Map();
  const proofs = new Map();
  const [factoryDocument, scopeDocument, reservationDocument, listing] =
    await Promise.all([
      archon.get("core/factory"),
      archon.get("core/scope"),
      archon.get(RESERVATIONS),
      archon.list("core/issues/", { values: true }),
    ]);
  const scope = scopeDocument.value;
  if (
    scope?.v !== 1 ||
    !Array.isArray(scope.issues) ||
    !scope.issues.length ||
    !scope.issues.every(number) ||
    new Set(scope.issues).size !== scope.issues.length ||
    !Array.isArray(listing?.documents)
  )
    throw new Error("Authorized scope or current holder listing unavailable");
  const reservations =
    reservationDocument.value?.areas ??
    (reservationDocument.value === null ? {} : null);
  let resourcesKnown =
    record(reservations) && Object.values(reservations).every(number);
  const holderNumbers = new Set([
    ...scope.issues,
    ...listing.documents
      .filter((entry) => /^core\/issues\/\d+$/.test(entry.name))
      .map((entry) => Number(entry.name.split("/")[2])),
    ...(resourcesKnown ? Object.values(reservations) : []),
  ]);
  const items = new Map();
  for (const holder of holderNumbers) {
    try {
      const document = await archon.get(issueDocument(holder));
      if (
        !Number.isSafeInteger(document?.revision) ||
        document.revision < 0 ||
        (document.value !== null &&
          (!validWorkItem(document.value) || document.value.issue !== holder))
      )
        throw new Error("Malformed holder document");
      items.set(holder, document);
    } catch {
      resourcesKnown = false;
    }
  }
  if (
    resourcesKnown &&
    Object.values(reservations).some((holder) => !items.get(holder)?.value)
  )
    resourcesKnown = false;
  const active = [...items.values()].filter(
    (entry) =>
      entry.value &&
      (!TERMINAL.has(entry.value.status) ||
        entry.lease?.live ||
        hasUnconfirmedCleanup(entry.value)),
  );
  const limit = config.limits?.admittedIssues ?? 2;
  resourcesKnown &&= number(limit);
  const capacity = resourcesKnown ? Math.max(0, limit - active.length) : 0;
  let openPulls;
  try {
    openPulls = await github.openPulls();
    if (!Array.isArray(openPulls))
      throw new Error("Open pull listing unavailable");
  } catch {
    openPulls = null;
  }
  const observations = {};
  const summaries = [];
  const contexts = new Map();
  const approved = new Set(scope.issues);
  const pending = scope.issues.map((target) => ({ target, settled: false }));
  const neededIntegration = new Set();
  const gates = ({ issue, target, existing, foreignPr, areas }) => ({
    hold:
      !factoryPermitsIntake(factoryDocument.value).ok ||
      issue.state !== "open" ||
      ["hold", "stop"].includes(existing?.control)
        ? "conflict"
        : "clear",
    owner:
      !items.has(target) || !openPulls
        ? "unavailable"
        : existing || foreignPr
          ? "conflict"
          : "clear",
    sharedArea: !resourcesKnown
      ? "unavailable"
      : heldElsewhere(areas, reservations, target).length
        ? "conflict"
        : "clear",
    resources: !resourcesKnown
      ? "unavailable"
      : capacity > 0
        ? "clear"
        : "conflict",
  });
  for (let index = 0; index < pending.length; index += 1) {
    const { target, settled } = pending[index];
    const id = `#${target}`;
    if (Object.hasOwn(observations, id)) continue;
    if (clock() - started > budgetMs) budgetExceeded = true;
    if (budgetExceeded || contexts.size >= 256) {
      observations[id] = { status: "unavailable" };
      continue;
    }
    let issueRead = false;
    try {
      const issue = await github.issue(target);
      issueRead = true;
      if (issue?.number !== target || issue.pull_request) {
        observations[id] = { status: "missing" };
        continue;
      }
      // A prerequisite reached only because other work needs it merged is
      // settled once its closing pull request is on the target branch. Its own
      // history is then irrelevant and is not read.
      if (settled) {
        const existing = items.get(target)?.value;
        const proof = await integrated({ github, config, issue, existing });
        proofs.set(target, proof);
        if (proof) {
          const contextRevision = digest({
            issue: target,
            state: issue.state,
            proof,
          });
          observations[id] = {
            status: "found",
            value: {
              id,
              contextRevision,
              eligibleSinceMs: Date.parse(issue.created_at),
              dependenciesReconciled: true,
              dependencies: [],
              evidence: ["integrated", "implemented"].map((condition) => ({
                condition,
                ...proof,
                contextRevision,
              })),
              admission: gates({
                issue,
                target,
                existing,
                foreignPr: null,
                areas: [],
              }),
            },
          };
          summaries.push({
            id,
            title: issue.title,
            labels: [],
            state: issue.state,
            dependencies: [],
            dependencySources: [],
            dependencyProblems: [],
            governingSources: [],
            foreignPr: null,
            existing: existing?.status ?? null,
            areas: [],
            url: issue.html_url,
            integrated: proof.source,
          });
          continue;
        }
      }
      const [native, comments] = await Promise.all([
        github.paginate(
          `/repos/${config.repository.slug}/issues/${target}/dependencies/blocked_by`,
        ),
        github.issueComments(target),
      ]);
      if (!Array.isArray(native) || !Array.isArray(comments))
        throw new Error("Dependency sources unavailable");
      const originals = [
        { text: issue.body ?? "", source: issue.html_url },
        ...comments.map((comment) => ({
          text: comment.body ?? "",
          source:
            comment.html_url ?? `${issue.html_url}#issuecomment-${comment.id}`,
        })),
      ];
      const governing = await governingTexts(github, config, originals, files);
      const reconciled = reconcileDependencies({
        native,
        texts: governing.texts,
        repo: config.repository.slug,
      });
      const contextRevision = digest({
        issue,
        comments,
        native,
        dependencies: reconciled.dependencies,
        governing: governing.sources,
        problems: [...reconciled.problems, ...governing.problems],
      });
      const existing = items.get(target)?.value;
      const foreignPr = openPulls?.find((pull) =>
        closesIssue(pull.body, target, config.repository.slug),
      );
      const areas = [
        ...(existing?.areas ?? []),
        ...(existing?.brief?.shared_areas ?? []),
        ...(existing?.parked?.areas ?? []),
        ...(candidateAreas[target] ?? []),
      ];
      for (const text of governing.texts)
        for (const line of text.text.split(/\r?\n/))
          if (/shared[- ]areas?\s*:/i.test(line))
            areas.push(...sharedAreas.filter((area) => line.includes(area)));
      observations[id] = {
        status: "found",
        value: {
          id,
          contextRevision,
          eligibleSinceMs: Date.parse(issue.created_at),
          dependenciesReconciled:
            reconciled.reconciled && governing.problems.length === 0,
          dependencies: reconciled.dependencies,
          evidence: [],
          admission: gates({ issue, target, existing, foreignPr, areas }),
        },
      };
      const summary = {
        id,
        title: issue.title,
        labels: (issue.labels ?? []).map((label) =>
          typeof label === "string" ? label : label.name,
        ),
        state: issue.state,
        dependencies: reconciled.dependencies.map((edge) =>
          Number(edge.targetId.slice(1)),
        ),
        dependencySources: reconciled.sources,
        dependencyProblems: [...reconciled.problems, ...governing.problems],
        governingSources: governing.sources,
        foreignPr: foreignPr?.html_url ?? null,
        existing: existing?.status ?? null,
        areas: [...new Set(areas)],
        url: issue.html_url,
      };
      summaries.push(summary);
      contexts.set(target, { issue, existing, summary });
      // Only an authorized issue's direct prerequisites decide its admission:
      // a merged prerequisite is settled, and an unmerged one blocks whatever
      // lies behind it. Nothing further back is read.
      if (!approved.has(target)) continue;
      for (const edge of reconciled.dependencies) {
        if (
          ["optional", "informational"].includes(edge.kind) ||
          edge.gatesAdmission === false
        )
          continue;
        const prerequisite = Number(edge.targetId.slice(1));
        const merge = ["integrated", "implemented"].includes(edge.requires);
        pending.push({ target: prerequisite, settled: merge });
        if (merge) neededIntegration.add(prerequisite);
      }
    } catch (error) {
      observations[id] = {
        status: !issueRead && error?.status === 404 ? "missing" : "unavailable",
      };
    }
  }
  for (const target of neededIntegration) {
    const context = contexts.get(target);
    if (!context) continue;
    const observation = observations[`#${target}`];
    try {
      if (!proofs.has(target) && clock() - started > budgetMs)
        throw new Error("Observation budget exceeded");
      const proof = proofs.has(target)
        ? proofs.get(target)
        : await integrated({ github, config, ...context });
      if (proof)
        for (const condition of ["integrated", "implemented"])
          observation.value.evidence.push({
            condition,
            ...proof,
            contextRevision: observation.value.contextRevision,
          });
    } catch {
      observations[`#${target}`] = { status: "unavailable" };
      context.summary.dependencyProblems.push({
        source: context.issue.html_url,
        code: "integration-evidence-unavailable",
      });
    }
  }
  const scopeRevision = scopeDigest(scope);
  return {
    observedAt: new Date(nowMs).toISOString(),
    budgetExceeded,
    factoryDocument,
    scopeDocument,
    reservationDocument,
    scopeRevision,
    scopeDocumentRevision: scopeDocument.revision,
    items,
    reservations,
    capacity,
    active,
    summaries,
    input: {
      scope: {
        revision: scopeRevision,
        approvedIssueIds: scope.issues.map((target) => `#${target}`),
      },
      items: observations,
    },
  };
}
