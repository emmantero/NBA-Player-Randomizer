# NBA Player Randomizer

NBA Player Randomizer is a personal project by Emman Tero built using ReactJS.

This project is about combining an actual NBA player with another NBA player and that player's attribute or skillset. The app randomizes a base player, a second player, and a selected attribute to create fun player combinations.

Inspired by an episode of "The Deep 3" podcast. Big shoutout to them: https://www.youtube.com/watch?v=D68e1HTN6hA

## Local Development

Install the project dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Open the local URL shown in the terminal. By default, Vite usually runs at:

```bash
http://localhost:5173/
```

## Player Data

Current NBA player data is generated with a small Python script using [`nba_api`](https://github.com/swar/nba_api). This is the library used to generate the `public/data/players.json` file, which includes each player's name, NBA ID, full-size headshot URL, and thumbnail URL.

Install the Python dependency:

```bash
python3 -m pip install -r requirements.txt
```

Regenerate the player data:

```bash
npm run players:generate
```
