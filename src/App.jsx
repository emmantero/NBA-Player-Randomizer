import { createElement, useEffect, useRef, useState } from 'react'
import './App.css'

const rows = ['top', 'bottom']
const SPIN_DURATION = 2200
const SPIN_TICK = 10
const attributes = [
  'Shooting',
  'Body',
  'Defense',
  'Clutch',
  'Playmaking',
  'Scoring',
  'Finishing',
  'Handles',
  'Dunking',
  'Speed',
]

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function RandomizerCard({ title, placeholder, items = [], type = 'text' }) {
  const [selectedItem, setSelectedItem] = useState(null)
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
    if (isSpinning || items.length === 0) {
      return
    }

    setIsSpinning(true)
    setSelectedItem(getRandomItem(items))

    intervalRef.current = setInterval(() => {
      setSelectedItem(getRandomItem(items))
    }, SPIN_TICK)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      setSelectedItem(getRandomItem(items))
      setIsSpinning(false)
    }, SPIN_DURATION)
  }

  return (
    <article className="randomizer-card">
      <h2>{title}</h2>
      <div className={`card-display${isSpinning ? ' is-spinning' : ''}`}>
        {selectedItem ? (
          <div className={`slot-result ${type}-result`}>
            {type === 'player' && (
              <img src={selectedItem.thumbnail} alt={selectedItem.name} />
            )}
            <span>{type === 'player' ? selectedItem.name : selectedItem}</span>
          </div>
        ) : (
          <span>{placeholder}</span>
        )}
      </div>
      <button type="button" onClick={handleSpin} disabled={items.length === 0 || isSpinning}>
        {isSpinning ? 'Spinning' : 'Spin'}
      </button>
    </article>
  )
}

function App() {
  const [players, setPlayers] = useState([])
  const [resetSignals, setResetSignals] = useState({ top: 0, bottom: 0 })

  useEffect(() => {
    fetch('/data/players.json')
      .then((response) => response.json())
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [])

  function handleResetRow(row) {
    setResetSignals((currentSignals) => ({
      ...currentSignals,
      [row]: currentSignals[row] + 1,
    }))
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <h1>NBA Player Randomizer</h1>
        <p>Build the Ultimate Player</p>
      </header>

      <section className="randomizer-board" aria-label="NBA player randomizer">
        {rows.map((row) => (
          <div className="row-group" key={row}>
            <div className="randomizer-row">
              {createElement(RandomizerCard, {
                key: `${row}-player-one-${resetSignals[row]}`,
                title: 'Player 1',
                placeholder: 'Press Spin',
                items: players,
                type: 'player',
              })}
              <span className="connector">With</span>
              {createElement(RandomizerCard, {
                key: `${row}-player-two-${resetSignals[row]}`,
                title: 'Player 2',
                placeholder: 'Press Spin',
                items: players,
                type: 'player',
              })}
              <span className="connector">'s</span>
              {createElement(RandomizerCard, {
                key: `${row}-attribute-${resetSignals[row]}`,
                title: 'Attribute',
                placeholder: '-',
                items: attributes,
                type: 'attribute',
              })}
              <button
                className="row-refresh-button"
                type="button"
                onClick={() => handleResetRow(row)}
                aria-label={`Reset ${row} row`}
                title="Reset row"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                  <path d="M20 12a8 8 0 1 1-2.34-5.66" />
                  <path d="M20 4v6h-6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

export default App
