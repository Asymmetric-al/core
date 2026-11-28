import { Badge } from "@asym/ui/components/shadcn/badge";

import { LEVEL_LABELS, isUnreviewed, type Worker } from "./workers-api";

export const REASON_GUIDANCE =
  "Say why, not who or where. Do not write a name, a place or contact details: reasons are kept in the audit log, which platform administrators can read.";

export const DO_NOT_PUBLISH_NOTE =
  "Takes their updates out of every feed but their own and a reviewer’s now; hiding profiles and pages arrives in a later publishing update.";

const LEVEL_VARIANTS = {
  standard: "secondary",
  sensitive: "info",
  restricted: "warning",
  high_risk: "destructive-subtle",
} as const;

export function WorkerBadges({ worker }: { worker: Worker }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Badge variant={LEVEL_VARIANTS[worker.securityLevel]}>
        {LEVEL_LABELS[worker.securityLevel]}
      </Badge>
      {worker.doNotPublish ? (
        <Badge variant="outline">Do not publish</Badge>
      ) : null}
      {isUnreviewed(worker) ? (
        <Badge variant="warning">Security level unreviewed</Badge>
      ) : null}
    </span>
  );
}

const DOES_NOT_CHANGE = [
  "A Web Studio giving page made from a template keeps the title and address it was made with.",
  "A fund named after the worker keeps its name. A restriction does not rename a fund; staff rename it.",
  "Notes staff typed on gift allocations stay as written.",
  "The worker's login photo on gift rows still shows, and a photo or media file already attached to one of their updates stays reachable at its address, until a later publishing update.",
  "Emails already sent cannot be recalled.",
  "A donor record entered without a link to this worker, and tasks or notes colleagues wrote before, can still name them. The donor app's data interface still returns their biography, mission field, funding figures and login photo.",
  "A page already open elsewhere keeps what it shows until it reloads.",
  "A request already under way finishes with what it read.",
  'Turning on "Do not publish" takes their ministry updates out of every feed but their own and a reviewer’s, and off the public site, at once, but does not hide profiles or giving pages yet; that enforcement comes in a later publishing update.',
];

export function RestrictionEffects() {
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <p>
        <strong className="font-medium text-foreground">
          What a restriction changes.
        </strong>{" "}
        From the moment you confirm, this worker is shown only by their public
        alias, or not named, in the donor portal (gifts, history, receipts and
        statements), the Ministry Updates feed, comments (with no photo),
        updated receipts made from now on and receipt PDFs downloaded again, and
        colleagues&apos; Partners, Home, tasks, follow requests and giving
        figures when this person gives to or follows a colleague. Their ministry
        updates leave every feed but their own and a reviewer’s, and the public
        site, at once, and return when the restriction is lifted.
      </p>
      <p>
        <strong className="font-medium text-foreground">
          What it does not change.
        </strong>
      </p>
      <ol className="flex list-decimal flex-col gap-1 pl-5">
        {DOES_NOT_CHANGE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </div>
  );
}
