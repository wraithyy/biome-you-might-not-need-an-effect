# no-derived-state

**Severity:** error  
**Preset:** recommended

## What it detects

This rule flags `useEffect` hooks whose entire body is a single `setState` call (a setter function matching the `set*` naming convention), indicating that a value is being derived from props or state inside an effect rather than during render.

## Why it's bad

If a value can be computed from existing props or state, there is no need to store it in state at all. Doing so forces an extra render cycle: the component renders once with the stale value, the effect runs, `setState` is called, and the component renders again with the correct value. This is always avoidable.

For expensive derivations, `useMemo` provides caching without the double-render penalty. For simple values, inline computation is both correct and more readable.

React documentation: [Updating state based on props or state](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)

## Bad example

```tsx
function ProductList({ products, category }) {
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    setFiltered(products.filter((p) => p.category === category))
  }, [products, category])

  return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
```

This stores a derived value in state and forces a double render on every change to `products` or `category`.

## Good example

```tsx
function ProductList({ products, category }) {
  const filtered = products.filter((p) => p.category === category)

  return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
```

If the filter is expensive:

```tsx
function ProductList({ products, category }) {
  const filtered = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category]
  )

  return <ul>{filtered.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
```

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#updating-state-based-on-props-or-state)
