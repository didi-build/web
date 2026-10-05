import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SCHEDULER_URL_PATTERN = /moxieapp|withmoxie|portal\.didi\.build/;

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      collectSourceFiles(path, acc);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(name)) {
      continue;
    }
    if (name.endsWith(".test.ts") || name.endsWith(".test.tsx")) {
      continue;
    }
    acc.push(path);
  }
  return acc;
}

describe("source guard (no scheduler URLs in src/)", () => {
  it("contains no moxieapp, withmoxie, or portal.didi.build in non-test source files", () => {
    const offenders = collectSourceFiles("src").filter((path) =>
      SCHEDULER_URL_PATTERN.test(readFileSync(path, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
