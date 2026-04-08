import { useEffect, useState } from "react";

// SHOULD FLAG: onChange called in effect
function CallbackInEffect({ value, onChange }) {
  const [internal, setInternal] = useState(value);
  useEffect(() => {
    onChange(internal);
  }, [internal, onChange]);
  return <input value={internal} onChange={(e) => setInternal(e.target.value)} />;
}

// SHOULD FLAG: onUpdate callback in effect
function OnUpdateEffect({ data, onUpdate }) {
  const [processed, setProcessed] = useState(null);
  useEffect(() => {
    const result = data.map((d) => d * 2);
    setProcessed(result);
    onUpdate(result);
  }, [data, onUpdate]);
  return <div>{processed?.length}</div>;
}

// SHOULD NOT FLAG: callback in event handler (correct)
function CallbackInHandler({ onChange }) {
  const [value, setValue] = useState("");
  const handleChange = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };
  return <input value={value} onChange={handleChange} />;
}

// SHOULD NOT FLAG: no onX pattern in deps
function NoCallbackDep({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    setData(id);
  }, [id]);
  return <div>{data}</div>;
}

// SHOULD FLAG: onSelect callback
function OnSelectEffect({ items, onSelect }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (selected) {
      onSelect(selected);
    }
  }, [selected, onSelect]);
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => setSelected(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// SHOULD NOT FLAG: effect without onX in body or deps
function PlainEffect({ count }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    setDoubled(count * 2);
  }, [count]);
  return <div>{doubled}</div>;
}

// SHOULD NOT FLAG: onX in body but NOT in deps
function CallbackNotInDeps({ onChange }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    onChange(value);
  }, [value]);
  return <div>{value}</div>;
}
