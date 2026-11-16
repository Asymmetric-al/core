// TEST-ONLY stand-in for the installed control.mjs in the Playwright run. The
// production Console runs `node <script> <command> ...` exactly as on VM 100;
// this forwards the argv to the loopback fixture server's fake control runner.
const response = await fetch("http://127.0.0.1:39994/fixture/control", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ argv: process.argv.slice(2), env: process.env }),
});
const result = await response.json();
process.stdout.write(result.stdout ?? "");
process.exitCode = result.code ?? 1;
