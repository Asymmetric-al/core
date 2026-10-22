import { lstat } from "node:fs/promises";
import path from "node:path";

// Reviewed upstream launcher contracts. Do not infer execution permission from
// shebangs or grant it to every script. Ordinary source modes remain untouched.
const reviewedExecutables = new Map([["impeccable", ["scripts/impeccable"]]]);

export async function assertReviewedSkillFileModes(skillName, skillRoot) {
  for (const relative of reviewedExecutables.get(skillName) ?? []) {
    const parts = relative.split("/");
    let current = skillRoot;
    for (let index = -1; index < parts.length; index += 1) {
      if (index >= 0) current = path.join(current, parts[index]);
      const entry = await lstat(current);
      const final = index === parts.length - 1;
      if (
        entry.isSymbolicLink() ||
        (final ? !entry.isFile() : !entry.isDirectory())
      )
        throw new Error(
          "Reviewed support file must be a regular file: " +
            skillName +
            "/" +
            relative,
        );
      // Windows filesystems do not expose a meaningful POSIX executable bit.
      if (final && process.platform !== "win32" && (entry.mode & 0o100) === 0)
        throw new Error(
          "Reviewed support file must remain executable: " +
            skillName +
            "/" +
            relative,
        );
    }
  }
}
