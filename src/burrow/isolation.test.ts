import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Burrow product isolation", () => {
  it("does not import Abriss gameplay modules", () => {
    const root = join(process.cwd(), "src", "burrow");
    const sourceFiles = collectTypeScriptFiles(root);
    const forbiddenImports: string[] = [];

    for (const sourceFile of sourceFiles) {
      const source = readFileSync(sourceFile, "utf8");
      if (
        /from\s+["'](?:\.\.\/){2,}(?:game|simulation|manager|content)\//.test(source)
      ) {
        forbiddenImports.push(sourceFile);
      }
    }

    expect(forbiddenImports).toEqual([]);
  });
});

function collectTypeScriptFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(path));
    } else if (extname(entry.name) === ".ts") {
      files.push(path);
    }
  }
  return files;
}
