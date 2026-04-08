# no-observer-in-effect

**Severity:** warn  
**Preset:** strict

## What it detects

This rule flags `useEffect` hooks that create `IntersectionObserver`, `MutationObserver`, or `ResizeObserver` instances.

## Why it's bad

Browser Observer APIs are subscription patterns. When used in `useEffect`, they rely on refs being populated after render, which can lead to timing issues. With React 19+ ref callbacks, the observer can be set up and torn down as part of the ref lifecycle, which is more predictable and doesn't require an effect at all.

Even in earlier React versions, this rule serves as a reminder that observer setup is a subscription pattern that benefits from careful lifecycle management.

React documentation: [Subscribing to an external store](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)

## Bad example

```tsx
function LazyImage({ src }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return <img ref={ref} src={visible ? src : ""} />
}
```

## Good example

Using a ref callback (React 19+):

```tsx
function LazyImage({ src }) {
  const [visible, setVisible] = useState(false)

  const ref = useCallback((node) => {
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return <img ref={ref} src={visible ? src : ""} />
}
```

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)
