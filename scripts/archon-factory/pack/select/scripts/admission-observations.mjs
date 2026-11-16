import { createHash } from "node:crypto";

import { hasUnconfirmedCleanup } from "../../.shared/cleanup-state.mjs";
import { FACTORY_MARKER } from "../../.shared/readiness.mjs";
import {
  RESERVATIONS,
  TERMINAL,
  factoryPermitsIntake,
  issueDocument,
  validWorkItem,
} from "../../.shared/workitem.mjs";
import { admissionGates, scopeDigest } from "./intake-logic.mjs";

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

const RANGE = /(?<![\w/#])#(\d+)\s*(?:to|through|thru|[-–—])\s*#(\d+)\b/g;
const RANGE_LIMIT = 25;

function references(text, repo) {
  const found = new Set();
  const foreign = new Set();
  const pattern =
    /https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/(?:issues|pull)\/(\d+)|\b([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)#(\d+)|(?<![\w#])(?<!(?<!\d)\/)#(\d+)\b/g;
  for (const match of text.matchAll(pattern)) {
    const repository = match[1] ?? match[3];
    const target = Number(match[2] ?? match[4] ?? match[5]);
    if (!number(target)) continue;
    if (repository && repository.toLowerCase() !== repo.toLowerCase())
      foreign.add(`${repository}#${target}`);
    else found.add(target);
  }
  // A range ("#2223 to #2225", "#2223–#2225") names every issue in it. One
  // too wide to be a prerequisite list is reported, never guessed at.
  const wide = [];
  for (const match of text.matchAll(RANGE)) {
    const [from, to] = [Number(match[1]), Number(match[2])];
    if (!number(from) || !(from < to)) continue;
    if (to - from > RANGE_LIMIT) wide.push(`#${from}-#${to}`);
    else for (let inner = from + 1; inner < to; inner += 1) found.add(inner);
  }
  return { local: [...found], foreign: [...foreign], wide };
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

// A statement that denies a dependency ("not blocked by #2268", "no relation
// and no dependency", "has no open blockers") declares none. The denial is
// taken out of its sentence together with the issues it names, so a real
// prerequisite stated beside it ("not blocked by #50 but requires #51",
// "requires #51, not #50") is still read and the denied issue is not. Only a
// negated dependency word, or a negated issue reference, is a denial: the
// negation must stand directly before it, or be separated from it by one of
// a few qualifiers ("no longer", "no open"). A negation about something else
// in the sentence ("not ready because blocked by #50", "has no UI but
// requires #60") denies nothing.
const REFERENCE = String.raw`(?:https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/(?:issues|pull)\/\d+|(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)?#\d+)`;
const REFERENCES = String.raw`(?:\s*(?:,|&|\/|and|or|nor|to|through|thru|[-–—])?\s*${REFERENCE})+`;
const NEGATED = String.raw`\b(?:not|no|never|neither|nor|without|isn't|aren't|wasn't|weren't|doesn't|don't|didn't|won't|cannot|can't)\s+(?:(?:longer|currently|yet|actually|really|directly|open|hard|known|other|remaining|outstanding|further|new|any)\s+){0,2}(?:relation|related|dependenc(?:y|ies)|depend(?:s|ent)?(?:\s+on)?|blocked(?:\s+by)?|blockers?|prerequisites?|requires?|required|(?:queued\s+)?after)\b`;
const DENIAL = new RegExp(
  String.raw`${NEGATED}(?:\s+(?:on|by|to|with))?(?:${REFERENCES})?|\b(?:not|nor)\s+(?:(?:on|by)\s+)?${REFERENCES}`,
  "gi",
);

// One line as its sentences: a sentence is classified by its own words, so
// "Depends on #50. It is related to #51." is one hard and one soft statement.
// A heading stays whole, and common abbreviations do not end a sentence.
function sentences(raw, heading) {
  if (heading) return [raw];
  return raw.split(
    /(?<!\b(?:e\.g|i\.e|vs|cf|etc|approx)\.)(?<=[.!?])\s+(?=[A-Z(#])/,
  );
}

function dependencyText(text, source, repo) {
  const edges = [];
  const problems = [];
  let section = null;
  let sectionAdmissionKnown = false;
  let depth = 0;
  const directive =
    /\b(?:(?:implementation|dispatch|qualification|release)\s+(?:prerequisites?|dependencies|gates?)|prerequisites?|dependencies|depends on|blocked by|requires|after|(?:non[- ]|not )?optional|informational|related)\b/i;
  const listItem = /^(?:[-+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/;
  // A semicolon starts a new statement, except inside a bare list of issues
  // ("depends on #50; #51"). An issue followed by words ("#51 is required")
  // is a statement of its own.
  for (const rawLine of prose(text).split(
    /\r?\n|;(?!\s*#\d+\s*(?:[.,;&/)]|and\b|or\b|\r?\n|$))\s*/,
  )) {
    const lineHeading = /^(#{1,6})\s+(.+)$/.exec(rawLine.trim());
    const lineIsList = listItem.test(rawLine.replace(/[*`]/g, "").trim());
    for (const [index, raw] of sentences(rawLine, lineHeading).entries()) {
      const heading = index === 0 ? lineHeading : null;
      if (heading && heading[1].length <= depth) section = null;
      const stated = (heading?.[2] ?? raw).replace(/[*`]/g, "").trim();
      if (!stated) continue;
      const line = heading ? stated : stated.replace(DENIAL, " ").trim();
      const denied = line !== stated;
      const match = directive.exec(line);
      if (heading) {
        section = match ? dependencyKind(line) : null;
        sectionAdmissionKnown = /admission|non[- ]gating/i.test(line);
        depth = heading[1].length;
      }
      // Every sentence of a list item belongs to that item.
      const list = lineIsList;
      // A denial with nothing else stated declares nothing, in a list too.
      if (denied && !match) continue;
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
      const {
        local: targets,
        foreign,
        wide,
      } = references(match ? line.slice(match.index) : line, repo);
      if (
        wide.length &&
        !["optional", "informational"].includes(kind.kind) &&
        kind.gatesAdmission !== false
      )
        problems.push({
          source,
          code: "dependency-range-too-wide",
          targetIds: wide,
          text: line.slice(0, 300),
        });
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
          !/\bnone\b|no (?:hard )?(?:prerequisites?|dependencies)\b/i.test(
            label,
          )
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
  // "Related to #50" beside "depends on #50" is no contradiction: the
  // prerequisite stands and the mention is kept as a mention. Any other pair
  // of different statements about one issue is a conflict a person settles.
  const mention = (edge) => edge.kind === "informational";
  for (const { source, ...edge } of observed) {
    const previous = classified.get(edge.targetId);
    const differs = previous && signature(previous.edge) !== signature(edge);
    const compatible = differs && mention(edge) !== mention(previous.edge);
    if (differs && !compatible)
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
    if (!(compatible && mention(edge)))
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
    const proof = await mergedOnTarget({
      github,
      config,
      number: candidate,
      closes: issue.number,
    });
    if (proof) return proof;
  }
  return null;
}

// Proof that one pull request is merged on the target branch and its merge
// commit is still part of it; with `closes`, also that it says it closes
// that issue.
async function mergedOnTarget({ github, config, number: wanted, closes }) {
  const { slug, targetBranch } = config.repository;
  const pull = await github.pull(wanted);
  if (
    !pull ||
    pull.number !== wanted ||
    pull.merged !== true ||
    pull.base?.ref !== targetBranch ||
    pull.base?.repo?.full_name?.toLowerCase() !== slug.toLowerCase() ||
    !/^[a-f0-9]{40}$/.test(pull.merge_commit_sha ?? "") ||
    (closes !== undefined && !closesIssue(pull.body, closes, slug))
  )
    return null;
  const compare = await github.compare(pull.merge_commit_sha, targetBranch);
  return ["identical", "ahead"].includes(compare?.status) &&
    compare.merge_base_commit?.sha === pull.merge_commit_sha
    ? { source: pull.html_url, revision: pull.merge_commit_sha }
    : null;
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
  const gates = ({ issue, target, existing, foreignPr, areas }) =>
    admissionGates({
      issue: target,
      existing,
      foreignPr,
      capacity,
      reservations,
      areas,
      intakeOpen: factoryPermitsIntake(factoryDocument.value).ok,
      issueOpen: issue.state === "open",
      ownersKnown: items.has(target) && Boolean(openPulls),
      resourcesKnown,
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
      // Work is assigned by issue: a pull request cannot be in the scope.
      if (
        issue?.number !== target ||
        (issue.pull_request && approved.has(target))
      ) {
        observations[id] = { status: "missing" };
        continue;
      }
      // A prerequisite outside the authorized scope decides one thing only:
      // whether its closing pull request is merged on the target branch. A
      // merged one is settled; an unmerged one blocks the issue that needs
      // it. Its own text and history decide nothing and are not read. A
      // prerequisite named by its pull request is settled when that pull
      // request is merged there.
      if (!approved.has(target)) {
        const existing = items.get(target)?.value;
        const proof = !settled
          ? null
          : issue.pull_request
            ? await mergedOnTarget({ github, config, number: target })
            : await integrated({ github, config, issue, existing });
        proofs.set(target, proof);
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
            evidence: proof
              ? ["integrated", "implemented"].map((condition) => ({
                  condition,
                  ...proof,
                  contextRevision,
                }))
              : [],
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
          integrated: proof?.source ?? null,
        });
        continue;
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
        // The factory's own comments say what it did, not what the issue
        // depends on.
        ...comments
          .filter((comment) => !comment.body?.includes(FACTORY_MARKER))
          .map((comment) => ({
            text: comment.body ?? "",
            source:
              comment.html_url ??
              `${issue.html_url}#issuecomment-${comment.id}`,
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
