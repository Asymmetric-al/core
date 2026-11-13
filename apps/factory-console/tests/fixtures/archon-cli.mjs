// TEST-ONLY stand-in for the Archon CLI binary in the Playwright run. The
// production Console spawns it exactly as it spawns /opt/archon/.../archon
// (argv array, minimal environment); it forwards the invocation to the
// loopback fixture server and prints the answer.
const response = await fetch("http://127.0.0.1:39994/fixture/cli", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ argv: process.argv.slice(2), env: process.env }),
});
const result = await response.json();
if (result.stderr) process.stderr.write(`${result.stderr}\n`);
process.stdout.write(result.stdout ?? "");
process.exitCode = result.code ?? 1;
