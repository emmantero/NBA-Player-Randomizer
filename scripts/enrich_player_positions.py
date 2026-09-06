import json
from datetime import date
from pathlib import Path

from nba_api.stats.endpoints import playerindex


PLAYERS_PATH = Path(__file__).resolve().parents[1] / "public" / "data" / "players.json"
FALLBACK_POSITIONS = {
    202681: "G",  # Kyrie Irving
    203081: "G",  # Damian Lillard
    1630169: "G",  # Tyrese Haliburton
}


def current_nba_season():
    today = date.today()
    start_year = today.year if today.month >= 10 else today.year - 1
    return f"{start_year}-{str(start_year + 1)[-2:]}"


def get_positions():
    player_data = playerindex.PlayerIndex(season=current_nba_season()).get_data_frames()[0]
    return {
        int(player["PERSON_ID"]): player["POSITION"]
        for _, player in player_data.iterrows()
        if player["POSITION"]
    }


def main():
    players = json.loads(PLAYERS_PATH.read_text(encoding="utf-8"))
    positions = get_positions()
    missing_players = []

    for player in players:
        position = positions.get(player["id"], FALLBACK_POSITIONS.get(player["id"]))
        if position:
            player["position"] = position
        else:
            missing_players.append(player["name"])

    PLAYERS_PATH.write_text(json.dumps(players, indent=2) + "\n", encoding="utf-8")
    print(f"Updated positions for {len(players) - len(missing_players)} players.")
    if missing_players:
        print(f"No current-season position found for: {', '.join(missing_players)}")


if __name__ == "__main__":
    main()
