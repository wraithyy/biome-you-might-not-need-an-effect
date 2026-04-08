import { useEffect, useState } from "react";
import axios from "axios";

// SHOULD FLAG: POST triggered by state change with if
function SubmitOnState({ formData }) {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (formData) {
      fetch("/api/submit", { method: "POST", body: JSON.stringify(formData) });
    }
  }, [formData]);
  return <div>{submitted ? "sent" : "pending"}</div>;
}

// SHOULD FLAG: axios.post with condition
function AxiosPost({ shouldSave, data }) {
  useEffect(() => {
    if (shouldSave) {
      axios.post("/api/save", data);
    }
  }, [shouldSave, data]);
  return null;
}

// SHOULD FLAG: axios.delete with condition
function AxiosDelete({ itemToDelete }) {
  useEffect(() => {
    if (itemToDelete) {
      axios.delete(`/api/items/${itemToDelete}`);
    }
  }, [itemToDelete]);
  return null;
}

// SHOULD NOT FLAG: fetch for data loading (GET, no if condition)
function DataLoading({ id }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((r) => r.json())
      .then(setData);
    return () => {};
  }, [id]);
  return <div>{data?.name}</div>;
}

// SHOULD NOT FLAG: fetch in event handler (not in useEffect)
function EventHandlerFetch() {
  const handleClick = () => {
    fetch("/api/action", { method: "POST" });
  };
  return <button onClick={handleClick}>Go</button>;
}

// SHOULD NOT FLAG: no network call at all
function PureEffect({ value }) {
  const [doubled, setDoubled] = useState(0);
  useEffect(() => {
    if (value > 0) {
      setDoubled(value * 2);
    }
  }, [value]);
  return <div>{doubled}</div>;
}

// SHOULD FLAG: axios.put with condition
function AxiosPut({ profile, shouldUpdate }) {
  useEffect(() => {
    if (shouldUpdate) {
      axios.put("/api/profile", profile);
    }
  }, [shouldUpdate, profile]);
  return null;
}

// SHOULD FLAG: axios.patch with ternary-like condition
function AxiosPatch({ settings, changed }) {
  useEffect(() => {
    if (changed) {
      axios.patch("/api/settings", settings);
    }
  }, [changed, settings]);
  return null;
}
