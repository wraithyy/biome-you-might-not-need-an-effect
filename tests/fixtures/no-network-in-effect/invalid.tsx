import { useState, useEffect } from "react"

function Form() {
  const [jsonToSubmit, setJsonToSubmit] = useState(null)

  useEffect(() => {
    if (jsonToSubmit !== null) {
      fetch("/api/register", { method: "POST", body: JSON.stringify(jsonToSubmit) })
    }
  }, [jsonToSubmit])

  return <button onClick={() => setJsonToSubmit({ name: "test" })}>Submit</button>
}

function AutoSaver({ data, shouldSave }) {
  useEffect(() => {
    if (shouldSave) {
      axios.post("/api/save", data)
    }
  }, [data, shouldSave])

  return <div>Saving...</div>
}
