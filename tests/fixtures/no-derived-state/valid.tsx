import { useState, useEffect, useMemo } from "react"

function Form() {
  const [firstName, setFirstName] = useState("Taylor")
  const [lastName, setLastName] = useState("Swift")
  const fullName = firstName + " " + lastName
  return <div>{fullName}</div>
}

function TodoList({ todos, filter }) {
  const visibleTodos = useMemo(() => getFilteredTodos(todos, filter), [todos, filter])
  return <ul>{visibleTodos.map(t => <li key={t.id}>{t.text}</li>)}</ul>
}

function DataLoader({ id }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let ignore = false
    fetch(`/api/${id}`).then(r => r.json()).then(d => { if (!ignore) setData(d) })
    return () => { ignore = true }
  }, [id])
  return <div>{JSON.stringify(data)}</div>
}
