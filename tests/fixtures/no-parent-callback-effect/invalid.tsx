import { useState, useEffect } from "react"

function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false)

  useEffect(() => {
    onChange(isOn)
  }, [isOn, onChange])

  function handleClick() {
    setIsOn(!isOn)
  }

  return <button onClick={handleClick}>{isOn ? "On" : "Off"}</button>
}

function Slider({ onValueChange }) {
  const [value, setValue] = useState(50)

  useEffect(() => {
    onValueChange(value)
  }, [value, onValueChange])

  return <input type="range" value={value} onChange={e => setValue(Number(e.target.value))} />
}
