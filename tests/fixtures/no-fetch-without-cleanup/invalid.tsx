import { useState, useEffect } from "react"

function SearchResults({ query }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(json => {
        setResults(json)
      })
  }, [query])

  return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>
}
