<p align="center">
  <img src="https://biomejs.dev/img/biome-logo.svg" width="64" height="64" alt="Biome" />
</p>

<h1 align="center">biome-you-might-not-need-an-effect</h1>

<p align="center">
  A Biome plugin that catches common React <code>useEffect</code> anti-patterns at lint time.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/biome-you-might-not-need-an-effect"><img src="https://img.shields.io/npm/v/biome-you-might-not-need-an-effect?style=flat&colorA=18181b&colorB=f58517" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/biome-you-might-not-need-an-effect"><img src="https://img.shields.io/npm/dm/biome-you-might-not-need-an-effect?style=flat&colorA=18181b&colorB=f58517" alt="npm downloads" /></a>
  <a href="https://github.com/wraithyy/biome-you-might-not-need-an-effect/blob/main/LICENSE"><img src="https://img.shields.io/github/license/wraithyy/biome-you-might-not-need-an-effect?style=flat&colorA=18181b&colorB=f58517" alt="license" /></a>
  <a href="https://biomejs.dev"><img src="https://img.shields.io/badge/biome-%3E%3D2.0.0-f58517?style=flat&colorA=18181b" alt="biome >= 2.0.0" /></a>
</p>

<p align="center">
  Based on the official React guide: <a href="https://react.dev/learn/you-might-not-need-an-effect">You Might Not Need an Effect</a>
</p>

---

Most `useEffect` misuse falls into predictable patterns: deriving state from props, fetching data without cleanup, triggering network requests from state changes, or subscribing to stores manually. This plugin catches those patterns **before code review**, so you can focus on the things that actually need human eyes.

## Quick Start

```sh
npm install -D biome-you-might-not-need-an-effect
npx biome-you-might-not-need-an-effect merge
```

That's it. The CLI adds the recommended rules to your existing `biome.json` (or `biome.jsonc`).

> Requires `@biomejs/biome` >= 2.0.0

## Rules

### Recommended preset (5 rules)

Low false-positive rules suitable for any React codebase.

| Rule | Severity | What it catches |
|:-----|:--------:|:----------------|
| [`no-derived-state`](#no-derived-state) | error | Setting state that could be computed during render |
| [`no-state-reset-effect`](#no-state-reset-effect) | warn | Resetting state to a literal on prop change |
| [`no-network-in-effect`](#no-network-in-effect) | warn | POST/PUT/PATCH/DELETE triggered by state changes |
| [`no-fetch-without-cleanup`](#no-fetch-without-cleanup) | error | Data fetching without a cleanup function (race conditions) |
| [`no-subscribe-in-effect`](#no-subscribe-in-effect) | warn | Manual subscriptions that should use `useSyncExternalStore` |

### Strict preset (+2 rules)

Additional heuristic rules for greenfield projects. May require occasional suppression.

| Rule | Severity | What it catches |
|:-----|:--------:|:----------------|
| [`no-effect-chains`](#no-effect-chains) | warn | Conditional `setState` in effects creating cascading re-renders |
| [`no-parent-callback-effect`](#no-parent-callback-effect) | warn | Calling `onChange`/`onUpdate` callbacks inside effects |

## Setup

### CLI (recommended)

```sh
# Add recommended rules to existing config
npx biome-you-might-not-need-an-effect merge

# Add all rules (recommended + strict)
npx biome-you-might-not-need-an-effect merge --strict

# Create a fresh biome.json with plugin rules
npx biome-you-might-not-need-an-effect init

# Remove all plugin rules
npx biome-you-might-not-need-an-effect remove

# Print rule table
npx biome-you-might-not-need-an-effect rules
```

### Manual

Add the plugin paths to your `biome.json`:

```jsonc
{
  "plugins": [
    // recommended
    "./node_modules/biome-you-might-not-need-an-effect/rules/no-derived-state.grit",
    "./node_modules/biome-you-might-not-need-an-effect/rules/no-state-reset-effect.grit",
    "./node_modules/biome-you-might-not-need-an-effect/rules/no-network-in-effect.grit",
    "./node_modules/biome-you-might-not-need-an-effect/rules/no-fetch-without-cleanup.grit",
    "./node_modules/biome-you-might-not-need-an-effect/rules/no-subscribe-in-effect.grit",
    // strict
    "./node_modules/biome-you-might-not-need-an-effect/rules/no-effect-chains.grit",
    "./node_modules/biome-you-might-not-need-an-effect/rules/no-parent-callback-effect.grit"
  ]
}
```

## Rule Details

### no-derived-state

If a value can be computed from props or existing state, calculate it during render instead of syncing it with an effect.

```tsx
// Bad - unnecessary effect and extra re-render
function Component({ items }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(items.length);
  }, [items]);
  return <div>{count}</div>;
}

// Good - derive during render
function Component({ items }) {
  const count = items.length;
  return <div>{count}</div>;
}

// Good - expensive computation
function Component({ items }) {
  const sorted = useMemo(() => items.sort(compareFn), [items]);
  return <List items={sorted} />;
}
```

### no-state-reset-effect

Resetting state to a literal (`null`, `""`, `0`, `[]`, etc.) when a prop changes causes an unnecessary re-render. Use a `key` prop to reset the whole component instead.

```tsx
// Bad - extra render cycle on every query change
function SearchResults({ query }) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [query]);
}

// Good - React remounts the component when key changes
<SearchResults key={query} query={query} />
```

### no-network-in-effect

Network mutations (POST, PUT, PATCH, DELETE) triggered by state changes belong in event handlers, not effects. Effects run after render, which means the request fires at the wrong time and is harder to reason about.

```tsx
// Bad - POST fires after render, not after user action
useEffect(() => {
  if (submitted) {
    fetch("/api/submit", { method: "POST", body: data });
  }
}, [submitted]);

// Good - request fires when the user clicks
function handleSubmit() {
  fetch("/api/submit", { method: "POST", body: data });
}
```

### no-fetch-without-cleanup

Data fetching inside `useEffect` without a cleanup function causes race conditions. If the component re-renders before the fetch completes, the old response can overwrite newer data.

```tsx
// Bad - race condition if userId changes quickly
useEffect(() => {
  fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .then(setUser);
}, [userId]);

// Good - stale responses are ignored
useEffect(() => {
  let ignore = false;
  fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      if (!ignore) setUser(data);
    });
  return () => { ignore = true; };
}, [userId]);
```

> Consider using a data-fetching library like [TanStack Query](https://tanstack.com/query) or [SWR](https://swr.vercel.app) which handle cleanup, caching, and deduplication automatically.

### no-subscribe-in-effect

Manual subscriptions to external stores or DOM events in `useEffect` are error-prone. React provides `useSyncExternalStore` for this exact use case, with proper support for concurrent rendering.

```tsx
// Bad - manual subscription
useEffect(() => {
  const unsub = store.subscribe(() => setValue(store.getState()));
  return unsub;
}, []);

// Good - built-in hook
const value = useSyncExternalStore(store.subscribe, store.getSnapshot);
```

### no-effect-chains

*Strict only.* Effects that conditionally set state based on other state create cascading re-renders (effect chains). Derive the value during render or consolidate logic in event handlers.

```tsx
// Bad - sets state conditionally, triggers another render
useEffect(() => {
  if (step === "loading") {
    setStatus("pending");
  }
}, [step]);

// Good - derive inline
const status = step === "loading" ? "pending" : currentStatus;
```

### no-parent-callback-effect

*Strict only.* Calling parent callbacks like `onChange` or `onUpdate` inside `useEffect` delays the notification by a render cycle and creates confusing data flow. Call the callback in the event handler that triggers the change.

```tsx
// Bad - parent notified one render late
function Toggle({ onChange }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    onChange(on);
  }, [on, onChange]);
  return <button onClick={() => setOn((v) => !v)}>Toggle</button>;
}

// Good - parent notified immediately
function Toggle({ onChange }) {
  const [on, setOn] = useState(false);
  function handleClick() {
    const next = !on;
    setOn(next);
    onChange(next);
  }
  return <button onClick={handleClick}>Toggle</button>;
}
```

## How It Works

Each rule is a [GritQL](https://docs.grit.io/) pattern file (`.grit`) that Biome executes as a plugin. GritQL matches AST structures, so the rules work on the actual code tree, not string matching. The patterns exclude known legitimate uses (fetching, async operations, subscriptions) to minimize false positives.

## Suppressing Rules

If a rule flags a legitimate use case, suppress it with a Biome inline comment:

```tsx
// biome-ignore plugin: fetching config is intentional here
useEffect(() => {
  setConfig(window.__APP_CONFIG__);
}, []);
```

## Contributing

Contributions are welcome. If you find a false positive or a missed pattern, please [open an issue](https://github.com/wraithyy/biome-you-might-not-need-an-effect/issues).

```sh
git clone https://github.com/wraithyy/biome-you-might-not-need-an-effect
cd biome-you-might-not-need-an-effect
npm install
npm test
```

## License

[MIT](LICENSE)

## Further Reading

- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) - React documentation
- [Biome Plugins](https://biomejs.dev/plugins/) - Biome plugin system
- [GritQL](https://docs.grit.io/) - Pattern language used by Biome plugins
