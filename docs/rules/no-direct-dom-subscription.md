# no-direct-dom-subscription

**Severity:** warn  
**Preset:** recommended

## What it detects

This rule flags `useEffect` hooks that use direct event handler assignment (`.onmessage`, `.onerror`, `.onopen`, `.onclose`, `.onconnect`) instead of `addEventListener`.

## Why it's bad

Direct handler assignment (`.onmessage = fn`) is a subscription pattern commonly used with WebSocket, EventSource, and BroadcastChannel. Unlike `addEventListener`, direct assignment allows only one handler per event and makes it harder to compose multiple listeners. It also bypasses the standard add/remove pattern that React's concurrent rendering model works best with.

For external store subscriptions, React provides `useSyncExternalStore` which handles concurrent rendering correctly.

React documentation: [Subscribing to an external store](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)

## Bad example

```tsx
function WebSocketChat({ url }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data])
    }
    return () => ws.close()
  }, [url])

  return <ul>{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>
}
```

## Good example

```tsx
function WebSocketChat({ url }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const ws = new WebSocket(url)
    const handler = (e) => {
      setMessages((prev) => [...prev, e.data])
    }
    ws.addEventListener("message", handler)
    return () => {
      ws.removeEventListener("message", handler)
      ws.close()
    }
  }, [url])

  return <ul>{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>
}
```

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)
