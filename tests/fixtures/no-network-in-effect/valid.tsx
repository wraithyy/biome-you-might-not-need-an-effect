import { useState } from "react"

function Form() {
  const [firstName, setFirstName] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    fetch("/api/register", { method: "POST", body: JSON.stringify({ firstName }) })
  }

  return <form onSubmit={handleSubmit}><input value={firstName} onChange={e => setFirstName(e.target.value)} /></form>
}
