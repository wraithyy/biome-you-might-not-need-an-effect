# biome-you-might-not-need-an-effect

A Biome linter plugin that detects React `useEffect` anti-patterns based on the official React documentation at [react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect).

Most `useEffect` misuse falls into predictable patterns: deriving state from props inside an effect, fetching data without cleanup, or triggering network requests in response to state changes. This plugin catches those patterns at lint time so they never make it to review.

---

## Requirements

- `@biomejs/biome` >= 2.0.0

---

## Installation

```sh
npm install -D biome-you-might-not-need-an-effect
```

---

## Setup

### Quick setup (recommended)

Run the CLI merge command to add the plugin rules to your existing `biome.json`:

```sh
npx biome-you-might-not-need-an-effect merge
```

For the full strict preset:

```sh
npx biome-you-might-not-need-an-effect merge --strict
```

### Manual setup

Add the plugin paths directly to your `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.10/schema.json",
  "plugins": [
    "biome-you-might-not-need-an-effect/rules/no-derived-state.grit",
    "biome-you-might-not-need-an-effect/rules/no-state-reset-effect.grit",
    "biome-you-might-not-need-an-effect/rules/no-network-in-effect.grit",
    "biome-you-might-not-need-an-effect/rules/no-fetch-without-cleanup.grit",
    "biome-you-might-not-need-an-effect/rules/no-subscribe-in-effect.grit"
  ]
}
```

---

## Rules

| Rule | Severity | Preset | Description |
|------|----------|--------|-------------|
| [no-derived-state](#no-derived-state) | error | recommended | Avoid setting derived state in useEffect |
| [no-state-reset-effect](#no-state-reset-effect) | warn | recommended | Avoid resetting state on prop change via useEffect |
| [no-network-in-effect](#no-network-in-effect) | warn | recommended | Avoid network requests triggered by state in useEffect |
| [no-fetch-without-cleanup](#no-fetch-without-cleanup) | error | recommended | Data fetching in useEffect must have cleanup |
| [no-subscribe-in-effect](#no-subscribe-in-effect) | warn | recommended | Prefer useSyncExternalStore over useEffect subscriptions |
| [no-effect-chains](#no-effect-chains) | warn | strict | Avoid cascading useEffect chains |
| [no-parent-callback-effect](#no-parent-callback-effect) | warn | strict | Avoid calling parent callbacks in useEffect |

---

## Presets

### recommended

Includes the five rules that cover the most common and unambiguous anti-patterns. Suitable for any React codebase.

Rules: `no-derived-state`, `no-state-reset-effect`, `no-network-in-effect`, `no-fetch-without-cleanup`, `no-subscribe-in-effect`

### strict

Includes all seven rules. The two additional rules (`no-effect-chains`, `no-parent-callback-effect`) have a higher rate of false positives and may require suppression comments in some codebases. Recommended for greenfield projects.

Rules: all recommended rules + `no-effect-chains`, `no-parent-callback-effect`

---

## CLI Commands

```sh
npx biome-you-might-not-need-an-effect <command> [options]
```

| Command | Description |
|---------|-------------|
| `init [--strict] [--force]` | Create a new `biome.json` with plugin rules |
| `merge [--strict]` | Add plugin rules to an existing `biome.json` |
| `remove` | Remove all plugin rules from `biome.json` |
| `rules` | Print a table of all rules with severity and preset |

### Options

| Option | Description |
|--------|-------------|
| `--strict` | Use the strict preset (applies to `init` and `merge`) |
| `--force` | Overwrite an existing `biome.json` (applies to `init` only) |

---

## Rule Details

### no-derived-state

Avoid setting derived state in useEffect. If a value can be computed from props or existing state, calculate it during render.

**Bad**

```tsx
function Component({ items }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(items.length)
  }, [items])

  return <div>{count}</div>
}
```

**Good**

```tsx
function Component({ items }) {
  const count = items.length

  return <div>{count}</div>
}
```

---

### no-state-reset-effect

Avoid resetting state to a literal value inside `useEffect` when a prop changes. Use a `key` prop to reset the component instead.

**Bad**

```tsx
function SearchResults({ query }) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [query])

  // ...
}
```

**Good**

```tsx
function SearchResults({ query }) {
  const [page, setPage] = useState(1)
  // ...
}

// Reset by changing the key when query changes
<SearchResults key={query} query={query} />
```

---

### no-network-in-effect

Avoid triggering network requests inside `useEffect` in response to state changes. Move the request into the event handler that caused the state change.

**Bad**

```tsx
function Form() {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) {
      fetch('/api/submit', { method: 'POST', body: formData })
    }
  }, [submitted])

  // ...
}
```

**Good**

```tsx
function Form() {
  function handleSubmit() {
    fetch('/api/submit', { method: 'POST', body: formData })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

### no-fetch-without-cleanup

Data fetching inside `useEffect` without a cleanup function causes race conditions. The component may set state from a stale response after it has already unmounted or re-rendered.

**Bad**

```tsx
useEffect(() => {
  fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .then((data) => setUser(data))
}, [userId])
```

**Good**

```tsx
useEffect(() => {
  let ignore = false

  fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      if (!ignore) setUser(data)
    })

  return () => {
    ignore = true
  }
}, [userId])
```

Prefer a data-fetching library (TanStack Query, SWR) which handles this automatically.

---

### no-subscribe-in-effect

Subscribing to external stores or DOM events in `useEffect` is error-prone. Use `useSyncExternalStore` for external store subscriptions.

**Bad**

```tsx
useEffect(() => {
  const unsubscribe = store.subscribe(() => {
    setSnapshot(store.getSnapshot())
  })
  return unsubscribe
}, [])
```

**Good**

```tsx
const snapshot = useSyncExternalStore(
  store.subscribe,
  store.getSnapshot
)
```

---

### no-effect-chains

Avoid `useEffect` hooks that only conditionally set state based on other state, which creates cascading re-renders. Consolidate the logic into a single derived value or event handler.

**Bad**

```tsx
useEffect(() => {
  if (step === 'loading') {
    setStatus('pending')
  }
}, [step])
```

**Good**

```tsx
const status = step === 'loading' ? 'pending' : currentStatus
```

---

### no-parent-callback-effect

Avoid calling parent callback props (such as `onChange` or `onUpdate`) inside `useEffect`. This delays the notification by a render cycle and creates confusing data flow. Call the callback directly in the event handler that triggers the change.

**Bad**

```tsx
function Toggle({ onChange }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    onChange(on)
  }, [on, onChange])

  return <button onClick={() => setOn((v) => !v)}>Toggle</button>
}
```

**Good**

```tsx
function Toggle({ onChange }) {
  const [on, setOn] = useState(false)

  function handleClick() {
    const next = !on
    setOn(next)
    onChange(next)
  }

  return <button onClick={handleClick}>Toggle</button>
}
```

---

## License

MIT

---

## Further Reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect)
