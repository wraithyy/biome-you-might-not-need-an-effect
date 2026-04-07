# no-network-in-effect

**Severity:** warn  
**Preset:** recommended

## What it detects

This rule flags `useEffect` hooks that contain a network request (`fetch`, `axios.post`, `axios.put`, `axios.patch`, `axios.delete`) guarded by an `if` condition, which is the characteristic shape of an effect that fires a request in response to a state change rather than a direct user action.

## Why it's bad

When a network request is triggered by state that was itself set in response to a user action, the effect is an unnecessary intermediary. The state change causes a re-render, which schedules the effect, which fires the request — when the request could have been fired directly in the event handler that triggered the state change in the first place.

Using an effect for this purpose creates confusing data flow, makes the code harder to follow, and can cause unintended requests if the triggering state changes for reasons other than the intended user action.

React documentation: [Sending a POST request](https://react.dev/learn/you-might-not-need-an-effect#sending-a-post-request)

## Bad example

```tsx
function Form() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '' })

  useEffect(() => {
    if (submitted) {
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
    }
  }, [submitted, formData])

  return (
    <form onSubmit={() => setSubmitted(true)}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ name: e.target.value })}
      />
      <button type="submit">Save</button>
    </form>
  )
}
```

## Good example

```tsx
function Form() {
  const [formData, setFormData] = useState({ name: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ name: e.target.value })}
      />
      <button type="submit">Save</button>
    </form>
  )
}
```

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#sending-a-post-request)
