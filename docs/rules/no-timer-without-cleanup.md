# no-timer-without-cleanup

**Severity:** error  
**Preset:** recommended

## What it detects

This rule flags `useEffect` hooks that contain `setInterval()` or `setTimeout()` but have no `return` statement (cleanup function).

## Why it's bad

When a component re-renders, React tears down the previous effect and runs it again. If a `setInterval` has no cleanup, the old interval keeps running alongside the new one. After several re-renders, dozens of intervals may be stacking up, each firing callbacks and potentially updating unmounted state. `setTimeout` has the same issue on fast re-renders: the timer fires after the component has already been cleaned up.

The fix is to always return a cleanup function that calls `clearInterval` or `clearTimeout`.

React documentation: [Step 3: Add cleanup if needed](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)

## Bad example

```tsx
function PollingComponent({ url }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const id = setInterval(() => {
      fetch(url).then(r => r.json()).then(setData)
    }, 5000)
  }, [url])

  return <div>{JSON.stringify(data)}</div>
}
```

Every time `url` changes, a new interval is created without clearing the old one. After 5 URL changes, 5 intervals are running simultaneously.

## Good example

```tsx
function PollingComponent({ url }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const id = setInterval(() => {
      fetch(url).then(r => r.json()).then(setData)
    }, 5000)
    return () => clearInterval(id)
  }, [url])

  return <div>{JSON.stringify(data)}</div>
}
```

## Further reading

[Synchronizing with Effects - react.dev](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)
