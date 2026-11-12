import {
  getBuildInfo,
  getGitHubLicenseUrl,
  getGitHubSourceTreeUrl,
} from "@asym/lib/build-info";
import { PageHeader } from "@asym/ui/components/page-header";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { ExternalLink } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The software behind your dashboard and where to find it.",
};

export default function AboutPage() {
  const build = getBuildInfo();
  const sourceUrl = getGitHubSourceTreeUrl(build.ref);
  const licenseUrl = getGitHubLicenseUrl(build.ref);
  const recorded = build.refSource === "env";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-20">
      <PageHeader
        title="About this app"
        description="The software behind your dashboard and where to find it."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            <h2>This version</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Software</dt>
            <dd className="col-span-2 font-medium text-foreground">
              asymmetric.al
            </dd>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="col-span-2 font-medium text-foreground tabular-nums">
              {recorded ? build.displayRef : "Development build"}
            </dd>
            {build.buildDate ? (
              <>
                <dt className="text-muted-foreground">Built</dt>
                <dd className="col-span-2 font-medium text-foreground tabular-nums">
                  {build.buildDate}
                </dd>
              </>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            <h2>Open source</h2>
          </CardTitle>
          <CardDescription>
            This app is free software under the GNU Affero General Public
            License v3.0 (AGPL-3.0-only). Anyone can read, change and share its
            source code.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              View the source code
              <ExternalLink aria-hidden data-icon="inline-end" />
            </a>
            <a
              href={licenseUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Read the license
              <ExternalLink aria-hidden data-icon="inline-end" />
            </a>
          </div>
          {recorded ? null : (
            <p className="text-sm text-muted-foreground">
              This build didn’t record its exact version, so the source link
              opens the latest code.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            It comes with no warranty, to the extent the law allows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
