import { useEffect, useState } from "react";

// SHOULD FLAG: fetch without any cleanup
function NoCleanup({ query }) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then((r) => r.json())
      .then(setResults);
  }, [query]);
  return <div>{results.length}</div>;
}

// SHOULD FLAG: fetch with AbortController but no return
function AbortNoReturn({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/${id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setData);
  }, [id]);
  return <div>{data}</div>;
}

// SHOULD NOT FLAG: fetch with cleanup return
function WithCleanup({ id }) {
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

// SHOULD NOT FLAG: fetch with AbortController and return
function WithAbortCleanup({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/${id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setData);
    return () => controller.abort();
  }, [id]);
  return <div>{data}</div>;
}

// SHOULD NOT FLAG: no fetch at all
function NoFetch({ count }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    setDoubled(count * 2);
  }, [count]);
  return <div>{doubled}</div>;
}

// SHOULD FLAG: async fetch without cleanup
function AsyncNoCleanup({ url }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    async function load() {
      const res = await fetch(url);
      const text = await res.text();
      setHtml(text);
    }
    load();
  }, [url]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// SHOULD NOT FLAG: empty dependency array with cleanup
function InitFetch() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig);
    return () => {};
  }, []);
  return <div>{config?.version}</div>;
}
