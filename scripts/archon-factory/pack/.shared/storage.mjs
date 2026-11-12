import { randomBytes as nodeRandomBytes } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, statfs, unlink } from "node:fs/promises";
import path from "node:path";

const operations = new Set(["admission", "publish", "merge"]);
const maxCounter = (1n << 64n) - 1n;
const maxThreshold = (1n << 128n) - 1n;
const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const exactKeys = (value, keys) =>
  record(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

class StorageRefusal extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function refuse(code) {
  throw new StorageRefusal(code);
}

async function observe(code, action) {
  try {
    return await action();
  } catch {
    refuse(code);
  }
}

function threshold(value) {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0)
    return BigInt(value);
  if (typeof value === "string" && /^[1-9]\d{0,38}$/.test(value))
    value = BigInt(value);
  return typeof value === "bigint" && value > 0n && value <= maxThreshold
    ? value
    : null;
}

function configuration(request, platform) {
  if (!exactKeys(request, ["operation", "targets"]))
    refuse("STORAGE_CONFIG_INVALID");
  const { operation, targets } = request;
  if (
    !operations.has(operation) ||
    !Array.isArray(targets) ||
    targets.length < 1 ||
    targets.length > 16
  )
    refuse("STORAGE_CONFIG_INVALID");
  const paths = platform === "win32" ? path.win32 : path.posix;
  return {
    operation,
    targets: targets.map((target) => {
      if (
        !exactKeys(target, [
          "path",
          "minAvailableBytes",
          "minAvailableInodes",
        ]) ||
        typeof target.path !== "string" ||
        target.path.length > 4096 ||
        /[\x00-\x1f\x7f]/.test(target.path) ||
        !paths.isAbsolute(target.path) ||
        paths.normalize(target.path) !== target.path ||
        (target.path !== paths.parse(target.path).root &&
          target.path.endsWith(paths.sep))
      )
        refuse("STORAGE_CONFIG_INVALID");
      const minAvailableBytes = threshold(target.minAvailableBytes);
      const minAvailableInodes = threshold(target.minAvailableInodes);
      if (minAvailableBytes === null || minAvailableInodes === null)
        refuse("STORAGE_CONFIG_INVALID");
      return { path: target.path, minAvailableBytes, minAvailableInodes };
    }),
  };
}

function identity(info, kind) {
  return (
    info &&
    typeof info[kind] === "function" &&
    info[kind]() === true &&
    typeof info.isSymbolicLink === "function" &&
    info.isSymbolicLink() === false &&
    typeof info.dev === "bigint" &&
    info.dev >= 0n &&
    typeof info.ino === "bigint" &&
    info.ino > 0n
  );
}

const sameEntry = (left, right) =>
  left.dev === right.dev && left.ino === right.ino;

async function directoryChain(target, context) {
  let anchor;
  let absolute = "/";
  const chain = [];
  for (const segment of ["", ...target.path.split("/").filter(Boolean)]) {
    if (segment) absolute = path.posix.join(absolute, segment);
    const filename = anchor ? `${anchor}/${segment}` : "/";
    const before = await observe("STORAGE_DIRECTORY_UNAVAILABLE", () =>
      context.io.lstat(filename, { bigint: true }),
    );
    if (!identity(before, "isDirectory")) refuse("STORAGE_DIRECTORY_UNTRUSTED");
    const handle = await context.open(
      filename,
      context.flags.O_RDONLY |
        context.flags.O_DIRECTORY |
        context.flags.O_NOFOLLOW |
        context.flags.O_NONBLOCK,
      undefined,
      "STORAGE_DIRECTORY_UNAVAILABLE",
    );
    const opened = await observe("STORAGE_DIRECTORY_UNAVAILABLE", () =>
      handle.stat({ bigint: true }),
    );
    if (!identity(opened, "isDirectory") || !sameEntry(before, opened))
      refuse("STORAGE_DIRECTORY_CHANGED");
    if (!Number.isSafeInteger(handle.fd) || handle.fd < 0)
      refuse("STORAGE_DIRECTORY_UNAVAILABLE");
    anchor = `/proc/self/fd/${handle.fd}`;
    chain.push({ absolute, info: opened, handle });
  }
  return { anchor, chain, handle: chain.at(-1).handle };
}

async function unchanged(directory, io) {
  for (const binding of directory.chain) {
    const current = await observe("STORAGE_DIRECTORY_UNAVAILABLE", () =>
      io.lstat(binding.absolute, { bigint: true }),
    );
    const opened = await observe("STORAGE_DIRECTORY_UNAVAILABLE", () =>
      binding.handle.stat({ bigint: true }),
    );
    if (
      !identity(current, "isDirectory") ||
      !identity(opened, "isDirectory") ||
      !sameEntry(current, binding.info) ||
      !sameEntry(opened, binding.info)
    )
      refuse("STORAGE_DIRECTORY_CHANGED");
  }
}

async function capacity(directory, target, io) {
  const info = await observe("STORAGE_STATFS_UNAVAILABLE", () =>
    io.statfs(directory.anchor, { bigint: true }),
  );
  const fields = [
    "type",
    "bsize",
    "blocks",
    "bfree",
    "bavail",
    "files",
    "ffree",
  ];
  if (
    !record(info) ||
    !fields.every(
      (field) =>
        typeof info[field] === "bigint" &&
        info[field] >= 0n &&
        info[field] < maxCounter,
    ) ||
    info.type === 0n ||
    info.bsize === 0n ||
    info.blocks === 0n ||
    info.files === 0n ||
    info.bavail > info.bfree ||
    info.bfree > info.blocks ||
    info.ffree > info.files
  )
    refuse("STORAGE_CAPACITY_INVALID");
  const availableBytes = info.bsize * info.bavail;
  if (availableBytes < target.minAvailableBytes) refuse("STORAGE_BYTES_LOW");
  if (info.ffree < target.minAvailableInodes) refuse("STORAGE_INODES_LOW");
  return {
    availableBytes: String(availableBytes),
    availableInodes: String(info.ffree),
  };
}

function ownedFile(info, expected, size) {
  return (
    identity(info, "isFile") &&
    sameEntry(info, expected) &&
    info.nlink === 1n &&
    (size === undefined || info.size === BigInt(size))
  );
}

async function probe(directory, context) {
  const nonce = await observe("STORAGE_PROBE_FAILED", () =>
    context.randomBytes(32),
  );
  if (!Buffer.isBuffer(nonce) || nonce.length !== 32)
    refuse("STORAGE_PROBE_FAILED");
  const filename = `${directory.anchor}/.archon-storage-${nonce.subarray(0, 16).toString("hex")}`;
  const payload = Buffer.from(`archon-storage-v1:${nonce.toString("hex")}\n`);
  let created = false;
  let owner;
  try {
    const writer = await context.open(
      filename,
      context.flags.O_RDWR |
        context.flags.O_CREAT |
        context.flags.O_EXCL |
        context.flags.O_NOFOLLOW |
        context.flags.O_NONBLOCK,
      0o600,
      "STORAGE_PROBE_FAILED",
    );
    created = true;
    const initial = await observe("STORAGE_PROBE_FAILED", () =>
      writer.stat({ bigint: true }),
    );
    if (
      !identity(initial, "isFile") ||
      initial.nlink !== 1n ||
      initial.size !== 0n ||
      initial.dev !== directory.chain.at(-1).info.dev
    )
      refuse("STORAGE_PROBE_FAILED");
    owner = initial;
    let written = 0;
    while (written < payload.length) {
      const result = await observe("STORAGE_PROBE_FAILED", () =>
        writer.write(payload, written, payload.length - written, written),
      );
      if (
        !Number.isSafeInteger(result?.bytesWritten) ||
        result.bytesWritten < 1 ||
        result.bytesWritten > payload.length - written
      )
        refuse("STORAGE_PROBE_FAILED");
      written += result.bytesWritten;
    }
    await observe("STORAGE_PROBE_FAILED", () => writer.sync());
    await observe("STORAGE_PROBE_FAILED", () => directory.handle.sync());
    await context.close(writer);
    const linked = await observe("STORAGE_PROBE_FAILED", () =>
      context.io.lstat(filename, { bigint: true }),
    );
    if (!ownedFile(linked, owner, payload.length))
      refuse("STORAGE_PROBE_CHANGED");
    const reader = await context.open(
      filename,
      context.flags.O_RDONLY |
        context.flags.O_NOFOLLOW |
        context.flags.O_NONBLOCK,
      undefined,
      "STORAGE_PROBE_FAILED",
    );
    const opened = await observe("STORAGE_PROBE_FAILED", () =>
      reader.stat({ bigint: true }),
    );
    if (!ownedFile(opened, owner, payload.length))
      refuse("STORAGE_PROBE_CHANGED");
    const buffer = Buffer.alloc(payload.length + 1);
    let read = 0;
    while (read < buffer.length) {
      const result = await observe("STORAGE_PROBE_FAILED", () =>
        reader.read(buffer, read, buffer.length - read, read),
      );
      if (
        !Number.isSafeInteger(result?.bytesRead) ||
        result.bytesRead < 0 ||
        result.bytesRead > buffer.length - read
      )
        refuse("STORAGE_PROBE_FAILED");
      if (result.bytesRead === 0) break;
      read += result.bytesRead;
    }
    if (read !== payload.length || !buffer.subarray(0, read).equals(payload))
      refuse("STORAGE_PROBE_MISMATCH");
    const after = await observe("STORAGE_PROBE_FAILED", () =>
      reader.stat({ bigint: true }),
    );
    if (!ownedFile(after, owner, payload.length))
      refuse("STORAGE_PROBE_CHANGED");
    await context.close(reader);
  } finally {
    if (created) {
      const current = await observe("STORAGE_PROBE_CLEANUP_FAILED", () =>
        context.io.lstat(filename, { bigint: true }),
      );
      if (!owner || !ownedFile(current, owner))
        refuse("STORAGE_PROBE_CLEANUP_FAILED");
      await observe("STORAGE_PROBE_CLEANUP_FAILED", () =>
        context.io.unlink(filename),
      );
      await observe("STORAGE_PROBE_CLEANUP_FAILED", () =>
        directory.handle.sync(),
      );
    }
  }
}

export function createStorageGuard({
  io = { lstat, open, statfs, unlink },
  filesystemConstants = constants,
  platform = process.platform,
  randomBytes = nodeRandomBytes,
} = {}) {
  return async function checkStorage(request) {
    const handles = new Map();
    let result;
    let targetIndex;
    const context = {
      io,
      flags: filesystemConstants,
      randomBytes,
      async open(filename, flags, mode, code) {
        const handle = await observe(code, () =>
          io.open(filename, flags, mode),
        );
        handles.set(handle, targetIndex);
        return handle;
      },
      async close(handle) {
        handles.delete(handle);
        await observe("STORAGE_CLOSE_FAILED", () => handle.close());
      },
    };
    try {
      const { operation, targets } = configuration(request, platform);
      if (
        platform !== "linux" ||
        !filesystemConstants ||
        ![
          "O_DIRECTORY",
          "O_NOFOLLOW",
          "O_NONBLOCK",
          "O_RDWR",
          "O_CREAT",
          "O_EXCL",
        ].every(
          (flag) =>
            Number.isSafeInteger(filesystemConstants[flag]) &&
            filesystemConstants[flag] > 0,
        ) ||
        filesystemConstants.O_RDONLY !== 0
      )
        refuse("STORAGE_NOFOLLOW_UNAVAILABLE");
      if (
        !io ||
        !["lstat", "open", "statfs", "unlink"].every(
          (method) => typeof io[method] === "function",
        ) ||
        typeof randomBytes !== "function"
      )
        refuse("STORAGE_IO_UNAVAILABLE");
      const directories = [];
      for (const [index, target] of targets.entries()) {
        targetIndex = index;
        const directory = await directoryChain(target, context);
        await capacity(directory, target, io);
        await unchanged(directory, io);
        await probe(directory, context);
        directories.push(directory);
      }
      const evidence = [];
      for (const [index, target] of targets.entries()) {
        targetIndex = index;
        await unchanged(directories[index], io);
        const current = await capacity(directories[index], target, io);
        await unchanged(directories[index], io);
        evidence.push({ index, ...current, durable: true });
      }
      for (const [index, directory] of directories.entries()) {
        targetIndex = index;
        await unchanged(directory, io);
      }
      result = {
        ok: true,
        code: "STORAGE_READY",
        operation,
        targets: evidence,
      };
    } catch (error) {
      result = {
        ok: false,
        code:
          error instanceof StorageRefusal
            ? error.code
            : "STORAGE_IO_UNAVAILABLE",
        ...(targetIndex === undefined ? {} : { targetIndex }),
      };
    } finally {
      for (const [handle, index] of [...handles].reverse()) {
        try {
          await context.close(handle);
        } catch {
          result = {
            ok: false,
            code: "STORAGE_CLOSE_FAILED",
            ...(index === undefined ? {} : { targetIndex: index }),
          };
        }
      }
    }
    return result;
  };
}

export const checkStorage = createStorageGuard();
