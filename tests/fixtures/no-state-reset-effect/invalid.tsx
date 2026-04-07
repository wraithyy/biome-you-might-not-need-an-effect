import { useState, useEffect } from "react"

function ProfilePage({ userId }) {
  const [comment, setComment] = useState("")

  useEffect(() => {
    setComment("")
  }, [userId])

  return <textarea value={comment} onChange={e => setComment(e.target.value)} />
}

function List({ items }) {
  const [selection, setSelection] = useState(null)

  useEffect(() => {
    setSelection(null)
  }, [items])

  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}

function Counter({ resetKey }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
  }, [resetKey])

  return <div>{count}</div>
}
