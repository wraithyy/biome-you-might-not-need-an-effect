import { useEffect, useState } from "react";

// SHOULD FLAG: resetting to empty string
function ResetString({ userId }) {
  const [input, setInput] = useState("");
  useEffect(() => {
    setInput("");
  }, [userId]);
  return <input value={input} onChange={(e) => setInput(e.target.value)} />;
}

// SHOULD FLAG: resetting to null
function ResetNull({ tab }) {
  const [selection, setSelection] = useState(null);
  useEffect(() => {
    setSelection(null);
  }, [tab]);
  return <div>{selection}</div>;
}

// SHOULD FLAG: resetting to 0
function ResetZero({ category }) {
  const [page, setPage] = useState(0);
  useEffect(() => {
    setPage(0);
  }, [category]);
  return <div>Page {page}</div>;
}

// SHOULD FLAG: resetting to empty array
function ResetArray({ filter }) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    setResults([]);
  }, [filter]);
  return <div>{results.length}</div>;
}

// SHOULD FLAG: resetting to false
function ResetBool({ mode }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(false);
  }, [mode]);
  return <div>{isOpen ? "open" : "closed"}</div>;
}

// SHOULD NOT FLAG: setting to a computed value (not a reset)
function ComputedValue({ items }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(items.filter((i) => i.active).length);
  }, [items]);
  return <div>{count}</div>;
}

// SHOULD NOT FLAG: fetch then reset (has fetch)
function FetchAndReset({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/${id}`).then((r) => r.json()).then(setData);
  }, [id]);
  return <div>{data}</div>;
}

// SHOULD FLAG: resetting to empty object
function ResetObject({ formType }) {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    setFormData({});
  }, [formType]);
  return <div>{JSON.stringify(formData)}</div>;
}

// SHOULD NOT FLAG: setting to undefined is fine if inside await
function AsyncReset({ id }) {
  const [val, setVal] = useState(undefined);
  useEffect(() => {
    async function go() {
      await new Promise((r) => setTimeout(r, 100));
      setVal(undefined);
    }
    go();
  }, [id]);
  return <div>{val}</div>;
}
