import { useEffect, useState } from "react";

// SHOULD FLAG: setInterval without cleanup
function PollingComponent({ url }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const id = setInterval(() => {
      fetch(url).then(r => r.json()).then(setData);
    }, 5000);
  }, [url]);
  return <div>{JSON.stringify(data)}</div>;
}

// SHOULD FLAG: setTimeout without cleanup
function DelayedComponent({ value }) {
  const [delayed, setDelayed] = useState(value);
  useEffect(() => {
    setTimeout(() => {
      setDelayed(value);
    }, 300);
  }, [value]);
  return <div>{delayed}</div>;
}
