import { useState } from "react"

function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false)

  function updateToggle(nextIsOn) {
    setIsOn(nextIsOn)
    onChange(nextIsOn)
  }

  function handleClick() {
    updateToggle(!isOn)
  }

  return <button onClick={handleClick}>{isOn ? "On" : "Off"}</button>
}

function ControlledToggle({ isOn, onChange }) {
  function handleClick() {
    onChange(!isOn)
  }

  return <button onClick={handleClick}>{isOn ? "On" : "Off"}</button>
}
