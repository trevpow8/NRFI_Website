import statsapi
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class GamePrediction(BaseModel):
    home_team: str
    away_team: str
    game_time: str
    recommendation: str

def get_today_games():
    today = datetime.now().strftime('%Y-%m-%d')
    games = statsapi.schedule(start_date=today, end_date=today, sportId=1)
    return games

def get_leadoff_avg(team_box: dict) -> float:
    try:
        first_batter_id = team_box.get("battingOrder", [])[0]
        player = team_box["players"].get(f"ID{first_batter_id}", {})
        return float(player.get("seasonStats", {}).get("batting", {}).get("avg", 0.0))
    except Exception:
        return 0.0

def make_predictions():
    today_games = get_today_games()
    results = []

    for game in today_games:
        game_id = game['game_id']
        box = statsapi.boxscore_data(str(game_id))
        home = box['home']
        away = box['away']

        home_avg = get_leadoff_avg(home)
        away_avg = get_leadoff_avg(away)

        # Simple logic
        if home_avg > 0.250 or away_avg > 0.250:
            prediction = "Bet YRFI"
        else:
            prediction = "Bet NRFI"

        results.append(GamePrediction(
            home_team=game['home_name'],
            away_team=game['away_name'],
            game_time=game['game_datetime'],
            recommendation=prediction
        ))

    return results

@app.get("/predictions", response_model=list[GamePrediction])
def get_predictions():
    return make_predictions()

if __name__ == "__main__": 
    import json, pathlib
    out = [p.model_dump() for p in make_predictions()]
    pathlib.Path("data").mkdir(exist_ok=True)
    json.dump(out, open("data/today.json", "w"), indent=2)