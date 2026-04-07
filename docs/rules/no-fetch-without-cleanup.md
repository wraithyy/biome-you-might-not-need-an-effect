# no-fetch-without-cleanup

**Severity:** error  
**Preset:** recommended

## What it detects

This rule flags `useEffect` hooks that contain a `fetch()` call but have no `return` statement. A missing return means there is no cleanup function, which leaves the effect vulnerable to race conditions.

## Why it's bad

When a component re-renders before a previous fetch has resolved, two requests are in flight simultaneously. Without a cleanup function, both will attempt to call `setState` when they complete. Whichever finishes last will "win", which may not be the most recent request. This produces stale data displayed to the user, and if the component has unmounted by the time the response arrives, it also causes a React warning about updating state on an unmounted component.

The fix is to track whether the current effect invocation is still active using an `ignore` flag, or to use an `AbortController` to cancel the in-flight request on cleanup. Data-fetching libraries such as TanStack Query and SWR handle this automatically.

React documentation: [Fetching data](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)

## Bad example

```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
  }, [userId])

  if (!user) return <p>Loading...</p>
  return <p>{user.name}</p>
}
```

If `userId` changes before the first request resolves, both responses will attempt to call `setUser`.

## Good example

Using an ignore flag:

```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

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

  if (!user) return <p>Loading...</p>
  return <p>{user.name}</p>
}
```

Using `AbortController`:

```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => {
        if (err.name !== 'AbortError') throw err
      })

    return () => {
      controller.abort()
    }
  }, [userId])

  if (!user) return <p>Loading...</p>
  return <p>{user.name}</p>
}
```

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)
