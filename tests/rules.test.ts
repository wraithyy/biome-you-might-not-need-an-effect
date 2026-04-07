import { spawnSync } from "node:child_process"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it, expect } from "vitest"

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function runBiomeLint(fixturePath: string): string {
  const result = spawnSync("npx", ["@biomejs/biome", "lint", fixturePath], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
  })
  return (result.stdout ?? "") + (result.stderr ?? "")
}

const rules = [
  "no-derived-state",
  "no-state-reset-effect",
  "no-network-in-effect",
  "no-fetch-without-cleanup",
  "no-subscribe-in-effect",
  "no-effect-chains",
  "no-parent-callback-effect",
] as const

for (const rule of rules) {
  describe(rule, () => {
    it("reports diagnostics on invalid code", () => {
      const output = runBiomeLint(`tests/fixtures/${rule}/invalid.tsx`)
      expect(output).toContain("plugin")
    })

    it("reports no plugin diagnostics on valid code", () => {
      const output = runBiomeLint(`tests/fixtures/${rule}/valid.tsx`)
      expect(output).not.toContain("plugin")
    })
  })
}
