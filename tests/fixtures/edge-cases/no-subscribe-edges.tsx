import { useEffect, useState, useSyncExternalStore } from "react";

// SHOULD FLAG: addEventListener in effect
function WindowResize() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return <div>{width}</div>;
}

// SHOULD FLAG: .subscribe pattern
function StoreSubscribe({ store }) {
  const [value, setValue] = useState(store.getState());
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setValue(store.getState());
    });
    return unsubscribe;
  }, [store]);
  return <div>{value}</div>;
}

// SHOULD FLAG: document.addEventListener
function DocumentEvent() {
  const [key, setKey] = useState("");
  useEffect(() => {
    const handler = (e) => setKey(e.key);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  return <div>{key}</div>;
}

// SHOULD NOT FLAG: useSyncExternalStore (correct pattern)
function CorrectStore({ store }) {
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  );
  return <div>{value}</div>;
}

// SHOULD NOT FLAG: no subscription at all
function SimpleEffect({ count }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    setDoubled(count * 2);
  }, [count]);
  return <div>{doubled}</div>;
}

// SHOULD FLAG: custom event subscription
function CustomEvent() {
  const [event, setEvent] = useState(null);
  useEffect(() => {
    const handler = (e) => setEvent(e.detail);
    window.addEventListener("custom-event", handler);
    return () => window.removeEventListener("custom-event", handler);
  }, []);
  return <div>{event}</div>;
}

// SHOULD FLAG: MediaQueryList addEventListener
function MediaQuery() {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return <div>{matches ? "dark" : "light"}</div>;
}
