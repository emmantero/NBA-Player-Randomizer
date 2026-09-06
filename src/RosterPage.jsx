import { useState } from 'react'
import './RosterPage.css'

const rosterPositions = ['PG', 'SG', 'SF', 'PF', 'C', '6TH']

function getTeamName(playerName) {
  const possessive = playerName.toLowerCase().endsWith('s') ? "'" : "'s"
  return `${playerName}${possessive} Team`
}

function RosterPage({ playerNames, rosters, currentTurn, onMovePlayer }) {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const players = playerNames.map((name, index) => ({
    id: index,
    teamName: getTeamName(name),
  }))
  const totalPicks = rosters.reduce(
    (total, roster) => total + Object.values(roster).filter(Boolean).length,
    0,
  )
  const totalSlots = players.length * rosterPositions.length
  const isDraftComplete = totalPicks === totalSlots
  const selectedPick = selectedSlot
    ? rosters[selectedSlot.teamIndex][selectedSlot.position]
    : null

  function handleSlotClick(teamIndex, position) {
    const pick = rosters[teamIndex][position]

    if (!selectedSlot) {
      if (pick) {
        setSelectedSlot({ teamIndex, position })
      }
      return
    }

    if (selectedSlot.teamIndex !== teamIndex) {
      return
    }

    if (selectedSlot.position === position) {
      setSelectedSlot(null)
      return
    }

    onMovePlayer(teamIndex, selectedSlot.position, position)
    setSelectedSlot(null)
  }

  return (
    <section className="roster-page" aria-labelledby="roster-title">
      <div className="roster-heading">
        <p>{isDraftComplete ? 'Draft Complete' : `Pick ${totalPicks + 1} of ${totalSlots}`}</p>
        <h1 id="roster-title">Build Your Teams</h1>
        <span>
          {selectedPick
            ? `Move ${selectedPick.playerOne.name} from ${selectedSlot.position} to an open or occupied slot on the same team.`
            : isDraftComplete
              ? 'Every team has filled its roster. Select a player to rearrange a roster.'
              : `${playerNames[currentTurn]} is on the clock. Select a drafted player to rearrange a roster.`}
        </span>
      </div>

      <div className="roster-scroll" tabIndex="0" aria-label="Player roster table">
        <div
          className="roster-grid"
          style={{ '--roster-columns': players.length }}
        >
          <div className="roster-corner" aria-hidden="true" />
          {players.map((player) => (
            <div
              className={`roster-player-heading${player.id === currentTurn && !isDraftComplete ? ' is-on-clock' : ''}`}
              key={player.id}
            >
              {player.teamName}
            </div>
          ))}

          {rosterPositions.map((position) => (
            <div className="roster-row" key={position}>
              <div className="roster-position">{position}</div>
              {players.map((player) => {
                const pick = rosters[player.id][position]
                const isSelected =
                  selectedSlot?.teamIndex === player.id && selectedSlot.position === position
                const isMoveTarget = selectedSlot?.teamIndex === player.id && !isSelected
                const isOtherTeam = selectedSlot && selectedSlot.teamIndex !== player.id
                const canClick = Boolean(pick) || isMoveTarget
                const actionLabel = isSelected
                  ? `Cancel moving ${pick.playerOne.name} from ${position}`
                  : isMoveTarget
                    ? `Move ${selectedPick.playerOne.name} from ${selectedSlot.position} to ${position}${pick ? `, swapping with ${pick.playerOne.name}` : ''}`
                    : pick
                      ? `Select ${pick.playerOne.name} in ${position} to move`
                      : `${position} is available`

                return (
                  <div
                    className={`roster-slot${isSelected ? ' is-selected' : ''}${isMoveTarget ? ' is-move-target' : ''}`}
                    key={`${player.id}-${position}`}
                  >
                    <button
                      className="roster-slot-button"
                      type="button"
                      disabled={!canClick || isOtherTeam}
                      aria-pressed={isSelected || undefined}
                      aria-label={actionLabel}
                      onClick={() => handleSlotClick(player.id, position)}
                    >
                      {pick ? (
                        <div className="roster-pick">
                          <img src={pick.playerOne.thumbnail} alt="" />
                          <div>
                            <strong>{pick.playerOne.name}</strong>
                            <span>{pick.playerTwo.name}'s {pick.attribute}</span>
                          </div>
                        </div>
                      ) : (
                        <span>Available</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RosterPage
