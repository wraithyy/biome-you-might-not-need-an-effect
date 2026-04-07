#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PACKAGE_NAME = "biome-you-might-not-need-an-effect";

const RECOMMENDED_RULES = [
	"no-derived-state",
	"no-state-reset-effect",
	"no-network-in-effect",
	"no-fetch-without-cleanup",
	"no-subscribe-in-effect",
];

const STRICT_RULES = [
	...RECOMMENDED_RULES,
	"no-effect-chains",
	"no-parent-callback-effect",
];

const RULE_DESCRIPTIONS = {
	"no-derived-state": "Avoid setting derived state in useEffect",
	"no-state-reset-effect": "Avoid resetting state on prop change via useEffect",
	"no-network-in-effect":
		"Avoid network requests triggered by state in useEffect",
	"no-fetch-without-cleanup": "Data fetching in useEffect must have cleanup",
	"no-subscribe-in-effect":
		"Prefer useSyncExternalStore over useEffect subscriptions",
	"no-effect-chains": "Avoid cascading useEffect chains (strict)",
	"no-parent-callback-effect":
		"Avoid calling parent callbacks in useEffect (strict)",
};

const RULE_SEVERITIES = {
	"no-derived-state": "error",
	"no-state-reset-effect": "warn",
	"no-network-in-effect": "warn",
	"no-fetch-without-cleanup": "error",
	"no-subscribe-in-effect": "warn",
	"no-effect-chains": "warn",
	"no-parent-callback-effect": "warn",
};

function getPluginPaths(rules) {
	return rules.map((rule) => `${PACKAGE_NAME}/rules/${rule}.grit`);
}

function findBiomeConfig(cwd) {
	for (const name of ["biome.json", "biome.jsonc"]) {
		const filePath = resolve(cwd, name);
		if (existsSync(filePath)) {
			return filePath;
		}
	}
	return null;
}

function stripJsonComments(text) {
	let result = "";
	let i = 0;
	let inString = false;
	while (i < text.length) {
		if (inString) {
			if (text[i] === "\\" && i + 1 < text.length) {
				result += text[i] + text[i + 1];
				i += 2;
				continue;
			}
			if (text[i] === '"') {
				inString = false;
			}
			result += text[i];
			i++;
			continue;
		}
		if (text[i] === '"') {
			inString = true;
			result += text[i];
			i++;
			continue;
		}
		if (text[i] === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") {
				i++;
			}
			continue;
		}
		if (text[i] === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) {
				i++;
			}
			i += 2;
			continue;
		}
		result += text[i];
		i++;
	}
	return result;
}

function readBiomeConfig(cwd) {
	const configPath = findBiomeConfig(cwd);
	if (!configPath) {
		return { config: null, configPath: null };
	}
	const raw = readFileSync(configPath, "utf-8");
	const stripped = stripJsonComments(raw);
	return { config: JSON.parse(stripped), configPath };
}

function writeBiomeConfig(configPath, config) {
	writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

function init(args) {
	const cwd = process.cwd();
	const isStrict = args.includes("--strict");
	const isForce = args.includes("--force");
	const { configPath: existingPath } = readBiomeConfig(cwd);

	if (existingPath && !isForce) {
		console.error(
			`${existingPath} already exists. Use --force to overwrite, or use \`merge\` to add to existing config.`,
		);
		process.exit(1);
	}

	const rules = isStrict ? STRICT_RULES : RECOMMENDED_RULES;
	const config = {
		$schema: "https://biomejs.dev/schemas/2.0.0/schema.json",
		plugins: getPluginPaths(rules),
	};

	const targetPath = existingPath || resolve(cwd, "biome.json");
	writeBiomeConfig(targetPath, config);
	const preset = isStrict ? "strict" : "recommended";
	console.log(
		`Created ${targetPath} with ${preset} preset (${rules.length} rules).`,
	);
}

function merge(args) {
	const cwd = process.cwd();
	const isStrict = args.includes("--strict");
	const { config, configPath } = readBiomeConfig(cwd);

	if (!config) {
		console.error(
			"No biome.json or biome.jsonc found. Use `init` to create one.",
		);
		process.exit(1);
	}

	const rules = isStrict ? STRICT_RULES : RECOMMENDED_RULES;
	const pluginPaths = getPluginPaths(rules);

	const existingPlugins = config.plugins || [];
	const filtered = existingPlugins.filter((p) => !p.includes(PACKAGE_NAME));
	config.plugins = [...filtered, ...pluginPaths];

	writeBiomeConfig(configPath, config);
	const preset = isStrict ? "strict" : "recommended";
	console.log(
		`Merged ${preset} preset (${rules.length} rules) into ${configPath}.`,
	);
}

function remove() {
	const cwd = process.cwd();
	const { config, configPath } = readBiomeConfig(cwd);

	if (!config) {
		console.error("No biome.json or biome.jsonc found.");
		process.exit(1);
	}

	if (config.plugins) {
		config.plugins = config.plugins.filter((p) => !p.includes(PACKAGE_NAME));
		if (config.plugins.length === 0) {
			delete config.plugins;
		}
	}

	writeBiomeConfig(configPath, config);
	console.log(
		`Removed all biome-you-might-not-need-an-effect rules from ${configPath}.`,
	);
}

function rules() {
	console.log("\nbiome-you-might-not-need-an-effect rules:\n");
	console.log(
		"Rule".padEnd(32) +
			"Severity".padEnd(10) +
			"Preset".padEnd(14) +
			"Description",
	);
	console.log("-".repeat(100));

	for (const [rule, desc] of Object.entries(RULE_DESCRIPTIONS)) {
		const severity = RULE_SEVERITIES[rule];
		const preset = RECOMMENDED_RULES.includes(rule) ? "recommended" : "strict";
		console.log(
			rule.padEnd(32) + severity.padEnd(10) + preset.padEnd(14) + desc,
		);
	}
	console.log("");
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
	case "init":
		init(args);
		break;
	case "merge":
		merge(args);
		break;
	case "remove":
		remove();
		break;
	case "rules":
		rules();
		break;
	default:
		console.log(`
biome-you-might-not-need-an-effect - Biome plugin for React useEffect anti-patterns

Usage:
  npx biome-you-might-not-need-an-effect <command> [options]

Commands:
  init [--strict] [--force]   Create biome.json with plugin rules
  merge [--strict]            Add plugin rules to existing biome.json(c)
  remove                      Remove plugin rules from biome.json(c)
  rules                       List all available rules

Options:
  --strict                    Include strict rules (may have false positives)
  --force                     Overwrite existing biome.json (init only)

Learn more: https://react.dev/learn/you-might-not-need-an-effect
`);
		break;
}
