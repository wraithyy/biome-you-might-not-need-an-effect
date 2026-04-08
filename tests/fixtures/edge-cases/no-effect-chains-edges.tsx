import { useEffect, useState } from "react";

// SHOULD FLAG: classic chain pattern
function ChainA({ items }) {
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  useEffect(() => {
    if (selected) {
      setDetails(items.find((i) => i.id === selected));
    }
  }, [selected]);
  return <div>{details?.name}</div>;
}

// SHOULD FLAG: chain with multiple conditions
function ChainB({ mode }) {
  const [step, setStep] = useState(0);
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (step === 0) {
      setLabel("Start");
    } else if (step > 3) {
      setLabel("Done");
    }
  }, [step]);
  return <div>{label}</div>;
}

// SHOULD NOT FLAG: has fetch (legitimate async)
function NotChainFetch({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (id) {
      fetch(`/api/${id}`)
        .then((r) => r.json())
        .then(setData);
    }
    return () => {};
  }, [id]);
  return <div>{data?.name}</div>;
}

// SHOULD NOT FLAG: has cleanup return
function WithCleanup({ visible }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (visible) {
      const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
      window.addEventListener("mousemove", handler);
      return () => window.removeEventListener("mousemove", handler);
    }
    return () => {};
  }, [visible]);
  return <div>{pos.x},{pos.y}</div>;
}

// SHOULD NOT FLAG: no conditional setState
function UnconditionalSet({ value }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    setDoubled(value * 2);
  }, [value]);
  return <div>{doubled}</div>;
}

// SHOULD FLAG: chain with ternary-like if
function ChainC({ score }) {
  const [grade, setGrade] = useState("F");
  useEffect(() => {
    if (score >= 90) {
      setGrade("A");
    }
  }, [score]);
  return <div>{grade}</div>;
}

// SHOULD NOT FLAG: has await (async operation)
function AsyncChain({ userId }) {
  const [name, setName] = useState("");
  useEffect(() => {
    if (userId) {
      const load = async () => {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        setName(data.name);
      };
      load();
    }
  }, [userId]);
  return <div>{name}</div>;
}
