import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Council round 1, A19 (record D-19). The OSS scanner's harness started
 * every app with `--hostname 127.0.0.1`. Mission Control and the missionary
 * workspace serve every signed-in page through their proxy's rewrite of the
 * tenant address; bound to a loopback IP literal, Next sends that rewrite out
 * of the server and the proxy answers 500. They bind the loopback name,
 * resolved IPv4 first, as `scripts/github/e2e-dev-server.sh` does, so the
 * harness still reaches them on 127.0.0.1.
 *
 * The script runs only as root inside the scanner image at /src, so this
 * reads its launch from the source rather than running it.
 */
const SCRIPT = readFileSync(".oss-scanner/start-services.sh", "utf8");

describe("the OSS scanner's app servers", () => {
  it("bind Mission Control and the missionary workspace by the loopback name, IPv4 first", () => {
    expect(SCRIPT).toMatch(
      /case "\$app" in admin\|missionary\) host=localhost ;; \*\) host=127\.0\.0\.1 ;; esac/,
    );
    expect(SCRIPT).toContain(
      'export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--dns-result-order=ipv4first"',
    );
    expect(SCRIPT).toContain('--port "$3" --hostname "$4"');
    expect(SCRIPT).not.toContain("--hostname 127.0.0.1");
  });

  it("still probes every app on 127.0.0.1", () => {
    expect(SCRIPT).toContain('"http://127.0.0.1:$port/api/health"');
  });
});
