# no-parent-callback-effect

**Severity:** warn  
**Preset:** strict

## What it detects

This rule flags `useEffect` hooks that call a prop whose name matches the `on*` convention (such as `onChange`, `onUpdate`, `onSelect`) and include that prop in the dependency array. This is the pattern of notifying a parent component about state changes through an effect rather than directly in the event handler.

## Why it's bad

Calling a parent callback inside `useEffect` delays the notification by one render cycle. The component state changes, the component re-renders, the effect fires, the parent callback is called, and then the parent re-renders. The parent's view of the world is always one step behind.

In addition, this pattern ties the component to the behavior of the parent callback. If the parent callback changes its reference on every render (which is common with inline functions), the effect will fire more often than intended, potentially causing infinite loops or unexpected behavior.

The correct approach is to call the parent callback at the same time the state is updated, inside the event handler that triggered the change.

React documentation: [Notifying parent components about state changes](https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes)

## Bad example

```tsx
function Toggle({ onChange }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    onChange(on)
  }, [on, onChange])

  return (
    <button onClick={() => setOn((prev) => !prev)}>
      {on ? 'On' : 'Off'}
    </button>
  )
}
```

The parent receives the updated value one render after the toggle happens. If `onChange` is an unstable reference, the effect may fire on every render.

## Good example

```tsx
function Toggle({ onChange }) {
  const [on, setOn] = useState(false)

  function handleClick() {
    const next = !on
    setOn(next)
    onChange(next)
  }

  return (
    <button onClick={handleClick}>
      {on ? 'On' : 'Off'}
    </button>
  )
}
```

The parent is notified synchronously, in the same event that caused the state change. No effect is needed.

If the component needs to manage state internally but also expose changes to a parent, the same pattern applies: compute the next value, update local state, and call the parent callback — all in the same handler.

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes)
