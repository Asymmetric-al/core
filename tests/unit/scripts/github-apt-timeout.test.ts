import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const TIMEOUT_FLAG = "timeout --kill-after=10s";
const POSITIVE_INSTALL_TIMEOUT_PATTERN =
  '[[ "$APT_GET_INSTALL_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]';
const POSITIVE_UPDATE_TIMEOUT_PATTERN =
  '[[ "$APT_GET_TIMEOUT_SECONDS" =~ ^[1-9][0-9]*$ ]]';

function readScript(relativePath: string): string {
  return readFileSync(relativePath, "utf8");
}

const fixtureRoots: string[] = [];
const aptScripts = [
  "prepare-apt.sh",
  "install-canvas-deps.sh",
  "install-postgresql-client.sh",
] as const;
type AptScript = (typeof aptScripts)[number];

afterEach(() => {
  for (const root of fixtureRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

// Exercise the unmodified Bash entrypoints. Only privilege escalation, package
// management, GNU timeout and elapsed time are faked at their process boundaries.
// APT_ETC_DIR selects fixture files; production defaults remain /etc/apt.
// These guards are defense in depth, not a substitute for execution isolation.
function aptFixture(files: Record<string, string> = {}) {
  const root = mkdtempSync(path.resolve(".apt-fixture-"));
  fixtureRoots.push(root);
  const aptDir = path.join(root, "etc", "apt");
  const binDir = path.join(root, "bin");
  const stateDir = path.join(root, "state");
  for (const directory of [
    binDir,
    stateDir,
    path.join(aptDir, "sources.list.d"),
    path.join(aptDir, "apt.conf.d"),
    path.join(root, "scripts", "github"),
  ]) {
    mkdirSync(directory, { recursive: true });
  }
  for (const script of aptScripts) {
    writeFileSync(
      path.join(root, "scripts", "github", script),
      readScript(`scripts/github/${script}`),
    );
  }
  for (const [file, contents] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(aptDir, file)), { recursive: true });
    writeFileSync(path.join(aptDir, file), contents);
  }
  const fakes: Record<string, string> = {
    sudo: `for argument in "$@"; do
  case "$argument" in
    /*) case "$argument" in "$FIXTURE_ROOT"/*) ;; *) echo "refusing host path: $argument" >&2; exit 97 ;; esac ;;
  esac
done
exec "$@"`,
    timeout: `printf 'timeout %s\\n' "$*" >> "$FIXTURE_STATE/calls"
if [ "$#" -lt 3 ] || [ "$1" != "--kill-after=10s" ]; then exit 96; fi
shift 2
exec "$@"`,
    "apt-get": `printf 'apt-get %s\\n' "$*" >> "$FIXTURE_STATE/calls"
case "$1" in update|install) operation="$1" ;; *) exit 95 ;; esac
counter="$FIXTURE_STATE/$operation-count"
count=0
if [ -f "$counter" ]; then read -r count < "$counter"; fi
count=$((count + 1))
printf '%s\\n' "$count" > "$counter"
status=$(sed -n "\${count}p" "$FIXTURE_STATE/$operation-statuses")
exit "\${status:-0}"`,
    sleep: `printf 'sleep %s\\n' "$*" >> "$FIXTURE_STATE/calls"`,
  };
  for (const [command, body] of Object.entries(fakes)) {
    const file = path.join(binDir, command);
    writeFileSync(file, `#!/usr/bin/env bash\nset -euo pipefail\n${body}\n`);
    chmodSync(file, 0o755);
  }

  return {
    exists(file: string) {
      return existsSync(path.join(aptDir, file));
    },
    read(file: string) {
      return readFileSync(path.join(aptDir, file), "utf8");
    },
    run({
      script = "prepare-apt.sh",
      updateStatuses = [0],
      installStatuses = [0],
      env = {},
    }: {
      script?: AptScript;
      updateStatuses?: number[];
      installStatuses?: number[];
      env?: Record<string, string>;
    } = {}) {
      writeFileSync(path.join(stateDir, "calls"), "");
      for (const [operation, statuses] of [
        ["update", updateStatuses],
        ["install", installStatuses],
      ] as const) {
        writeFileSync(
          path.join(stateDir, `${operation}-statuses`),
          `${statuses.join("\n")}\n`,
        );
        rmSync(path.join(stateDir, `${operation}-count`), { force: true });
      }
      const result = spawnSync("bash", [`scripts/github/${script}`], {
        cwd: root,
        encoding: "utf8",
        timeout: 10_000,
        env: {
          PATH: `${binDir}:/usr/bin:/bin`,
          HOME: root,
          TMPDIR: root,
          LANG: "C",
          FIXTURE_ROOT: root,
          FIXTURE_STATE: stateDir,
          APT_ETC_DIR: aptDir,
          ...env,
        },
      });
      return {
        status: result.status,
        stderr: result.stderr,
        stdout: result.stdout,
        error: result.error,
        calls: readFileSync(path.join(stateDir, "calls"), "utf8")
          .split("\n")
          .filter(Boolean),
      };
    },
  };
}

function jobBlock(workflow: string, jobId: string): string {
  const jobsStart = workflow.indexOf("jobs:\n");
  expect(jobsStart).toBeGreaterThanOrEqual(0);

  const jobsYaml = workflow.slice(jobsStart);
  const headers = [...jobsYaml.matchAll(/^  ([a-z0-9][a-z0-9-]*):/gm)];
  const index = headers.findIndex((match) => match[1] === jobId);
  expect(index).toBeGreaterThanOrEqual(0);

  const blockStart = headers[index].index!;
  const blockEnd =
    index + 1 < headers.length ? headers[index + 1].index! : jobsYaml.length;

  return jobsYaml.slice(blockStart, blockEnd);
}

function expectJobLevelTimeout(block: string, jobId: string, minutes: number) {
  expect(block).toMatch(
    new RegExp(`^  ${jobId}:\\n(?:  .*\\n)*    timeout-minutes: ${minutes}\\n`),
  );
}

function expectTimeoutWrappedInstall(script: string) {
  expect(script).toMatch(
    /sudo timeout --kill-after=10s "\$\{APT_GET_INSTALL_TIMEOUT_SECONDS\}s" \\\n\s+apt-get install -y/,
  );
  expect(script).toMatch(
    /if ! bounded_apt_install; then\n(?:.*\n)*?  bounded_apt_install\nfi/,
  );
}

function expectPositiveInstallTimeoutValidatedBeforeRetry(script: string) {
  const defaultIndex = script.indexOf(
    'APT_GET_INSTALL_TIMEOUT_SECONDS="${APT_GET_INSTALL_TIMEOUT_SECONDS:-600}"',
  );
  const validationIndex = script.indexOf(POSITIVE_INSTALL_TIMEOUT_PATTERN);
  const retryIndex = script.indexOf("if ! bounded_apt_install; then");

  expect(defaultIndex).toBeGreaterThanOrEqual(0);
  expect(validationIndex).toBeGreaterThan(defaultIndex);
  expect(retryIndex).toBeGreaterThan(validationIndex);
  expect(script).toContain("must be a positive integer");
}

function expectPositiveUpdateTimeoutValidatedBeforeRetry(script: string) {
  const defaultIndex = script.indexOf(
    'APT_GET_TIMEOUT_SECONDS="${APT_GET_TIMEOUT_SECONDS:-180}"',
  );
  const validationIndex = script.indexOf(POSITIVE_UPDATE_TIMEOUT_PATTERN);
  const retryIndex = script.indexOf("if ! bounded_apt_get update; then");

  expect(defaultIndex).toBeGreaterThanOrEqual(0);
  expect(validationIndex).toBeGreaterThan(defaultIndex);
  expect(retryIndex).toBeGreaterThan(validationIndex);
  expect(script).toContain(
    "APT_GET_TIMEOUT_SECONDS must be a positive integer",
  );
}

describe("github apt install scripts bound hung metadata fetches", () => {
  it("wraps apt-get update with GNU timeout and retries once", () => {
    const prepare = readScript("scripts/github/prepare-apt.sh");

    expect(prepare).toContain(TIMEOUT_FLAG);
    expect(prepare).toContain('apt-get "$@"');
    expect(prepare).toContain("bounded_apt_get update");
    expect(prepare).toContain("retrying once");
    expect(prepare).toContain("APT_GET_TIMEOUT_SECONDS");
  });

  it("wraps canvas and postgres client installs with a longer GNU timeout and retries once", () => {
    const canvas = readScript("scripts/github/install-canvas-deps.sh");
    const postgres = readScript("scripts/github/install-postgresql-client.sh");

    expectTimeoutWrappedInstall(canvas);
    expectTimeoutWrappedInstall(postgres);
    expect(canvas).toContain("APT_GET_INSTALL_TIMEOUT_SECONDS");
    expect(canvas).toContain(":-600");
    expect(canvas).toContain("retrying once");
    expect(postgres).toContain("APT_GET_INSTALL_TIMEOUT_SECONDS");
    expect(postgres).toContain(":-600");
    expect(postgres).toContain("retrying once");
  });

  it("rejects non-positive update timeouts before retrying apt-get update", () => {
    expectPositiveUpdateTimeoutValidatedBeforeRetry(
      readScript("scripts/github/prepare-apt.sh"),
    );
  });

  it("rejects non-positive install timeouts before retrying apt-get install", () => {
    const canvas = readScript("scripts/github/install-canvas-deps.sh");
    const postgres = readScript("scripts/github/install-postgresql-client.sh");

    expectPositiveInstallTimeoutValidatedBeforeRetry(canvas);
    expectPositiveInstallTimeoutValidatedBeforeRetry(postgres);
  });

  it("caps lint and migrate jobs so hung apt cannot occupy a runner for 6 hours", () => {
    const ci = readScript(".github/workflows/ci.yml");
    const integration = readScript(".github/workflows/ci-integration.yml");

    expectJobLevelTimeout(jobBlock(ci, "lint"), "lint", 25);
    expectJobLevelTimeout(jobBlock(integration, "migrate"), "migrate", 50);
  });
});

const ubuntuSources = [
  [
    "mirror-file",
    "mirror+file:/etc/apt/apt-mirrors.txt",
    "https://archive.ubuntu.com/ubuntu",
  ],
  [
    "HTTP Azure",
    "http://azure.archive.ubuntu.com/ubuntu",
    "https://archive.ubuntu.com/ubuntu",
  ],
  [
    "HTTPS Azure",
    "https://azure.archive.ubuntu.com/ubuntu/",
    "https://archive.ubuntu.com/ubuntu/",
  ],
  [
    "HTTP archive",
    "http://archive.ubuntu.com/ubuntu/",
    "https://archive.ubuntu.com/ubuntu/",
  ],
  [
    "HTTP security",
    "http://security.ubuntu.com/ubuntu",
    "https://security.ubuntu.com/ubuntu",
  ],
  [
    "HTTPS archive",
    "https://archive.ubuntu.com/ubuntu",
    "https://archive.ubuntu.com/ubuntu",
  ],
  [
    "HTTPS security",
    "https://security.ubuntu.com/ubuntu/",
    "https://security.ubuntu.com/ubuntu/",
  ],
] as const;

describe("github apt prepares existing Ubuntu sources over HTTPS", () => {
  describe.each(["sources.list", "sources.list.d/ubuntu.list"])(
    "legacy %s",
    (file) => {
      it.each(ubuntuSources)(
        "normalizes %s without changing options, suites or components",
        (_name, inputUri, expectedUri) => {
          const fixture = aptFixture({
            [file]: `deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/ubuntu-archive-keyring.gpg] ${inputUri} noble-updates main restricted universe multiverse\ndeb-src ${inputUri} noble-security main universe\n`,
          });
          const result = fixture.run();

          expect({
            status: result.status,
            sources: fixture.read(file),
          }).toEqual({
            status: 0,
            sources: `deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/ubuntu-archive-keyring.gpg] ${expectedUri} noble-updates main restricted universe multiverse\ndeb-src ${expectedUri} noble-security main universe\n`,
          });
        },
      );
    },
  );

  it.each(ubuntuSources)(
    "normalizes Deb822 %s while preserving Signed-By and security pockets",
    (_name, inputUri, expectedUri) => {
      const file = "sources.list.d/ubuntu.sources";
      const fixture = aptFixture({
        [file]: `Types: deb deb-src\nURIs: ${inputUri}\nSuites: noble noble-updates noble-backports noble-security\nComponents: main restricted universe multiverse\nArchitectures: amd64 arm64\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n`,
      });
      const result = fixture.run();

      expect({ status: result.status, sources: fixture.read(file) }).toEqual({
        status: 0,
        sources: `Types: deb deb-src\nURIs: ${expectedUri}\nSuites: noble noble-updates noble-backports noble-security\nComponents: main restricted universe multiverse\nArchitectures: amd64 arm64\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n`,
      });
    },
  );

  it("normalizes official mirror-file entries while preserving unrelated entries", () => {
    const fixture = aptFixture({
      "apt-mirrors.txt":
        "http://azure.archive.ubuntu.com/ubuntu/\nhttps://azure.archive.ubuntu.com/ubuntu/\nhttp://archive.ubuntu.com/ubuntu/\nhttp://security.ubuntu.com/ubuntu/\nhttps://archive.ubuntu.com/ubuntu/\nhttp://mirror.example.org/ubuntu/\n",
    });
    const result = fixture.run();

    expect({
      status: result.status,
      mirrors: fixture.read("apt-mirrors.txt"),
    }).toEqual({
      status: 0,
      mirrors:
        "https://archive.ubuntu.com/ubuntu/\nhttps://archive.ubuntu.com/ubuntu/\nhttps://archive.ubuntu.com/ubuntu/\nhttps://security.ubuntu.com/ubuntu/\nhttps://archive.ubuntu.com/ubuntu/\nhttp://mirror.example.org/ubuntu/\n",
    });
  });

  it("preserves unrelated hosts, repository paths, comments and lookalike endpoints", () => {
    const sources =
      "deb http://mirror.example.org/ubuntu noble main\ndeb http://archive.ubuntu.com.example.org/ubuntu noble main\ndeb http://azure.archive.ubuntu.com.example.org/ubuntu noble main\ndeb http://security.ubuntu.com.example.org/ubuntu noble-security main\ndeb http://archive.ubuntu.com/ubuntu-other noble main\ndeb http://azure.archive.ubuntu.com/ubuntu-other noble main\ndeb http://security.ubuntu.com/ubuntu-other noble-security main\ndeb http://archive.ubuntu.com:8080/ubuntu noble main\ndeb mirror+file:/etc/apt/apt-mirrors.txt.other noble main\n# third-party note: http://archive.ubuntu.com/ubuntu\n";
    const fixture = aptFixture({ "sources.list.d/unrelated.list": sources });
    const result = fixture.run();

    expect({
      status: result.status,
      sources: fixture.read("sources.list.d/unrelated.list"),
    }).toEqual({ status: 0, sources });
  });

  it("preserves mixed Deb822 URI fields, continuation lines and embedded signing keys", () => {
    const file = "sources.list.d/mixed.sources";
    const fixture = aptFixture({
      [file]:
        "Types: deb\nURIs: http://archive.ubuntu.com/ubuntu/ http://mirror.example.org/ubuntu/\n http://security.ubuntu.com/ubuntu/\nSuites: noble noble-security\nComponents: main universe\nArchitectures: amd64\nSigned-By:\n -----BEGIN PGP PUBLIC KEY BLOCK-----\n .\n fixture-key-material\n -----END PGP PUBLIC KEY BLOCK-----\n\nTypes: deb\nURIs: http://vendor.example.org/packages\nSuites: stable\nComponents: main\nSigned-By: /usr/share/keyrings/vendor.gpg\n",
    });
    const result = fixture.run();

    expect({ status: result.status, sources: fixture.read(file) }).toEqual({
      status: 0,
      sources:
        "Types: deb\nURIs: https://archive.ubuntu.com/ubuntu/ http://mirror.example.org/ubuntu/\n https://security.ubuntu.com/ubuntu/\nSuites: noble noble-security\nComponents: main universe\nArchitectures: amd64\nSigned-By:\n -----BEGIN PGP PUBLIC KEY BLOCK-----\n .\n fixture-key-material\n -----END PGP PUBLIC KEY BLOCK-----\n\nTypes: deb\nURIs: http://vendor.example.org/packages\nSuites: stable\nComponents: main\nSigned-By: /usr/share/keyrings/vendor.gpg\n",
    });
  });

  it("leaves already-normalized source and mirror files unchanged on repeated preparation", () => {
    const files = {
      "sources.list":
        "deb https://archive.ubuntu.com/ubuntu noble-updates main\n",
      "sources.list.d/ubuntu.sources":
        "Types: deb\nURIs: https://security.ubuntu.com/ubuntu/\nSuites: noble-security\nComponents: main\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n",
      "apt-mirrors.txt":
        "https://archive.ubuntu.com/ubuntu/\nhttps://security.ubuntu.com/ubuntu/\n",
    };
    const fixture = aptFixture(files);
    const first = fixture.run();
    const second = fixture.run();

    expect({
      statuses: [first.status, second.status],
      files: Object.fromEntries(
        Object.keys(files).map((file) => [file, fixture.read(file)]),
      ),
    }).toEqual({ statuses: [0, 0], files });
  });

  it("remains idempotent after normalizing HTTP and Azure source forms", () => {
    const fixture = aptFixture({
      "sources.list": "deb http://azure.archive.ubuntu.com/ubuntu noble main\n",
      "sources.list.d/security.sources":
        "Types: deb\nURIs: http://security.ubuntu.com/ubuntu/\nSuites: noble-security\nComponents: main\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n",
    });
    const first = fixture.run();
    const second = fixture.run();

    expect({
      statuses: [first.status, second.status],
      archive: fixture.read("sources.list"),
      security: fixture.read("sources.list.d/security.sources"),
    }).toEqual({
      statuses: [0, 0],
      archive: "deb https://archive.ubuntu.com/ubuntu noble main\n",
      security:
        "Types: deb\nURIs: https://security.ubuntu.com/ubuntu/\nSuites: noble-security\nComponents: main\nSigned-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg\n",
    });
  });

  it("retains the existing Microsoft .list disabling behavior", () => {
    const fixture = aptFixture({
      "sources.list.d/microsoft.list":
        "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main\n",
    });
    fixture.run();

    expect(fixture.read("sources.list.d/microsoft.list")).toBe(
      "# disabled by core CI apt prep: deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main\n",
    );
  });

  it("retains the existing Microsoft Deb822 disabling behavior", () => {
    const sources =
      "Types: deb\nURIs: https://packages.microsoft.com/repos/code\nSuites: stable\nComponents: main\nSigned-By: /usr/share/keyrings/microsoft.gpg\n";
    const fixture = aptFixture({ "sources.list.d/microsoft.sources": sources });
    fixture.run();

    expect({
      originalExists: fixture.exists("sources.list.d/microsoft.sources"),
      disabledSources: fixture.read(
        "sources.list.d/microsoft.sources.disabled-by-core-ci",
      ),
    }).toEqual({ originalExists: false, disabledSources: sources });
  });

  it("sets only the established Acquire timeout and retry settings", () => {
    const fixture = aptFixture();
    fixture.run();

    expect(fixture.read("apt.conf.d/99-core-ci-timeouts")).toBe(
      'Acquire::http::Timeout "20";\nAcquire::https::Timeout "20";\nAcquire::Retries "2";\n',
    );
  });
});

const updateCalls = [
  "timeout --kill-after=10s 180s apt-get update",
  "apt-get update",
];
const installCases = [
  [
    "install-canvas-deps.sh",
    "libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev",
  ],
  ["install-postgresql-client.sh", "postgresql-client"],
] as const;
const malformedTimeouts = [
  "0",
  "-1",
  "01",
  "1.5",
  "1s",
  "abc",
  " 20",
  "20 ",
  "1\n2",
];

describe("github apt preserves bounded update behavior", () => {
  it("succeeds on the first update without another attempt or delay", () => {
    const result = aptFixture().run();

    expect({ status: result.status, calls: result.calls }).toEqual({
      status: 0,
      calls: updateCalls,
    });
  });

  it.each([100, 124, 137])(
    "recovers after update failure %i with exactly one bounded retry",
    (firstFailure) => {
      const result = aptFixture().run({ updateStatuses: [firstFailure, 0] });

      expect({ status: result.status, calls: result.calls }).toEqual({
        status: 0,
        calls: [...updateCalls, "sleep 5", ...updateCalls],
      });
    },
  );

  it.each([100, 124, 137])(
    "propagates the final update failure %i without a third attempt",
    (finalFailure) => {
      const result = aptFixture().run({ updateStatuses: [100, finalFailure] });

      expect({ status: result.status, calls: result.calls }).toEqual({
        status: finalFailure,
        calls: [...updateCalls, "sleep 5", ...updateCalls],
      });
    },
  );

  it("uses a configured positive update timeout with the existing kill grace", () => {
    const result = aptFixture().run({ env: { APT_GET_TIMEOUT_SECONDS: "21" } });

    expect({ status: result.status, calls: result.calls }).toEqual({
      status: 0,
      calls: ["timeout --kill-after=10s 21s apt-get update", "apt-get update"],
    });
  });

  it.each(malformedTimeouts)(
    "rejects malformed update timeout %j before invoking apt-get",
    (value) => {
      const result = aptFixture().run({
        env: { APT_GET_TIMEOUT_SECONDS: value },
      });

      expect({
        failed: result.status !== null && result.status !== 0,
        diagnostic: result.stderr.includes(
          "APT_GET_TIMEOUT_SECONDS must be a positive integer",
        ),
        calls: result.calls,
      }).toEqual({ failed: true, diagnostic: true, calls: [] });
    },
  );
});

describe.each(installCases)(
  "github apt install entrypoint %s",
  (script, packages) => {
    const installCalls = [
      `timeout --kill-after=10s 600s apt-get install -y ${packages}`,
      `apt-get install -y ${packages}`,
    ];

    it("installs the exact existing packages once with the 600-second bound", () => {
      const result = aptFixture().run({ script });

      expect({ status: result.status, calls: result.calls }).toEqual({
        status: 0,
        calls: [...updateCalls, ...installCalls],
      });
    });

    it("recovers from an install timeout with exactly one bounded retry", () => {
      const result = aptFixture().run({ script, installStatuses: [124, 0] });

      expect({ status: result.status, calls: result.calls }).toEqual({
        status: 0,
        calls: [...updateCalls, ...installCalls, "sleep 5", ...installCalls],
      });
    });

    it("propagates a second install failure without a third attempt", () => {
      const result = aptFixture().run({ script, installStatuses: [124, 100] });

      expect({ status: result.status, calls: result.calls }).toEqual({
        status: 100,
        calls: [...updateCalls, ...installCalls, "sleep 5", ...installCalls],
      });
    });

    it("does not install packages after metadata preparation fails twice", () => {
      const result = aptFixture().run({ script, updateStatuses: [124, 124] });

      expect({ status: result.status, calls: result.calls }).toEqual({
        status: 124,
        calls: [...updateCalls, "sleep 5", ...updateCalls],
      });
    });

    it("accepts a configured positive install timeout with the existing kill grace", () => {
      const result = aptFixture().run({
        script,
        env: { APT_GET_INSTALL_TIMEOUT_SECONDS: "601" },
      });

      expect({ status: result.status, calls: result.calls }).toEqual({
        status: 0,
        calls: [
          ...updateCalls,
          `timeout --kill-after=10s 601s apt-get install -y ${packages}`,
          `apt-get install -y ${packages}`,
        ],
      });
    });

    it.each(malformedTimeouts)(
      "rejects malformed install timeout %j before invoking installation",
      (value) => {
        const result = aptFixture().run({
          script,
          env: { APT_GET_INSTALL_TIMEOUT_SECONDS: value },
        });

        expect({
          failed: result.status !== null && result.status !== 0,
          diagnostic: result.stderr.includes(
            "APT_GET_INSTALL_TIMEOUT_SECONDS must be a positive integer",
          ),
          calls: result.calls,
        }).toEqual({ failed: true, diagnostic: true, calls: updateCalls });
      },
    );
  },
);
