import { useEffect, useState } from "react";

// SHOULD FLAG: WebSocket onmessage assignment
function WebSocketComponent({ url }) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };
    return () => ws.close();
  }, [url]);
  return <ul>{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>;
}

// SHOULD FLAG: EventSource onerror assignment
function SSEComponent({ url }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const source = new EventSource(url);
    source.onmessage = (e) => setData(e.data);
    source.onerror = () => source.close();
    return () => source.close();
  }, [url]);
  return <div>{data}</div>;
}
