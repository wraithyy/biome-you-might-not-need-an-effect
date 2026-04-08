import { useEffect, useState, useMemo } from "react";

// SHOULD FLAG: derived state from props
function DerivedFromProps({ items }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(items.length);
  }, [items]);
  return <div>{total}</div>;
}

// SHOULD FLAG: derived state with transformation
function TransformedState({ firstName, lastName }) {
  const [name, setName] = useState("");
  useEffect(() => {
    setName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  return <div>{name}</div>;
}

// SHOULD NOT FLAG: fetch in effect (legitimate)
function FetchInEffect({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(`/api/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!ignore) setData(d);
      });
    return () => { ignore = true; };
  }, [id]);
  return <div>{data}</div>;
}

// SHOULD NOT FLAG: no dependency array (runs every render, different pattern)
function NoDepArray() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount((c) => c + 1);
  });
  return <div>{count}</div>;
}

// SHOULD NOT FLAG: empty dependency array (runs once, initialization)
function EmptyDepArray() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    setConfig(window.__APP_CONFIG__);
  }, []);
  return <div>{JSON.stringify(config)}</div>;
}

// SHOULD NOT FLAG: await in effect (async operation)
function AsyncEffect({ userId }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/users/${userId}`);
      setProfile(await res.json());
    }
    load();
  }, [userId]);
  return <div>{profile?.name}</div>;
}

// SHOULD FLAG: multiple state setters computing derived values
function MultipleDerived({ cart }) {
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  useEffect(() => {
    setSubtotal(cart.reduce((s, item) => s + item.price, 0));
    setTax(subtotal * 0.21);
  }, [cart]);
  return <div>{subtotal + tax}</div>;
}

// SHOULD NOT FLAG: addEventListener (legitimate subscription)
function EventListenerEffect() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    addEventListener("resize", handler);
    return () => removeEventListener("resize", handler);
  }, []);
  return <div>{width}</div>;
}
