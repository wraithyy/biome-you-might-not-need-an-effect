import { useState, useEffect } from "react"

function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    function handleOnline() { setIsOnline(true) }
    function handleOffline() { setIsOnline(false) }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return <div>{isOnline ? "Online" : "Offline"}</div>
}

function StoreWatcher({ store }) {
  const [value, setValue] = useState(store.get())

  useEffect(() => {
    const unsubscribe = store.subscribe(setValue)
    return () => unsubscribe()
  }, [store])

  return <div>{value}</div>
}
