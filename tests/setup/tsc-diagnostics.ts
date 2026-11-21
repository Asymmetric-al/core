import path from "node:path";

export function diagnosticLocations(
  output: string,
  cwd: string,
  relativeTo: string,
) {
  return output
    .split(/\r?\n/)
    .filter((line) => /(?:^|: )error TS\d+:/.test(line))
    .map((line) => {
      const match = /^(.+)\((\d+),\d+\): error (TS\d+):/.exec(line);
      if (!match) return line;
      const file = path
        .relative(relativeTo, path.resolve(cwd, match[1]))
        .split(path.sep)
        .join("/");
      return `${file}:${match[2]} ${match[3]}`;
    })
    .sort();
}
