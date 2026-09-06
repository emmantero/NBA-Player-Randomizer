import { useState } from 'react'
import './GameSetup.css'

const MIN_MULTIPLAYER_PLAYERS = 2
const MAX_MULTIPLAYER_PLAYERS = 5

function GameSetup({ onStart }) {
  const [mode, setMode] = useState(null)
  const [playerCount, setPlayerCount] = useState(MIN_MULTIPLAYER_PLAYERS)
  const [playerNames, setPlayerNames] = useState(Array(MAX_MULTIPLAYER_PLAYERS).fill(''))

  const visiblePlayerCount = mode === 'solo' ? 1 : playerCount

  function updatePlayerName(index, name) {
    setPlayerNames((currentNames) =>
      currentNames.map((currentName, currentIndex) =>
        currentIndex === index ? name : currentName,
      ),
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    const numberOfPlayers =
      mode === 'solo'
        ? 1
        : Math.min(
            MAX_MULTIPLAYER_PLAYERS,
            Math.max(MIN_MULTIPLAYER_PLAYERS, Number(playerCount)),
          )

    onStart({
      mode,
      playerCount: numberOfPlayers,
      playerNames: playerNames.slice(0, numberOfPlayers).map((name) => name.trim()),
    })
  }

  return (
    <main className="setup-page">
      <section className="setup-panel" aria-labelledby="setup-title">
        <p className="setup-eyebrow">NBA Player Randomizer</p>
        <h1 id="setup-title">How are you playing?</h1>
        <p className="setup-intro">
          Play by yourself or set up a game for everyone watching the same screen.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mode-options" role="group" aria-label="Choose game mode">
            <button
              className={`mode-option${mode === 'solo' ? ' is-selected' : ''}`}
              type="button"
              aria-pressed={mode === 'solo'}
              onClick={() => setMode('solo')}
            >
              <span className="mode-icon" aria-hidden="true">1</span>
              <span>
                <strong>Solo</strong>
                <small>Play on your own</small>
              </span>
            </button>

            <button
              className={`mode-option${mode === 'multiplayer' ? ' is-selected' : ''}`}
              type="button"
              aria-pressed={mode === 'multiplayer'}
              onClick={() => setMode('multiplayer')}
            >
              <span className="mode-icon" aria-hidden="true">2+</span>
              <span>
                <strong>Multiplayer</strong>
                <small>Play together on one screen</small>
              </span>
            </button>
          </div>

          {mode === 'multiplayer' && (
            <div className="player-count-field">
              <label htmlFor="player-count">How many players?</label>
              <div className="count-control">
                <button
                  type="button"
                  aria-label="Remove one player"
                  disabled={playerCount <= MIN_MULTIPLAYER_PLAYERS}
                  onClick={() => setPlayerCount((count) => Math.max(MIN_MULTIPLAYER_PLAYERS, count - 1))}
                >
                  −
                </button>
                <input
                  id="player-count"
                  type="number"
                  min={MIN_MULTIPLAYER_PLAYERS}
                  max={MAX_MULTIPLAYER_PLAYERS}
                  value={playerCount}
                  onChange={(event) => setPlayerCount(Number(event.target.value))}
                  required
                />
                <button
                  type="button"
                  aria-label="Add one player"
                  disabled={playerCount >= MAX_MULTIPLAYER_PLAYERS}
                  onClick={() => setPlayerCount((count) => Math.min(MAX_MULTIPLAYER_PLAYERS, count + 1))}
                >
                  +
                </button>
              </div>
              <small>Choose between {MIN_MULTIPLAYER_PLAYERS} and {MAX_MULTIPLAYER_PLAYERS} players.</small>
            </div>
          )}

          {mode && (
            <section className="player-names-field" aria-labelledby="player-names-title">
              <h2 className="player-names-title" id="player-names-title">
                {mode === 'solo' ? 'What is your name?' : 'Who is playing?'}
              </h2>
              <div className="player-name-inputs">
                {Array.from({ length: visiblePlayerCount }, (_, index) => (
                  <label key={index}>
                    <input
                      type="text"
                      value={playerNames[index]}
                      maxLength="24"
                      aria-label={`Player ${index + 1} name`}
                      placeholder={`Player ${index + 1} name`}
                      autoComplete="off"
                      onChange={(event) => updatePlayerName(index, event.target.value)}
                      required
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          <button className="start-game-button" type="submit" disabled={!mode}>
            Continue
          </button>
        </form>
      </section>
    </main>
  )
}

export default GameSetup
