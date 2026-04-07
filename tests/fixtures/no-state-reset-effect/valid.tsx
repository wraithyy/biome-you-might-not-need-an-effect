import { useState } from "react"

function ProfilePage({ userId }) {
  return <Profile userId={userId} key={userId} />
}

function Profile({ userId }) {
  const [comment, setComment] = useState("")
  return <textarea value={comment} onChange={e => setComment(e.target.value)} />
}

function List({ items }) {
  const [selectedId, setSelectedId] = useState(null)
  const selection = items.find(item => item.id === selectedId) ?? null
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}
