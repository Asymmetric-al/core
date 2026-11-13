# Round13r2 collector scheduling decision

Root decision, 2026-11-12 Asia/Bangkok: disjoint area collectors may overlap on localhost:3031. This supersedes the planning document's sequential-only scheduling assumption for this run. It does not relax freeze, fixture preflight, provenance, semantic checks, or completion requirements.

Source inspected: fixture-preflight.mjs regenerates the bundle in memory/stdout and explicitly writes no fixture data file; TypeScript uses --incremental false. capture-workspaces.mjs and check-workspaces.mjs create separate browser contexts, pages and output directories per invocation. resetStudioState runs only when Studio is selected and after Studio states. Only the Studio collector owns scratch CMS mutation/reset. Other collectors must not select Studio or perform installed CMS journeys. Root will wait for all collectors before changing runtime/configuration or running the installed published-address journey.

Overlapping runs share CPU and the development server. Timeouts and unfinished loading remain failures/limitations; these artifacts establish no performance benchmark. All stderr, actual intervals, waits and retries must be retained. A source, fixture-bundle, runtime or semantic conflict stops the affected run. No collector may stop another collector's processes. The final runtime declaration must disclose overlap rather than assert sequential execution.

Chrome direct launch through repository playwright-core succeeded with channel chrome, headless true; version 157.0.8103.50. Installed path C:/Program Files/Google/Chrome/Application/chrome.exe. Preserve PROGRAMFILES, PROGRAMFILES(X86), LOCALAPPDATA process variables. No browser installation, environment-file or harness changes required.
