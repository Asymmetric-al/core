import { NextResponse } from "next/server";

import {
  assignmentIdOf,
  readWorkerRows,
  rpcClient,
  toWorker,
  withNoStore,
  workerError,
  workersFailure,
  type RpcError,
} from "./contract";
import { withOperation } from "../../shared/with-operation";

const STAFF = { roleClasses: ["staff"] as const };

const codeOf = (error: RpcError | null) =>
  error && typeof error.code === "string" ? error.code : null;

export const GET = withNoStore(
  withOperation(async ({ sessionClient, requestId }) => {
    const read = await readWorkerRows(rpcClient(sessionClient), null);
    if (!read.ok) return workersFailure("list", codeOf(read.error), requestId);
    return NextResponse.json({ workers: read.rows.map(toWorker) });
  }, STAFF),
);

export const GET_UNREVIEWED_COUNT = withNoStore(
  withOperation(async ({ sessionClient, requestId }) => {
    const { error, count } = await rpcClient(sessionClient).rpc(
      "unreviewed_worker_security_levels",
      {},
      { count: "exact", head: true },
    );
    if (error) return workersFailure("count", codeOf(error), requestId);
    if (typeof count !== "number" || !Number.isInteger(count) || count < 0)
      return workersFailure("count", null, requestId);
    return NextResponse.json({ count });
  }, STAFF),
);

export const GET_RECORD = withNoStore(
  withOperation(async ({ sessionClient, requestId }, context) => {
    const assignmentId = await assignmentIdOf(context);
    if (!assignmentId) return workerError("NOT_FOUND");
    const read = await readWorkerRows(rpcClient(sessionClient), assignmentId);
    if (!read.ok)
      return workersFailure("record", codeOf(read.error), requestId);
    const [row] = read.rows;
    if (!row || read.rows.length !== 1) return workerError("NOT_FOUND");
    return NextResponse.json({ worker: toWorker(row) });
  }, STAFF),
);
