# no-subscribe-in-effect

**Severity:** warn  
**Preset:** recommended

## What it detects

This rule flags `useEffect` hooks that subscribe to external stores or DOM events using `addEventListener` or a `.subscribe()` method. These patterns are better handled by the purpose-built `useSyncExternalStore` hook.

## Why it's bad

Manually subscribing inside `useEffect` is fragile. The subscription is set up after the first render, so there is a window during which the component may miss updates. Server-side rendering adds further complications because effects do not run on the server, meaning server-rendered output may not reflect the current store state.

`useSyncExternalStore` was designed specifically for subscribing to external data sources. It handles the subscription lifecycle correctly, avoids tearing in concurrent mode, and supports server-side snapshots.

For DOM event listeners that must stay in an effect, the cleanup function (`removeEventListener`) should always be present — a missing cleanup is a common source of duplicate listener bugs, though that case is not what this rule targets. The rule targets the pattern of using an effect as a general subscription mechanism when `useSyncExternalStore` is the correct abstraction.

React documentation: [Subscribing to an external store](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)

## Bad example

Subscribing to a custom store:

```tsx
function StoreConsumer() {
  const [value, setValue] = useState(store.getSnapshot())

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setValue(store.getSnapshot())
    })
    return unsubscribe
  }, [])

  return <div>{value}</div>
}
```

Subscribing to a browser API:

```tsx
function OnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    function handleOnline() { setOnline(true) }
    function handleOffline() { setOnline(false) }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return <p>{online ? 'Online' : 'Offline'}</p>
}
```

## Good example

Using `useSyncExternalStore` for a custom store:

```tsx
function StoreConsumer() {
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  )

  return <div>{value}</div>
}
```

Using `useSyncExternalStore` for a browser API:

```tsx
function subscribe(callback) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function OnlineStatus() {
  const online = useSyncExternalStore(subscribe, getSnapshot)
  return <p>{online ? 'Online' : 'Offline'}</p>
}
```

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)
