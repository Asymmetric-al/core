import {
  getBuildInfo,
  getGitHubLicenseUrl,
  getGitHubSourceTreeUrl,
} from "@asym/lib/build-info";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

export default function AboutPage() {
  const build = getBuildInfo();
  const sourceUrl = getGitHubSourceTreeUrl(build.ref);
  const licenseUrl = getGitHubLicenseUrl(build.ref);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          About asymmetric.al
        </h1>
        <p className="text-zinc-500 mt-1">
          Build and licensing information for this deployment.
        </p>
      </div>

      <Card className="shadow-sm border-zinc-200 max-w-2xl">
        <CardHeader className="border-b border-zinc-100">
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <dt className="text-zinc-500">Product</dt>
            <dd className="font-medium sm:col-span-2">asymmetric.al</dd>

            <dt className="text-zinc-500">Version</dt>
            <dd className="font-mono sm:col-span-2">{build.displayRef}</dd>

            <dt className="text-zinc-500">Build date</dt>
            <dd className="font-mono sm:col-span-2">
              {build.buildDate ?? "unknown"}
            </dd>
          </dl>

          <div className="space-y-4">
            <div>
              <div className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">
                Source for this deployment
              </div>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block font-mono text-xs text-zinc-900 underline break-all"
              >
                {sourceUrl}
              </a>
              {build.refSource === "fallback" && (
                <p className="text-xs text-zinc-500 mt-1">
                  This deployment did not expose a commit/tag; link falls back
                  to `{build.ref}`.
                </p>
              )}
            </div>

            <div>
              <div className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">
                License
              </div>
              <p className="text-zinc-700 text-sm mt-1">
                This software is licensed under the GNU Affero General Public
                License v3.0 only (AGPL-3.0-only).
              </p>
              <a
                href={licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block font-mono text-xs text-zinc-900 underline break-all"
              >
                {licenseUrl}
              </a>
            </div>

            <div>
              <div className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">
                Warranty
              </div>
              <p className="text-zinc-700 text-sm mt-1">
                This program comes with no warranty. We provide it as is,
                without warranties or conditions of any kind, to the extent
                permitted by law.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
