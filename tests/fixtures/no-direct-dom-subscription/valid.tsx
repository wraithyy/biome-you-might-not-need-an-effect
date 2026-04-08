import { useEffect, useState } from "react";

// SHOULD NOT FLAG: no .on* assignment, just regular fetch
export function FetchComponent({ url }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(url).then(r => r.json()).then(d => { if (!ignore) setData(d); });
    return () => { ignore = true; };
  }, [url]);
  return <div>{JSON.stringify(data)}</div>;
}

// SHOULD NOT FLAG: regular state effect with no .on* pattern
export function TitleComponent({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <div>{title}</div>;
}
