# no-effect-chains

**Severity:** warn  
**Preset:** strict

## What it detects

This rule flags `useEffect` hooks whose body consists of a conditional `setState` call (with no fetch, await, subscriptions, or cleanup), where the condition is based on other state. This is the characteristic shape of an effect that reacts to state set by another effect, forming a chain.

## Why it's bad

Effect chains cause cascading re-renders. When effect A sets state X, and effect B watches state X and sets state Y, React must render at least three times to reach a stable result: once on the original trigger, once after effect A fires, and once after effect B fires. The logic is split across multiple places, making it hard to trace cause and effect.

In almost every case, the intermediate state variable is unnecessary. The values can be computed in a single pass during render, or the logic can be consolidated into a single event handler or a single effect.

React documentation: [Chains of computations](https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations)

## Bad example

```tsx
function Checkout({ cart }) {
  const [hasItems, setHasItems] = useState(false)
  const [canCheckout, setCanCheckout] = useState(false)

  useEffect(() => {
    setHasItems(cart.length > 0)
  }, [cart])

  // This effect chains off the state set by the previous effect
  useEffect(() => {
    if (hasItems) {
      setCanCheckout(true)
    }
  }, [hasItems])

  return <button disabled={!canCheckout}>Checkout</button>
}
```

Three renders happen on every `cart` change: initial render, after `setHasItems`, after `setCanCheckout`.

## Good example

```tsx
function Checkout({ cart }) {
  const hasItems = cart.length > 0
  const canCheckout = hasItems

  return <button disabled={!canCheckout}>Checkout</button>
}
```

Both values are derived directly from `cart` during render — no effects, no extra state, one render per `cart` change.

For more complex cases where some effects are unavoidable, consolidate the logic into a single effect or a single event handler rather than chaining effects through state.

## Further reading

[You Might Not Need an Effect - react.dev](https://react.dev/learn/you-might-not-need-an-effect#chains-of-computations)
