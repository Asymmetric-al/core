const ENTRY = /^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*(?::[0-9]{1,5})?$/;

const SPACE = 0x20;
const TAB = 0x09;
const UPPER_A = 0x41;
const UPPER_Z = 0x5a;

export type OperationsNamesProblem = "missing" | "invalid";

export interface OperationsNames {
  names: string[];
  problem: OperationsNamesProblem | null;
}

function isStripped(code: number): boolean {
  return code === SPACE || code === TAB;
}

export function normalizeHostText(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && isStripped(value.charCodeAt(start))) start += 1;
  while (end > start && isStripped(value.charCodeAt(end - 1))) end -= 1;
  let normalized = "";
  for (let index = start; index < end; index += 1) {
    const code = value.charCodeAt(index);
    normalized +=
      code >= UPPER_A && code <= UPPER_Z
        ? String.fromCharCode(code + 0x20)
        : value.charAt(index);
  }
  return normalized;
}

export function parseOperationsNames(
  value: string | undefined,
): OperationsNames {
  if (value === undefined || value === "") {
    return { names: [], problem: "missing" };
  }
  const names: string[] = [];
  let invalid = false;
  for (const raw of value.split(",")) {
    const entry = normalizeHostText(raw);
    if (!ENTRY.test(entry)) {
      invalid = true;
    } else if (!names.includes(entry)) {
      names.push(entry);
    }
  }
  return { names, problem: invalid ? "invalid" : null };
}

export function isValidOperationsNamesEnv(value: string): boolean {
  const { names, problem } = parseOperationsNames(value);
  return problem === null && names.length > 0;
}
