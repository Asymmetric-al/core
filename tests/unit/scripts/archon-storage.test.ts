import { mkdtempSync, readdirSync, rmdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createStorageGuard } from "../../../scripts/archon-factory/pack/.shared/storage.mjs";

const LINUX = {
  O_RDONLY: 0,
  O_RDWR: 2,
  O_CREAT: 64,
  O_EXCL: 128,
  O_NONBLOCK: 2048,
  O_DIRECTORY: 65536,
  O_NOFOLLOW: 131072,
};

type Entry = {
  kind: "directory" | "file" | "symlink";
  ino: bigint;
  dev: bigint;
  nlink: bigint;
  data: Buffer;
  children: Map<string, Entry>;
};

function fixture() {
  let nextInode = 1n;
  let nextDescriptor = 10;
  const events: string[] = [];
  const entry = (kind: Entry["kind"]): Entry => ({
    kind,
    ino: nextInode++,
    dev: 1n,
    nlink: 1n,
    data: Buffer.alloc(0),
    children: new Map(),
  });
  const root = entry("directory");
  const factory = entry("directory");
  const state = entry("directory");
  const artifacts = entry("directory");
  root.children.set("factory", factory);
  factory.children.set("state", state);
  factory.children.set("artifacts", artifacts);
  const descriptors = new Map<number, Entry>();
  const closed: number[] = [];
  const stats = {
    type: 1n,
    bsize: 4096n,
    blocks: 32n,
    bfree: 16n,
    bavail: 8n,
    files: 100n,
    ffree: 20n,
  };
  const info = (node: Entry) => ({
    isDirectory: () => node.kind === "directory",
    isFile: () => node.kind === "file",
    isSymbolicLink: () => node.kind === "symlink",
    dev: node.dev,
    ino: node.ino,
    nlink: node.nlink,
    size: BigInt(node.data.length),
  });
  function locate(filename: string) {
    const anchor = /^\/proc\/self\/fd\/(\d+)(?:\/|$)/.exec(filename);
    let parent = anchor ? descriptors.get(Number(anchor[1])) : root;
    if (!parent) throw new Error("closed descriptor");
    const segments = filename
      .slice(anchor?.[0].length ?? 1)
      .split("/")
      .filter(Boolean);
    const name = segments.pop();
    for (const segment of segments) {
      const child = parent.children.get(segment);
      if (!child || child.kind !== "directory")
        throw new Error("missing directory");
      parent = child;
    }
    return { parent, name, node: name ? parent.children.get(name) : parent };
  }
  const io = {
    lstat: vi.fn(async (filename: string) => {
      const node = locate(filename).node;
      if (!node) throw new Error("missing entry");
      return info(node);
    }),
    statfs: vi.fn(async (_filename: string, _options: unknown) => ({
      ...stats,
    })),
    open: vi.fn(async (filename: string, flags: number, _mode?: number) => {
      const located = locate(filename);
      let node = located.node;
      if (flags & LINUX.O_CREAT) {
        if (node && flags & LINUX.O_EXCL) throw new Error("already exists");
        if (!located.name) throw new Error("no filename");
        node = entry("file");
        located.parent.children.set(located.name, node);
      }
      if (!node || node.kind === "symlink") throw new Error("unsafe entry");
      const opened = node;
      const descriptor = nextDescriptor++;
      descriptors.set(descriptor, opened);
      events.push(`open:${opened.kind}`);
      return {
        fd: descriptor,
        stat: vi.fn(async () => info(opened)),
        sync: vi.fn(async () => {
          events.push(`sync:${opened.kind}`);
        }),
        write: vi.fn(
          async (
            buffer: Buffer,
            offset: number,
            length: number,
            position: number,
          ) => {
            events.push("write");
            const content = Buffer.alloc(
              Math.max(opened.data.length, position + length),
            );
            opened.data.copy(content);
            buffer.copy(content, position, offset, offset + length);
            opened.data = content;
            return { bytesWritten: length, buffer };
          },
        ),
        read: vi.fn(
          async (
            buffer: Buffer,
            offset: number,
            length: number,
            position: number,
          ) => {
            events.push("read");
            const bytesRead = Math.min(
              length,
              Math.max(0, opened.data.length - position),
            );
            opened.data.copy(buffer, offset, position, position + bytesRead);
            return { bytesRead, buffer };
          },
        ),
        close: vi.fn(async () => {
          descriptors.delete(descriptor);
          closed.push(descriptor);
        }),
      };
    }),
    unlink: vi.fn(async (filename: string) => {
      const { parent, name } = locate(filename);
      if (!name) throw new Error("no filename");
      events.push("unlink");
      parent.children.delete(name);
    }),
  };
  const checkStorage = createStorageGuard({
    io,
    filesystemConstants: LINUX,
    platform: "linux",
    randomBytes: () => Buffer.alloc(32, 11),
  });
  const request = {
    operation: "admission",
    targets: [
      {
        path: "/factory/state",
        minAvailableBytes: 8192,
        minAvailableInodes: 10,
      },
    ],
  };
  return {
    checkStorage,
    request,
    io,
    events,
    state,
    factory,
    artifacts,
    entry,
    descriptors,
    closed,
    stats,
  };
}

type Fixture = ReturnType<typeof fixture>;
type Handle = Awaited<ReturnType<Fixture["io"]["open"]>>;

function onOpen(
  current: Fixture,
  configure: (handle: Handle, filename: string, flags: number) => void,
) {
  const original = current.io.open.getMockImplementation()!;
  current.io.open.mockImplementation(async (filename, flags, mode) => {
    const handle = await original(filename, flags, mode);
    configure(handle, filename, flags);
    return handle;
  });
}

describe("factory storage guard", () => {
  it("refuses missing explicit thresholds without inspecting storage", async () => {
    const statfs = vi.fn();
    const checkStorage = createStorageGuard({ io: { statfs } });

    await expect(
      checkStorage({
        operation: "admission",
        targets: [{ path: "/factory/state" }],
      }),
    ).resolves.toEqual({ ok: false, code: "STORAGE_CONFIG_INVALID" });
    expect(statfs).not.toHaveBeenCalled();
  });

  it.each(["admission", "publish", "merge"])(
    "requires durable fresh evidence for %s",
    async (operation) => {
      const current = fixture();
      const result = await current.checkStorage({
        ...current.request,
        operation,
      });

      expect(result).toEqual({
        ok: true,
        code: "STORAGE_READY",
        operation,
        targets: [
          {
            index: 0,
            availableBytes: "32768",
            availableInodes: "20",
            durable: true,
          },
        ],
      });
      expect(current.io.statfs).toHaveBeenCalledTimes(2);
      expect(current.io.statfs).toHaveBeenCalledWith(
        expect.stringMatching(/^\/proc\/self\/fd\/\d+$/),
        { bigint: true },
      );
      expect(current.events.indexOf("sync:file")).toBeGreaterThan(
        current.events.indexOf("write"),
      );
      expect(current.events.indexOf("read")).toBeGreaterThan(
        current.events.indexOf("sync:file"),
      );
      expect(
        current.events.filter((event) => event === "sync:directory"),
      ).toHaveLength(2);
      expect(current.state.children.size).toBe(0);
      expect(current.descriptors.size).toBe(0);
    },
  );

  it("uses unprivileged available bytes, not reserved free blocks", async () => {
    const current = fixture();
    current.request.targets[0].minAvailableBytes = 32769;

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_BYTES_LOW",
      targetIndex: 0,
    });
    expect(current.events).not.toContain("write");
    expect(current.descriptors.size).toBe(0);
  });

  it("refuses insufficient available inodes before creating a probe", async () => {
    const current = fixture();
    current.request.targets[0].minAvailableInodes = 21;

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_INODES_LOW",
      targetIndex: 0,
    });
    expect(current.events).not.toContain("write");
  });

  it.each([
    undefined,
    null,
    true,
    false,
    "",
    " ",
    "01",
    "1\n",
    "1\r",
    "1\u2028",
    "1\u2029",
    "1 ",
    " 1",
    "+1",
    "1e3",
    "1.5",
    0,
    -1,
    0n,
    -1n,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
    {},
    "9".repeat(40),
    "9".repeat(39),
    1n << 128n,
    String(1n << 128n),
  ])("refuses a malformed byte or inode threshold: %s", async (value) => {
    for (const field of ["minAvailableBytes", "minAvailableInodes"]) {
      const current = fixture();
      const target = { ...current.request.targets[0], [field]: value };

      expect(
        await current.checkStorage({ ...current.request, targets: [target] }),
      ).toEqual({ ok: false, code: "STORAGE_CONFIG_INVALID" });
      expect(current.io.open).not.toHaveBeenCalled();
    }
  });

  it.each([1, 1n, "1"])(
    "accepts an exact explicit positive threshold: %s",
    async (value) => {
      const current = fixture();
      expect(
        (
          await current.checkStorage({
            ...current.request,
            targets: [
              {
                path: "/factory/state",
                minAvailableBytes: value,
                minAvailableInodes: value,
              },
            ],
          })
        ).ok,
      ).toBe(true);
    },
  );

  it.each([
    null,
    {},
    { operation: "admit", targets: [] },
    { operation: "admission", targets: [] },
    { operation: "admission", targets: "state" },
  ])("rejects an unknown or incomplete request: %s", async (request) => {
    const current = fixture();
    expect(await current.checkStorage(request)).toEqual({
      ok: false,
      code: "STORAGE_CONFIG_INVALID",
    });
    expect(current.io.open).not.toHaveBeenCalled();
  });

  it.each([
    "relative",
    "/factory/../state",
    "/factory//state",
    "/factory/state/",
    "/factory/./state",
    "/factory/state\u0000",
    "/factory/\nstate",
  ])(
    "rejects noncanonical or unsafe configured paths: %s",
    async (filename) => {
      const current = fixture();
      expect(
        await current.checkStorage({
          ...current.request,
          targets: [{ ...current.request.targets[0], path: filename }],
        }),
      ).toEqual({ ok: false, code: "STORAGE_CONFIG_INVALID" });
    },
  );

  it("cannot opt out of persistence or inject cached evidence", async () => {
    const current = fixture();
    for (const extra of [
      { probe: false },
      { evidence: current.stats },
      { allowUnknownInodes: true },
    ]) {
      expect(
        await current.checkStorage({ ...current.request, ...extra }),
      ).toEqual({ ok: false, code: "STORAGE_CONFIG_INVALID" });
    }
  });

  it.each(["type", "bsize", "blocks", "bfree", "bavail", "files", "ffree"])(
    "refuses absent statfs %s evidence",
    async (field) => {
      const current = fixture();
      const evidence = { ...current.stats };
      Reflect.deleteProperty(evidence, field);
      current.io.statfs.mockResolvedValue(evidence);

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_CAPACITY_INVALID",
        targetIndex: 0,
      });
      expect(current.events).not.toContain("write");
      expect(current.descriptors.size).toBe(0);
    },
  );

  it.each([
    { bavail: -1n },
    { bavail: 8 },
    { bavail: "8" },
    { bavail: Number.NaN },
    { bsize: 0n },
    { blocks: 0n },
    { type: 0n },
    { files: 0n, ffree: 0n },
    { bavail: 17n },
    { bfree: 33n },
    { ffree: 101n },
    { ffree: -1n },
    { files: (1n << 64n) - 1n, ffree: (1n << 64n) - 1n },
    { files: 1n << 64n, ffree: 20n },
  ])("refuses invalid or unknown statfs counters: %s", async (patch) => {
    const current = fixture();
    current.io.statfs.mockResolvedValue(
      Object.assign({}, current.stats, patch),
    );

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_CAPACITY_INVALID",
      targetIndex: 0,
    });
    expect(current.events).not.toContain("write");
  });

  it("sanitizes statfs exceptions without leaking paths or messages", async () => {
    const current = fixture();
    current.io.statfs.mockRejectedValue(new Error("secret\n".repeat(10000)));

    const result = await current.checkStorage(current.request);
    expect(result).toEqual({
      ok: false,
      code: "STORAGE_STATFS_UNAVAILABLE",
      targetIndex: 0,
    });
    expect(JSON.stringify(result).length).toBeLessThan(120);
  });

  it("resamples on every call rather than caching earlier readiness", async () => {
    const current = fixture();
    expect((await current.checkStorage(current.request)).ok).toBe(true);
    current.io.statfs.mockResolvedValue({ ...current.stats, bavail: 0n });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_BYTES_LOW",
      targetIndex: 0,
    });
    expect(current.io.statfs).toHaveBeenCalledTimes(3);
  });

  it("refuses pressure that appears after a successful durable probe", async () => {
    const current = fixture();
    current.io.statfs
      .mockResolvedValueOnce(current.stats)
      .mockResolvedValue({ ...current.stats, ffree: 0n });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_INODES_LOW",
      targetIndex: 0,
    });
    expect(current.events).toContain("sync:file");
    expect(current.state.children.size).toBe(0);
  });

  it("refuses a directory swapped while the final statfs completes", async () => {
    const current = fixture();
    current.io.statfs
      .mockResolvedValueOnce(current.stats)
      .mockImplementationOnce(async () => {
        current.factory.children.set("state", current.entry("directory"));
        return current.stats;
      });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_DIRECTORY_CHANGED",
      targetIndex: 0,
    });
  });

  it.each(["state", "factory"])(
    "refuses symlinks in the %s directory before statfs or writes",
    async (segment) => {
      const current = fixture();
      if (segment === "state") current.state.kind = "symlink";
      else current.factory.kind = "symlink";

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_DIRECTORY_UNTRUSTED",
        targetIndex: 0,
      });
      expect(current.io.statfs).not.toHaveBeenCalled();
      expect(current.descriptors.size).toBe(0);
    },
  );

  it("opens every directory component and probe with native no-follow flags", async () => {
    const current = fixture();
    expect((await current.checkStorage(current.request)).ok).toBe(true);

    const calls = current.io.open.mock.calls;
    expect(calls[0][0]).toBe("/");
    for (const [filename, flags] of calls) {
      expect(flags & LINUX.O_NOFOLLOW).toBe(LINUX.O_NOFOLLOW);
      expect(flags & LINUX.O_NONBLOCK).toBe(LINUX.O_NONBLOCK);
      expect(filename === "/" || filename.startsWith("/proc/self/fd/")).toBe(
        true,
      );
    }
    const creation = calls.find(([, flags]) => flags & LINUX.O_CREAT);
    expect(creation?.[1] && creation[1] & LINUX.O_EXCL).toBe(LINUX.O_EXCL);
    expect(creation?.[2]).toBe(0o600);
  });

  it("refuses an unsupported platform instead of using a following fallback", async () => {
    const current = fixture();
    const checkStorage = createStorageGuard({
      io: current.io,
      platform: "win32",
      filesystemConstants: LINUX,
    });
    expect(
      await checkStorage({
        ...current.request,
        targets: [
          { ...current.request.targets[0], path: "C:\\factory\\state" },
        ],
      }),
    ).toEqual({ ok: false, code: "STORAGE_NOFOLLOW_UNAVAILABLE" });
    expect(current.io.open).not.toHaveBeenCalled();
  });

  it("uses real Node 24 IO on the host without an unsafe Windows fallback", async () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), "archon-storage-"));
    try {
      const result = await createStorageGuard()({
        operation: "publish",
        targets: [
          { path: directory, minAvailableBytes: 1, minAvailableInodes: 1 },
        ],
      });
      if (process.platform === "linux") expect(result.ok).toBe(true);
      else
        expect(result).toEqual({
          ok: false,
          code: "STORAGE_NOFOLLOW_UNAVAILABLE",
        });
      expect(readdirSync(directory)).toEqual([]);
    } finally {
      rmdirSync(directory);
    }
  });

  it("does not let asynchronous request mutation change the validated operation", async () => {
    const current = fixture();
    current.io.statfs.mockImplementation(async () => {
      current.request.operation = "secret\n".repeat(10000);
      return current.stats;
    });

    expect(await current.checkStorage(current.request)).toMatchObject({
      ok: true,
      operation: "admission",
    });
  });

  it("checks each actual filesystem and revalidates earlier bindings after later samples", async () => {
    const current = fixture();
    current.request.targets.push({
      ...current.request.targets[0],
      path: "/factory/artifacts",
    });
    current.io.statfs
      .mockResolvedValueOnce(current.stats)
      .mockResolvedValueOnce(current.stats)
      .mockResolvedValueOnce(current.stats)
      .mockImplementationOnce(async () => {
        current.factory.children.set("state", current.entry("directory"));
        return current.stats;
      });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_DIRECTORY_CHANGED",
      targetIndex: 0,
    });
    expect(current.io.statfs).toHaveBeenCalledTimes(4);
    expect(current.events.filter((event) => event === "write")).toHaveLength(2);
  });

  it("refuses a distinct artifact filesystem that lacks the configured reserve", async () => {
    const current = fixture();
    current.request.targets.push({
      ...current.request.targets[0],
      path: "/factory/artifacts",
    });
    current.io.statfs
      .mockResolvedValueOnce(current.stats)
      .mockResolvedValueOnce({ ...current.stats, bavail: 0n });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_BYTES_LOW",
      targetIndex: 1,
    });
    expect(current.artifacts.children.size).toBe(0);
    expect(current.state.children.size).toBe(0);
    expect(current.descriptors.size).toBe(0);
  });

  it("checks the root, each intermediate directory and an actual descriptor", async () => {
    const current = fixture();
    const original = current.io.lstat.getMockImplementation()!;
    current.io.lstat.mockImplementation(async (filename) => {
      const before = await original(filename);
      if (filename.endsWith("/state"))
        current.factory.children.set("state", current.entry("directory"));
      return before;
    });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_DIRECTORY_CHANGED",
      targetIndex: 0,
    });
    expect(current.io.statfs).not.toHaveBeenCalled();
    expect(current.descriptors.size).toBe(0);
  });

  it.each(["absent", "file"])(
    "refuses a configured directory that is %s",
    async (kind) => {
      const current = fixture();
      if (kind === "absent") current.factory.children.delete("state");
      else current.state.kind = "file";

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code:
          kind === "absent"
            ? "STORAGE_DIRECTORY_UNAVAILABLE"
            : "STORAGE_DIRECTORY_UNTRUSTED",
        targetIndex: 0,
      });
      expect(current.events).not.toContain("write");
    },
  );

  it.each(["write", "file-sync", "directory-sync", "read", "reopen"])(
    "fails closed on a %s failure and cleans only its own probe",
    async (stage) => {
      const current = fixture();
      onOpen(current, (handle, filename, flags) => {
        const createdFile = Boolean(flags & LINUX.O_CREAT);
        if (stage === "write" && createdFile)
          handle.write.mockRejectedValueOnce(new Error("ENOSPC secret"));
        if (stage === "file-sync" && createdFile)
          handle.sync.mockRejectedValueOnce(new Error("EIO secret"));
        if (stage === "directory-sync" && filename.endsWith("/state"))
          handle.sync.mockRejectedValueOnce(new Error("EROFS secret"));
        if (
          stage === "read" &&
          filename.includes(".archon-storage-") &&
          !createdFile
        )
          handle.read.mockRejectedValueOnce(new Error("EIO secret"));
      });
      if (stage === "reopen") {
        const original = current.io.open.getMockImplementation()!;
        current.io.open.mockImplementation(async (filename, flags, mode) => {
          if (filename.includes(".archon-storage-") && !(flags & LINUX.O_CREAT))
            throw new Error("reopen unavailable");
          return original(filename, flags, mode);
        });
      }

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_FAILED",
        targetIndex: 0,
      });
      expect(current.state.children.size).toBe(0);
      expect(current.descriptors.size).toBe(0);
    },
  );

  it("supports short writes and reads without accepting incomplete persistence", async () => {
    const current = fixture();
    onOpen(current, (handle) => {
      const originalWrite = handle.write.getMockImplementation()!;
      const originalRead = handle.read.getMockImplementation()!;
      handle.write.mockImplementation((buffer, offset, length, position) =>
        originalWrite(buffer, offset, Math.min(7, length), position),
      );
      handle.read.mockImplementation((buffer, offset, length, position) =>
        originalRead(buffer, offset, Math.min(7, length), position),
      );
    });

    expect((await current.checkStorage(current.request)).ok).toBe(true);
    expect(
      current.events.filter((event) => event === "write").length,
    ).toBeGreaterThan(1);
    expect(
      current.events.filter((event) => event === "read").length,
    ).toBeGreaterThan(1);
  });

  it.each([0, -1, 10000, Number.NaN, 1.5])(
    "refuses an invalid write acknowledgement without an unbounded loop: %s",
    async (bytesWritten) => {
      const current = fixture();
      onOpen(current, (handle, _filename, flags) => {
        if (flags & LINUX.O_CREAT)
          handle.write.mockImplementationOnce(async (buffer) => ({
            bytesWritten,
            buffer,
          }));
      });

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_FAILED",
        targetIndex: 0,
      });
      expect(current.state.children.size).toBe(0);
    },
  );

  it.each([-1, 10000, Number.NaN, 1.5])(
    "refuses an invalid bounded read acknowledgement: %s",
    async (bytesRead) => {
      const current = fixture();
      onOpen(current, (handle, filename, flags) => {
        if (filename.includes(".archon-storage-") && !(flags & LINUX.O_CREAT))
          handle.read.mockImplementationOnce(async (buffer) => ({
            bytesRead,
            buffer,
          }));
      });

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_FAILED",
        targetIndex: 0,
      });
    },
  );

  it.each(["corrupted", "short"])(
    "rejects %s readback despite a successful write and fsync",
    async (kind) => {
      const current = fixture();
      onOpen(current, (handle, filename, flags) => {
        if (!filename.includes(".archon-storage-") || flags & LINUX.O_CREAT)
          return;
        const original = handle.read.getMockImplementation()!;
        handle.read.mockImplementation(
          async (buffer, offset, length, position) => {
            if (kind === "short") return { bytesRead: 0, buffer };
            const result = await original(buffer, offset, length, position);
            if (result.bytesRead > 0) buffer[0] ^= 1;
            return result;
          },
        );
      });

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_MISMATCH",
        targetIndex: 0,
      });
      expect(current.state.children.size).toBe(0);
      expect(current.descriptors.size).toBe(0);
    },
  );

  it.each(["file", "symlink"])(
    "never overwrites or removes a colliding %s probe entry",
    async (kind) => {
      const current = fixture();
      const collision = current.entry(kind === "file" ? "file" : "symlink");
      collision.data = Buffer.from("retained work");
      const basename = `.archon-storage-${"0b".repeat(16)}`;
      current.state.children.set(basename, collision);

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_FAILED",
        targetIndex: 0,
      });
      expect(current.io.unlink).not.toHaveBeenCalled();
      expect(current.state.children.get(basename)).toBe(collision);
      expect(collision.data.toString()).toBe("retained work");
    },
  );

  it.each(["symlink", "file", "hardlink"])(
    "refuses a replaced %s probe without deleting the replacement",
    async (kind) => {
      const current = fixture();
      const original = current.io.lstat.getMockImplementation()!;
      let replacement: Entry | undefined;
      current.io.lstat.mockImplementation(async (filename) => {
        if (filename.includes(".archon-storage-") && !replacement) {
          replacement = current.entry(kind === "symlink" ? "symlink" : "file");
          if (kind === "hardlink") replacement.nlink = 2n;
          current.state.children.set(filename.split("/").at(-1)!, replacement);
        }
        return original(filename);
      });

      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_CLEANUP_FAILED",
        targetIndex: 0,
      });
      expect(current.io.unlink).not.toHaveBeenCalled();
      expect([...current.state.children.values()]).toEqual([replacement]);
    },
  );

  it("refuses unconfirmed probe cleanup without deleting other work", async () => {
    const current = fixture();
    const retained = current.entry("file");
    retained.data = Buffer.from("keep");
    current.state.children.set("unfinished-work", retained);
    current.io.unlink.mockRejectedValueOnce(new Error("EIO\nsecret"));

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_PROBE_CLEANUP_FAILED",
      targetIndex: 0,
    });
    expect(current.state.children.get("unfinished-work")).toBe(retained);
    expect(current.io.unlink).toHaveBeenCalledTimes(1);
    expect(current.descriptors.size).toBe(0);
  });

  it("requires directory fsync after probe removal, not merely a successful unlink", async () => {
    const current = fixture();
    onOpen(current, (handle, filename) => {
      if (filename.endsWith("/state"))
        handle.sync
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error("directory sync unsupported"));
    });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_PROBE_CLEANUP_FAILED",
      targetIndex: 0,
    });
    expect(current.state.children.size).toBe(0);
  });

  it("does not return ready when descriptor closure is unconfirmed", async () => {
    const current = fixture();
    onOpen(current, (handle, filename) => {
      if (filename.endsWith("/state"))
        handle.close.mockRejectedValueOnce(new Error("close unknown"));
    });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_CLOSE_FAILED",
      targetIndex: 0,
    });
  });

  it("attributes final descriptor closure failure to its actual target", async () => {
    const current = fixture();
    current.request.targets.push({
      ...current.request.targets[0],
      path: "/factory/artifacts",
    });
    onOpen(current, (handle, filename) => {
      if (filename.endsWith("/state"))
        handle.close.mockRejectedValueOnce(new Error("state close unknown"));
    });

    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_CLOSE_FAILED",
      targetIndex: 0,
    });
  });

  it("keeps byte and inode arithmetic exact beyond safe Number integers", async () => {
    const current = fixture();
    const available = (1n << 53n) + 1n;
    current.io.statfs.mockResolvedValue({
      type: 1n,
      bsize: 1n,
      blocks: available,
      bfree: available,
      bavail: available,
      files: available,
      ffree: available,
    });
    const target = {
      path: "/factory/state",
      minAvailableBytes: String(available),
      minAvailableInodes: available,
    };

    expect(
      await current.checkStorage({ ...current.request, targets: [target] }),
    ).toMatchObject({
      ok: true,
      targets: [
        {
          availableBytes: String(available),
          availableInodes: String(available),
        },
      ],
    });
    expect(
      await current.checkStorage({
        ...current.request,
        targets: [{ ...target, minAvailableBytes: String(available + 1n) }],
      }),
    ).toEqual({ ok: false, code: "STORAGE_BYTES_LOW", targetIndex: 0 });
    expect(
      await current.checkStorage({
        ...current.request,
        targets: [{ ...target, minAvailableInodes: available + 1n }],
      }),
    ).toEqual({ ok: false, code: "STORAGE_INODES_LOW", targetIndex: 0 });
    expect(current.descriptors.size).toBe(0);
  });

  it.each([17, 100])(
    "bounds the configured target count at sixteen, not %s",
    async (count) => {
      const current = fixture();
      expect(
        await current.checkStorage({
          ...current.request,
          targets: Array.from({ length: count }, () => ({
            ...current.request.targets[0],
          })),
        }),
      ).toEqual({ ok: false, code: "STORAGE_CONFIG_INVALID" });
      expect(current.io.open).not.toHaveBeenCalled();
    },
  );

  it("rejects unknown target policy fields instead of allowing a bypass", async () => {
    const current = fixture();
    expect(
      await current.checkStorage({
        ...current.request,
        targets: [{ ...current.request.targets[0], allowUnknownInodes: true }],
      }),
    ).toEqual({ ok: false, code: "STORAGE_CONFIG_INVALID" });
    expect(current.io.open).not.toHaveBeenCalled();
  });

  it.each([
    "O_NOFOLLOW",
    "O_DIRECTORY",
    "O_NONBLOCK",
    "O_RDWR",
    "O_CREAT",
    "O_EXCL",
  ])(
    "requires the native %s capability before touching storage",
    async (flag) => {
      const current = fixture();
      const checkStorage = createStorageGuard({
        io: current.io,
        platform: "linux",
        filesystemConstants: { ...LINUX, [flag]: undefined },
      });
      expect(await checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_NOFOLLOW_UNAVAILABLE",
      });
      expect(current.io.open).not.toHaveBeenCalled();
    },
  );

  it.each(["lstat", "open", "statfs", "unlink"])(
    "refuses missing injected %s evidence capability",
    async (method) => {
      const current = fixture();
      const checkStorage = createStorageGuard({
        io: { ...current.io, [method]: null },
        platform: "linux",
        filesystemConstants: LINUX,
      });
      expect(await checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_IO_UNAVAILABLE",
      });
      expect(current.io.open).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, -1, 1.5, "10"])(
    "refuses an unknown or invalid native directory descriptor: %s",
    async (descriptor) => {
      const current = fixture();
      onOpen(current, (handle) => {
        Reflect.set(handle, "fd", descriptor);
      });
      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_DIRECTORY_UNAVAILABLE",
        targetIndex: 0,
      });
      expect(current.events).not.toContain("write");
      expect(current.descriptors.size).toBe(0);
    },
  );

  it.each([null, "nonce", Buffer.alloc(31), Buffer.alloc(33)])(
    "refuses malformed random probe identity: %s",
    async (nonce) => {
      const current = fixture();
      const checkStorage = createStorageGuard({
        io: current.io,
        platform: "linux",
        filesystemConstants: LINUX,
        randomBytes: () => nonce,
      });
      expect(await checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_FAILED",
        targetIndex: 0,
      });
      expect(current.state.children.size).toBe(0);
      expect(current.descriptors.size).toBe(0);
    },
  );

  it("refuses when the post-probe statfs evidence becomes unavailable", async () => {
    const current = fixture();
    current.io.statfs
      .mockResolvedValueOnce(current.stats)
      .mockRejectedValueOnce(new Error("unavailable /secret/path"));
    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_STATFS_UNAVAILABLE",
      targetIndex: 0,
    });
    expect(current.state.children.size).toBe(0);
    expect(current.descriptors.size).toBe(0);
  });

  it("retains an unidentifiable created probe rather than guessing cleanup ownership", async () => {
    const current = fixture();
    onOpen(current, (handle, _filename, flags) => {
      if (!(flags & LINUX.O_CREAT)) return;
      const original = handle.stat.getMockImplementation()!;
      handle.stat.mockImplementationOnce(async () => ({
        ...(await original()),
        nlink: 2n,
      }));
    });
    expect(await current.checkStorage(current.request)).toEqual({
      ok: false,
      code: "STORAGE_PROBE_CLEANUP_FAILED",
      targetIndex: 0,
    });
    expect(current.io.unlink).not.toHaveBeenCalled();
    expect(current.state.children.size).toBe(1);
    expect(current.descriptors.size).toBe(0);
  });

  it.each(["reopen", "readback"])(
    "checks the probe descriptor identity at %s",
    async (stage) => {
      const current = fixture();
      onOpen(current, (handle, filename, flags) => {
        if (!filename.includes(".archon-storage-") || flags & LINUX.O_CREAT)
          return;
        const original = handle.stat.getMockImplementation()!;
        if (stage === "readback") handle.stat.mockImplementationOnce(original);
        handle.stat.mockImplementationOnce(async () => ({
          ...(await original()),
          ino: 999n,
        }));
      });
      expect(await current.checkStorage(current.request)).toEqual({
        ok: false,
        code: "STORAGE_PROBE_CHANGED",
        targetIndex: 0,
      });
      expect(current.state.children.size).toBe(0);
      expect(current.descriptors.size).toBe(0);
    },
  );
});
