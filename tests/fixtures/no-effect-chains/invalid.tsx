import { useState, useEffect } from "react"

function Game() {
  const [card, setCard] = useState(null)
  const [goldCardCount, setGoldCardCount] = useState(0)
  const [round, setRound] = useState(1)
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(c => c + 1)
    }
  }, [card])

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(r => r + 1)
    }
  }, [goldCardCount])

  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true)
    }
  }, [round])

  return <div>Round: {round}</div>
}
