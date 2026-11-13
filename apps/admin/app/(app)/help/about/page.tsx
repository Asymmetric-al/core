import {
  getBuildInfo,
  getGitHubLicenseUrl,
  getGitHubSourceTreeUrl,
} from "@asym/lib/build-info";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { ExternalLink } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const build = getBuildInfo();
  const sourceUrl = getGitHubSourceTreeUrl(build.ref);
  const licenseUrl = getGitHubLicenseUrl(build.ref);

  return (
    <PageShell
      title="About"
      description="Version, source code and license for this deployment."
      density="compact"
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            <h2>Deployment</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <dt className="text-muted-foreground">Product</dt>
            <dd className="font-medium sm:col-span-2">
              Mission Control, by asymmetric.al
            </dd>

            <dt className="text-muted-foreground">Version</dt>
            <dd className="font-mono sm:col-span-2">{build.displayRef}</dd>

            <dt className="text-muted-foreground">Build date</dt>
            {build.buildDate ? (
              <dd className="font-mono sm:col-span-2">{build.buildDate}</dd>
            ) : (
              <dd className="text-muted-foreground sm:col-span-2">
                Not recorded
              </dd>
            )}
          </dl>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium">
                Source for this deployment
              </div>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-foreground underline"
              >
                View the source for this deployment{" "}
                <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                {sourceUrl}
              </p>
              {build.refSource === "fallback" && (
                <p className="text-xs text-muted-foreground mt-1">
                  This build has no recorded commit, so the link opens the{" "}
                  {build.ref} branch.
                </p>
              )}
            </div>

            <div>
              <div className="text-sm font-medium">License</div>
              <p className="text-muted-foreground text-sm mt-1">
                This software is licensed under the GNU Affero General Public
                License v3.0 only (AGPL-3.0-only).
              </p>
              <a
                href={licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-foreground underline"
              >
                Read the license{" "}
                <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>

            <div>
              <div className="text-sm font-medium">Warranty</div>
              <p className="text-muted-foreground text-sm mt-1">
                This program comes with no warranty. We provide it as is,
                without warranties or conditions of any kind, to the extent
                permitted by law.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
