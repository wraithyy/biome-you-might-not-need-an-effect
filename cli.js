#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve, join } from "node:path"

const PACKAGE_NAME = "biome-you-might-not-need-an-effect"

const RECOMMENDED_RULES = [
  "no-derived-state",
  "no-state-reset-effect",
  "no-network-in-effect",
  "no-fetch-without-cleanup",
  "no-subscribe-in-effect",
]

const STRICT_RULES = [
  ...RECOMMENDED_RULES,
  "no-effect-chains",
  "no-parent-callback-effect",
]

const RULE_DESCRIPTIONS = {
  "no-derived-state": "Avoid setting derived state in useEffect",
  "no-state-reset-effect": "Avoid resetting state on prop change via useEffect",
  "no-network-in-effect": "Avoid network requests triggered by state in useEffect",
  "no-fetch-without-cleanup": "Data fetching in useEffect must have cleanup",
  "no-subscribe-in-effect": "Prefer useSyncExternalStore over useEffect subscriptions",
  "no-effect-chains": "Avoid cascading useEffect chains (strict)",
  "no-parent-callback-effect": "Avoid calling parent callbacks in useEffect (strict)",
}

const RULE_SEVERITIES = {
  "no-derived-state": "error",
  "no-state-reset-effect": "warn",
  "no-network-in-effect": "warn",
  "no-fetch-without-cleanup": "error",
  "no-subscribe-in-effect": "warn",
  "no-effect-chains": "warn",
  "no-parent-callback-effect": "warn",
}

function getPluginPaths(rules) {
  return rules.map((rule) => `${PACKAGE_NAME}/rules/${rule}.grit`)
}

function readBiomeJson(cwd) {
  const biomeJsonPath = resolve(cwd, "biome.json")
  if (!existsSync(biomeJsonPath)) {
    return null
  }
  return JSON.parse(readFileSync(biomeJsonPath, "utf-8"))
}

function writeBiomeJson(cwd, config) {
  const biomeJsonPath = resolve(cwd, "biome.json")
  writeFileSync(biomeJsonPath, JSON.stringify(config, null, 2) + "\n")
}

function init(args) {
  const cwd = process.cwd()
  const isStrict = args.includes("--strict")
  const isForce = args.includes("--force")
  const existing = readBiomeJson(cwd)

  if (existing && !isForce) {
    console.error(
      "biome.json already exists. Use --force to overwrite, or use `merge` to add to existing config."
    )
    process.exit(1)
  }

  const rules = isStrict ? STRICT_RULES : RECOMMENDED_RULES
  const config = {
    $schema: "https://biomejs.dev/schemas/2.0.0/schema.json",
    plugins: getPluginPaths(rules),
  }

  writeBiomeJson(cwd, config)
  const preset = isStrict ? "strict" : "recommended"
  console.log(`Created biome.json with ${preset} preset (${rules.length} rules).`)
}

function merge(args) {
  const cwd = process.cwd()
  const isStrict = args.includes("--strict")
  const config = readBiomeJson(cwd)

  if (!config) {
    console.error("No biome.json found. Use `init` to create one.")
    process.exit(1)
  }

  const rules = isStrict ? STRICT_RULES : RECOMMENDED_RULES
  const pluginPaths = getPluginPaths(rules)

  const existingPlugins = config.plugins || []
  const filtered = existingPlugins.filter(
    (p) => !p.includes(PACKAGE_NAME)
  )
  config.plugins = [...filtered, ...pluginPaths]

  writeBiomeJson(cwd, config)
  const preset = isStrict ? "strict" : "recommended"
  console.log(`Merged ${preset} preset (${rules.length} rules) into biome.json.`)
}

function remove() {
  const cwd = process.cwd()
  const config = readBiomeJson(cwd)

  if (!config) {
    console.error("No biome.json found.")
    process.exit(1)
  }

  if (config.plugins) {
    config.plugins = config.plugins.filter(
      (p) => !p.includes(PACKAGE_NAME)
    )
    if (config.plugins.length === 0) {
      delete config.plugins
    }
  }

  writeBiomeJson(cwd, config)
  console.log("Removed all biome-you-might-not-need-an-effect rules from biome.json.")
}

function rules() {
  console.log("\nbiome-you-might-not-need-an-effect rules:\n")
  console.log(
    "Rule".padEnd(32) + "Severity".padEnd(10) + "Preset".padEnd(14) + "Description"
  )
  console.log("-".repeat(100))

  for (const [rule, desc] of Object.entries(RULE_DESCRIPTIONS)) {
    const severity = RULE_SEVERITIES[rule]
    const preset = RECOMMENDED_RULES.includes(rule) ? "recommended" : "strict"
    console.log(
      rule.padEnd(32) + severity.padEnd(10) + preset.padEnd(14) + desc
    )
  }
  console.log("")
}

const command = process.argv[2]
const args = process.argv.slice(3)

switch (command) {
  case "init":
    init(args)
    break
  case "merge":
    merge(args)
    break
  case "remove":
    remove()
    break
  case "rules":
    rules()
    break
  default:
    console.log(`
biome-you-might-not-need-an-effect - Biome plugin for React useEffect anti-patterns

Usage:
  npx biome-you-might-not-need-an-effect <command> [options]

Commands:
  init [--strict] [--force]   Create biome.json with plugin rules
  merge [--strict]            Add plugin rules to existing biome.json
  remove                      Remove plugin rules from biome.json
  rules                       List all available rules

Options:
  --strict                    Include strict rules (may have false positives)
  --force                     Overwrite existing biome.json (init only)

Learn more: https://react.dev/learn/you-might-not-need-an-effect
`)
    break
}
