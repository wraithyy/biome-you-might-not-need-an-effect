import { useState } from "react"

function Game() {
  const [card, setCard] = useState(null)
  const [goldCardCount, setGoldCardCount] = useState(0)
  const [round, setRound] = useState(1)
  const isGameOver = round > 5

  function handlePlaceCard(nextCard) {
    if (isGameOver) throw Error("Game already ended.")
    setCard(nextCard)
    if (nextCard.gold) {
      if (goldCardCount < 3) {
        setGoldCardCount(goldCardCount + 1)
      } else {
        setGoldCardCount(0)
        setRound(round + 1)
      }
    }
  }

  return <div>Round: {round}</div>
}
