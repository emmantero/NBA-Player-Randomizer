import json
from pathlib import Path

from nba_api.stats.static import players


OUTPUT_PATH = Path(__file__).resolve().parents[1] / "public" / "data" / "players.json"
HEADSHOT_BASE_URL = "https://cdn.nba.com/headshots/nba/latest/1040x760"
THUMBNAIL_BASE_URL = "https://cdn.nba.com/headshots/nba/latest/260x190"


def player_payload(player):
    player_id = player["id"]

    return {
        "id": player_id,
        "name": player["full_name"],
        "firstName": player["first_name"],
        "lastName": player["last_name"],
        "image": f"{HEADSHOT_BASE_URL}/{player_id}.png",
        "thumbnail": f"{THUMBNAIL_BASE_URL}/{player_id}.png",
    }


def main():
    active_players = players.get_active_players()
    payload = sorted(
        (player_payload(player) for player in active_players),
        key=lambda player: player["name"],
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    print(f"Generated {len(payload)} players at {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
