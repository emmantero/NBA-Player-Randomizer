import { createElement, useEffect, useRef, useState } from 'react'
import './App.css'
import GameSetup from './GameSetup.jsx'
import RosterPage from './RosterPage.jsx'

const rows = ['top', 'bottom']
const rosterPositions = ['PG', 'SG', 'SF', 'PF', 'C', '6TH']
const positionSlotPreferences = {
  G: ['PG', 'SG'],
  'G-F': ['PG', 'SG', 'SF', 'PF'],
  F: ['SF', 'PF'],
  'F-G': ['SF', 'PF', 'SG', 'PG'],
  C: ['C'],
  'C-F': ['C', 'PF', 'SF'],
  'F-C': ['PF', 'SF', 'C'],
}
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

function createEmptyRoster() {
  return Object.fromEntries(rosterPositions.map((position) => [position, null]))
}

function getDraftSlot(player, roster) {
  const eligibleSlots = positionSlotPreferences[player.position] ?? ['PG', 'SG', 'SF', 'PF', 'C']
  const primarySlot = eligibleSlots.find((slot) => !roster[slot])

  return primarySlot ?? (!roster['6TH'] ? '6TH' : null)
}

function createPlayerOneDrawManager() {
  const usedIds = new Set()
  const displayedIds = new Map()

  return {
    reset() {
      usedIds.clear()
      displayedIds.clear()
    },
    resetRow(row) {
      displayedIds.delete(row)
    },
    draw(players, row) {
      const otherDisplayedIds = new Set(
        [...displayedIds.entries()]
          .filter(([displayedRow]) => displayedRow !== row)
          .map(([, playerId]) => playerId),
      )

      let availablePlayers = players.filter(
        (player) => !usedIds.has(player.id) && !otherDisplayedIds.has(player.id),
      )

      if (availablePlayers.length === 0) {
        usedIds.clear()
        otherDisplayedIds.forEach((playerId) => usedIds.add(playerId))
        availablePlayers = players.filter((player) => !otherDisplayedIds.has(player.id))
      }

      const player = getRandomItem(availablePlayers)
      if (player) {
        usedIds.add(player.id)
        displayedIds.set(row, player.id)
      }
      return player
    },
  }
}

function RandomizerCard({
  title,
  placeholder,
  items = [],
  type = 'text',
  getFinalItem,
  onSpinStart,
  onSelectionChange,
}) {
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

    onSpinStart?.()
    setIsSpinning(true)
    setSelectedItem(getRandomItem(items))

    intervalRef.current = setInterval(() => {
      setSelectedItem(getRandomItem(items))
    }, SPIN_TICK)

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      const finalItem = getFinalItem ? getFinalItem() : getRandomItem(items)
      setSelectedItem(finalItem)
      onSelectionChange?.(finalItem)
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
  const [gameSetup, setGameSetup] = useState(null)
  const [activePage, setActivePage] = useState('slots')
  const [players, setPlayers] = useState([])
  const [rosters, setRosters] = useState([])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [resetSignals, setResetSignals] = useState({ top: 0, bottom: 0 })
  const [rowSelections, setRowSelections] = useState({
    top: { playerOne: null, playerTwo: null, attribute: null },
    bottom: { playerOne: null, playerTwo: null, attribute: null },
  })
  const [playerOneDrawManager] = useState(createPlayerOneDrawManager)

  useEffect(() => {
    fetch('/data/players.json')
      .then((response) => response.json())
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [])

  function handleResetRow(row) {
    playerOneDrawManager.resetRow(row)
    setRowSelections((currentSelections) => ({
      ...currentSelections,
      [row]: { playerOne: null, playerTwo: null, attribute: null },
    }))
    setResetSignals((currentSignals) => ({
      ...currentSignals,
      [row]: currentSignals[row] + 1,
    }))
  }

  function resetAllRows() {
    playerOneDrawManager.resetRow('top')
    playerOneDrawManager.resetRow('bottom')
    setRowSelections({
      top: { playerOne: null, playerTwo: null, attribute: null },
      bottom: { playerOne: null, playerTwo: null, attribute: null },
    })
    setResetSignals((currentSignals) => ({
      top: currentSignals.top + 1,
      bottom: currentSignals.bottom + 1,
    }))
  }

  function getUniquePlayerOne(row) {
    return playerOneDrawManager.draw(players, row)
  }

  function updateRowSelection(row, field, value) {
    setRowSelections((currentSelections) => ({
      ...currentSelections,
      [row]: {
        ...currentSelections[row],
        [field]: value,
      },
    }))
  }

  function isRowComplete(row) {
    const selection = rowSelections[row]
    return Boolean(selection.playerOne && selection.playerTwo && selection.attribute)
  }

  function startGame(setup) {
    const playerNames = setup.playerNames.map((name, index) => name || `Player ${index + 1}`)

    playerOneDrawManager.reset()
    setGameSetup({ ...setup, playerNames })
    setRosters(Array.from({ length: setup.playerCount }, createEmptyRoster))
    setCurrentTurn(0)
    setActivePage('slots')
    setRowSelections({
      top: { playerOne: null, playerTwo: null, attribute: null },
      bottom: { playerOne: null, playerTwo: null, attribute: null },
    })
    setResetSignals((currentSignals) => ({
      top: currentSignals.top + 1,
      bottom: currentSignals.bottom + 1,
    }))
  }

  const isDraftComplete =
    rosters.length > 0 && rosters.every((roster) => Object.values(roster).every(Boolean))

  function draftSelection(row) {
    if (!isRowComplete(row) || isDraftComplete) {
      return
    }

    const selection = rowSelections[row]
    const draftSlot = getDraftSlot(selection.playerOne, rosters[currentTurn])

    if (!draftSlot) {
      return
    }

    setRosters((currentRosters) =>
      currentRosters.map((roster, playerIndex) =>
        playerIndex === currentTurn ? { ...roster, [draftSlot]: selection } : roster,
      ),
    )
    setCurrentTurn((turn) => (turn + 1) % gameSetup.playerCount)
    resetAllRows()
  }

  function moveRosterPick(teamIndex, sourcePosition, targetPosition) {
    if (sourcePosition === targetPosition) {
      return
    }

    setRosters((currentRosters) =>
      currentRosters.map((roster, playerIndex) => {
        if (playerIndex !== teamIndex || !roster[sourcePosition]) {
          return roster
        }

        return {
          ...roster,
          [sourcePosition]: roster[targetPosition],
          [targetPosition]: roster[sourcePosition],
        }
      }),
    )
  }

  if (!gameSetup) {
    return createElement(GameSetup, { onStart: startGame })
  }

  function changeSetup() {
    setActivePage('slots')
    setGameSetup(null)
  }

  return (
    <main className="app-shell">
      <header className="admin-header">
        <div className="admin-brand">
          <strong>NBA Player Randomizer</strong>
          <span>
            {gameSetup.mode === 'solo'
              ? 'Solo game'
              : `${gameSetup.playerCount}-player game`}
          </span>
        </div>

        <nav className="page-switcher" aria-label="Game pages">
          <button
            className={activePage === 'slots' ? 'is-active' : ''}
            type="button"
            aria-current={activePage === 'slots' ? 'page' : undefined}
            onClick={() => setActivePage('slots')}
          >
            Slot Machine
          </button>
          <button
            className={activePage === 'rosters' ? 'is-active' : ''}
            type="button"
            aria-current={activePage === 'rosters' ? 'page' : undefined}
            onClick={() => setActivePage('rosters')}
          >
            Rosters
          </button>
        </nav>

        <div className="game-session-summary">
          <button type="button" onClick={changeSetup}>
            Change setup
          </button>
        </div>
      </header>

      {activePage === 'slots' ? (
        <section className="slot-machine-page" aria-labelledby="slot-machine-title">
          <header className="page-header">
            <h1 id="slot-machine-title">NBA Player Randomizer</h1>
            <p>Build the Ultimate Player</p>
          </header>

          <section className="draft-status" aria-live="polite">
            {isDraftComplete ? (
              <>
                <span className="draft-status-label">Draft complete</span>
                <strong>Every roster is full.</strong>
              </>
            ) : (
              <>
                <span className="draft-status-label">On the clock</span>
                <strong>{gameSetup.playerNames[currentTurn]}</strong>
                <span>is selecting.</span>
              </>
            )}
          </section>

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
                    getFinalItem: () => getUniquePlayerOne(row),
                    onSpinStart: () => updateRowSelection(row, 'playerOne', null),
                    onSelectionChange: (player) => updateRowSelection(row, 'playerOne', player),
                  })}
                  <span className="connector">With</span>
                  {createElement(RandomizerCard, {
                    key: `${row}-player-two-${resetSignals[row]}`,
                    title: 'Player 2',
                    placeholder: 'Press Spin',
                    items: players,
                    type: 'player',
                    onSpinStart: () => updateRowSelection(row, 'playerTwo', null),
                    onSelectionChange: (player) => updateRowSelection(row, 'playerTwo', player),
                  })}
                  <span className="connector">'s</span>
                  {createElement(RandomizerCard, {
                    key: `${row}-attribute-${resetSignals[row]}`,
                    title: 'Attribute',
                    placeholder: '-',
                    items: attributes,
                    type: 'attribute',
                    onSpinStart: () => updateRowSelection(row, 'attribute', null),
                    onSelectionChange: (attribute) =>
                      updateRowSelection(row, 'attribute', attribute),
                  })}
                  <div className="row-actions">
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
                    <button
                      className="row-confirm-button"
                      type="button"
                      disabled={
                        !isRowComplete(row) ||
                        isDraftComplete ||
                        !getDraftSlot(rowSelections[row].playerOne, rosters[currentTurn])
                      }
                      aria-label={`Draft ${row} hypothetical player for ${gameSetup.playerNames[currentTurn]}`}
                      title={
                        isDraftComplete
                          ? 'Draft complete'
                          : isRowComplete(row)
                            ? getDraftSlot(rowSelections[row].playerOne, rosters[currentTurn])
                              ? `Draft ${rowSelections[row].playerOne.name} as ${getDraftSlot(rowSelections[row].playerOne, rosters[currentTurn])} for ${gameSetup.playerNames[currentTurn]}`
                              : `${gameSetup.playerNames[currentTurn]}'s compatible roster slots are full`
                            : 'Spin all three cards first'
                      }
                      onClick={() => draftSelection(row)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </section>
      ) : (
        createElement(RosterPage, {
          playerNames: gameSetup.playerNames,
          rosters,
          currentTurn,
          onMovePlayer: moveRosterPick,
        })
      )}
    </main>
  )
}

export default App
