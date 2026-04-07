import { useState, useEffect } from "react"

function Form() {
  const [firstName, setFirstName] = useState("Taylor")
  const [lastName, setLastName] = useState("Swift")
  const [fullName, setFullName] = useState("")

  useEffect(() => {
    setFullName(firstName + " " + lastName)
  }, [firstName, lastName])

  return <div>{fullName}</div>
}

function TodoList({ todos, filter }) {
  const [visibleTodos, setVisibleTodos] = useState([])

  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter))
  }, [todos, filter])

  return <ul>{visibleTodos.map(t => <li key={t.id}>{t.text}</li>)}</ul>
}
