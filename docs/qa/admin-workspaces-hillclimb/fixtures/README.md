# Candidate fixture checks

The fixture source files were copied from the frozen round 12 harness into this
candidate checkout. Generated fixture data and captures were not copied.

Both capture runners require `../fixture-preflight.mjs` before launching a
browser. It verifies that the API/database workspace links resolve into this
checkout, runs the fixture TypeScript project, rebuilds the bundle to stdout,
then feeds that exact bundle to the existing 1,645 contract/route checks via
stdin. The runners pass the verified bundle directly to `installApiFixtures`;
they do not load a saved `fixtures.json`. A failed step stops the run.

The child processes disable `.env` loading, use the unit-test environment
convention with a fictional backend URL, and clear the service-role key. The
preflight writes no data file. A future capture/check run writes its proof
(candidate root, time, bundle SHA-256 and check result) to its output directory.

Run the same local checks without a browser or a server:

```powershell
node --test docs/qa/admin-workspaces-hillclimb/harness.test.mjs
node --input-type=module -e "import { prepareFixtureBundle } from './docs/qa/admin-workspaces-hillclimb/fixture-preflight.mjs'; const { proof } = prepareFixtureBundle(); console.log(JSON.stringify(proof, null, 2));"
```

The TypeScript proof covers CRM/Contributions builders and response contracts.
The module fixture remains handwritten; the harness test additionally checks
Reports completeness and deliberate API failure behavior. These checks do not
establish tenant integration, visual quality, or complete grouping/trend data.

The exporter's default file-writing mode remains available for its existing
manual callers. The capture runners always use its `--stdout` mode and the
verifier's `--stdin` mode.
