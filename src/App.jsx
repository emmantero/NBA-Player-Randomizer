import { createElement } from 'react'
import './App.css'

const rows = ['top', 'bottom']

function RandomizerCard({ title, placeholder }) {
  return (
    <article className="randomizer-card">
      <h2>{title}</h2>
      <div className="card-display">
        <span>{placeholder}</span>
      </div>
      <button type="button">Spin</button>
    </article>
  )
}

function App() {
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
            })}
            <span className="connector">With</span>
            {createElement(RandomizerCard, {
              title: 'Player 2',
              placeholder: 'Press Spin',
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
