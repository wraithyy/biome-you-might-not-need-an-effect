import { useEffect, useState } from "react";

// SHOULD NOT FLAG: setInterval with cleanup
function PollingComponent({ url }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const id = setInterval(() => {
      fetch(url).then(r => r.json()).then(setData);
    }, 5000);
    return () => clearInterval(id);
  }, [url]);
  return <div>{JSON.stringify(data)}</div>;
}

// SHOULD NOT FLAG: setTimeout with cleanup
function DebounceComponent({ value }) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), 300);
    return () => clearTimeout(id);
  }, [value]);
  return <div>{debounced}</div>;
}
