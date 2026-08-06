import fs from "fs";

// Packages held at a single version by an override in pnpm-workspace.yaml.
// Keep in sync with that block:
// fails if a duplicate returns, or if the package is gone and the entry is stale.
const SINGLE_VERSION: Array<string> = ["lightningcss"];

const lockfile = fs.readFileSync("pnpm-lock.yaml", "utf8").split("\n");

/**
 * Collects every version a package is locked at, read from the lockfile's
 * top-level entry keys (`  name@version:`, optionally quoted).
 *
 * @param name package name to look for
 * @returns the distinct locked versions
 */
function lockedVersions(name: string): Set<string> {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entry = new RegExp(`^ {2}'?${escaped}@(\\d[^':]*)'?:`);

  return new Set(
    lockfile
      .map((line) => entry.exec(line)?.[1])
      .filter((v) => v !== undefined),
  );
}

let failed = false;

for (const name of SINGLE_VERSION) {
  const versions = lockedVersions(name);

  if (versions.size === 0) {
    failed = true;
    console.error(
      `${name} is no longer in pnpm-lock.yaml. Drop it from SINGLE_VERSION in ${import.meta.filename}, along with any override it has in pnpm-workspace.yaml.`,
    );
  } else if (versions.size > 1) {
    failed = true;
    console.error(
      `${name} resolved to ${versions.size} versions: ${[...versions].join(", ")}. Update its override in pnpm-workspace.yaml, or drop the override if upstream no longer needs it.`,
    );
  }
}

process.exit(failed ? 1 : 0);
