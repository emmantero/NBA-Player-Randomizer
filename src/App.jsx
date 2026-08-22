import { createElement, useEffect, useRef, useState } from 'react'
import './App.css'

const rows = ['top', 'bottom']
const SPIN_DURATION = 2200
const SPIN_TICK = 10

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function RandomizerCard({ title, placeholder, players = [], canSpin = false }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleSpin() {
    if (!canSpin || isSpinning || players.length === 0) {
      return
    }

    setIsSpinning(true)
    setSelectedPlayer(getRandomItem(players))

    intervalRef.current = setInterval(() => {
      setSelectedPlayer(getRandomItem(players))
    }, SPIN_TICK)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      setSelectedPlayer(getRandomItem(players))
      setIsSpinning(false)
    }, SPIN_DURATION)
  }

  return (
    <article className="randomizer-card">
      <h2>{title}</h2>
      <div className={`card-display${isSpinning ? ' is-spinning' : ''}`}>
        {selectedPlayer ? (
          <div className="player-result">
            <img src={selectedPlayer.thumbnail} alt={selectedPlayer.name} />
            <span>{selectedPlayer.name}</span>
          </div>
        ) : (
          <span>{placeholder}</span>
        )}
      </div>
      <button type="button" onClick={handleSpin} disabled={!canSpin || isSpinning}>
        {isSpinning ? 'Spinning' : 'Spin'}
      </button>
    </article>
  )
}

function App() {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    fetch('/data/players.json')
      .then((response) => response.json())
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [])

  return (
    <main className="app-shell">
      <header className="page-header">
        <h1>NBA Player Randomizer</h1>
        <p>Build the Ultimate Player</p>
      </header>

      <section className="randomizer-board" aria-label="NBA player randomizer">
        {rows.map((row) => (
          <div className="randomizer-row" key={row}>
            {createElement(RandomizerCard, {
              title: 'Player 1',
              placeholder: 'Press Spin',
              players,
              canSpin: true,
            })}
            <span className="connector">With</span>
            {createElement(RandomizerCard, {
              title: 'Player 2',
              placeholder: 'Press Spin',
              players,
              canSpin: true,
            })}
            <span className="connector">'s</span>
            {createElement(RandomizerCard, {
              title: 'Attribute',
              placeholder: '-',
            })}
          </div>
        ))}
      </section>
    </main>
  )
}

export default App
