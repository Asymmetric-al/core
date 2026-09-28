# Preview smoke diagnostic follow-up

The first hosted verification of PR #1915 deployed all three preview surfaces,
then failed each authenticated marker check. The workflow selected per-surface
report/output directories, while the Playwright configuration ignored those
variables. No matching artifacts were uploaded. This follow-up restores that
existing handoff contract; it does not change app authentication, authorization,
Eve admission, smoke assertions, or the failed test outcome.

A local synthetic control also confirmed that ordinary Playwright traces,
HTML report payloads and error-context files retain QA/bypass values. The
credential-bearing smoke suite therefore publishes only bounded diagnostics:
test title, project, failed status, duration, sanitized URL origin/path,
redacted page title/heading, and visible password-input count. Automatic raw
media/DOM capture and API-step/assertion bodies are excluded. Redaction covers
known raw/trimmed, URI, URI-component, form-URL-encoded and UTF-8 base64/base64url
values, including optional padding and either percent-escape hex case. It does
not claim to detect arbitrary transformations.

Cleanup is limited to canonical run report/output directories; external
attachment sources remain untouched. Validation resolves existing symlinks and
the nearest existing parent of new paths before checking workspace/root and
report/output overlap. Playwright and the reporter use these canonical paths;
the reporter revalidates them before cleanup.

The helper also observes the last 50 document/fetch/XHR responses during the
authentication attempt. Only method, status, origin and path survive into the
bundle; query/fragment, headers, cookies and bodies are excluded, and known QA
identity values are redacted. This provides browser-visible response evidence
without a debug API or privileged query. Server-side profile reads may be
absent; these entries alone cannot establish why an access-denied page appears.

Six browser-free unit checks invoke the actual pinned Playwright CLI.
Deliberately failed auth-shaped requests stay failed, separate surface bundles
survive consecutive runs, blank overrides preserve local defaults, raw copies
are removed, and an attachment source outside the output root survives. The
entire final HTML/JSON/output bundle is checked for synthetic credential values
and opaque/compressed artifacts. The encoded-canary case places URL/form/base64
representations in retained URL paths, title, heading and network paths, then
verifies their redaction and preservation of failed status.

The workflow uploads only the dedicated sanitized HTML/JSON paths, never raw
test output. A simulated reporter completion failure leaves a raw dummy secret
behind but produces no uploadable file. Two cases also reject report/output
workspace roots before Playwright startup can clear them. Eight additional
recording-filesystem checks cover symlink aliases to the workspace, its ancestor,
equal or nested new report/output paths, dangling links, paths changed before
cleanup, and valid separate paths. All six CLI
cases, eight path checks and eleven workflow contract tests pass; missing
sanitized artifacts fail the upload step rather than claiming an artifact exists.

A separate actual Chromium comparison uses dummy credentials and a localhost
server. The old configuration retains all five canaries across 27 files,
including recursively decoded ZIP/base64 report content.
The candidate preserves the failed marker check and emits four readable files
without any canary. This is artifact-handling proof, not successful live login.

Live aggregate route counts include `/no-access` on admin and missionary and
public routes on donor. These counts do not identify which requests came from
QA or establish an ordered post-login flow. The actual QA final URL and any
profile, membership, tenant or role cause remain unproven. Task 2.5 remains open;
the next authorized Actions run must use its existing opaque QA secrets to
capture safe current-head evidence and the actual smoke assertions must pass.
