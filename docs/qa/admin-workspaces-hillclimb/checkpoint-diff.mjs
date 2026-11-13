/** Build the tracked portion of a checkpoint without changing Git state. */
export function buildTrackedDiff(git, base, paths) {
  const prefix = ["diff", "--binary", base, "--"];
  // Allow for quoted/escaped arguments well below Windows' process limit.
  const budget = 12000;
  const cost = (value) => value.length * 2 + 4;
  const fixedCost = prefix.reduce((sum, arg) => sum + cost(arg), 0);
  let batch = [];
  let length = fixedCost;
  let diff = "";
  for (const path of paths) {
    if (batch.length && length + cost(path) > budget) {
      diff += git([...prefix, ...batch]);
      batch = [];
      length = fixedCost;
    }
    batch.push(path);
    length += cost(path);
  }
  if (batch.length) diff += git([...prefix, ...batch]);
  return diff;
}
