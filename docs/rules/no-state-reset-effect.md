# no-state-reset-effect

**Severity:** warn  
**Preset:** recommended

## What it detects

This rule flags `useEffect` hooks that reset state to a literal value (`''`, `null`, `undefined`, `0`, `false`, `true`, `[]`, `{}`) in response to a prop change, which is the classic pattern for resetting a child component when its "identity" changes.

## Why it's bad

Resetting state inside `useEffect` causes the component to render twice on every prop change: first with the old state (producing incorrect UI for one frame), then again after the effect fires and resets the value. The double render is unnecessary and the intent is not immediately obvious from reading the code.

The idiomatic React solution is to pass a `key` prop that changes when the identity changes. React will unmount and remount the component, giving it a fresh state with zero extra renders. When only part of the state should reset, lift that logic into the event handler or derive it during render.

React documentation: [Resetting all state when a prop changes](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)

## Bad example

```tsx
function CommentEditor({ articleId }) {
  const [text, setText] = useState('')

  useEffect(() => {
    setText('')
  }, [articleId])

  return <textarea value={text} onChange={(e) => setText(e.target.value)} />
}
```

The effect resets the draft whenever `articleId` changes, but the component renders with the stale draft first.

## Good example

```tsx
function CommentEditor({ articleId }) {
  const [text, setText] = useState('')

  return <textarea value={text} onChange={(e) => setText(e.target.value)} />
}

// Parent mounts a fresh CommentEditor for each article
<CommentEditor key={articleId} articleId={articleId} />
```

Changing `key` causes React to unmount the old instance and mount a new one, starting with clean state — no extra renders, no effect required.

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)
