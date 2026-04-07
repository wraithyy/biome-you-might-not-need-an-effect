import { useState, useEffect } from "react"

function SearchResults({ query }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    let ignore = false
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(json => {
        if (!ignore) {
          setResults(json)
        }
      })
    return () => {
      ignore = true
    }
  }, [query])

  return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>
}
