# NBA Player Randomizer

NBA Player Randomizer is a personal project by Emman Tero built using ReactJS.

This project is about combining an actual NBA player with another NBA player and that player's attribute or skillset. The app randomizes a base player, a second player, and a selected attribute to create fun player combinations.

Inspired by an episode of "The Deep 3" podcast. Big shoutout to them: https://www.youtube.com/watch?v=D68e1HTN6hA

## Player Data

Current NBA player data is generated with a small Python script using `nba_api`. The generated file is saved to `public/data/players.json` and includes each player's name, NBA ID, full-size headshot URL, and thumbnail URL.

Install the Python dependency:

```bash
python3 -m pip install -r requirements.txt
```

Regenerate the player data:

```bash
npm run players:generate
```
