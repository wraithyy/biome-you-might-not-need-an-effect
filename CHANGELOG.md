# Changelog

## 1.1.0

### Features

- CLI now supports `biome.jsonc` (with comments)

### Fixes

- Plugin paths now use `./node_modules/` prefix so Biome can resolve them correctly
- Fixed lint/formatting issues in all source files

## 0.1.0

Initial release.

### Rules

- `no-derived-state` - Avoid setting derived state in useEffect
- `no-state-reset-effect` - Avoid resetting state on prop change via useEffect
- `no-network-in-effect` - Avoid network requests triggered by state in useEffect
- `no-fetch-without-cleanup` - Data fetching in useEffect must have cleanup
- `no-subscribe-in-effect` - Prefer useSyncExternalStore over useEffect subscriptions
- `no-effect-chains` - Avoid cascading useEffect chains
- `no-parent-callback-effect` - Avoid calling parent callbacks in useEffect
