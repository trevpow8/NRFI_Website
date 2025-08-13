import statsapi
import json
from datetime import datetime, timedelta

def get_today_games():
    today = datetime.now().date()
    games = statsapi.schedule(start_date=today, end_date=today)
    return games

def parse_games(games):
    parsed_games = []
    for game in games:
        game_info = {
            'game_id': game.get('game_id'),
            'date': game.get('game_date'),
            'game_time': game.get('game_datetime'),
            'away_team': game.get('away_name'),
            'home_team': game.get('home_name'),
            'home_pitcher': game.get('home_probable_pitcher'),
            'away_pitcher': game.get('away_probable_pitcher'),
            'recommendation': 'TBD',  # Placeholder for recommendation logic
        }
        parsed_games.append(game_info)
    return parsed_games

def save_games_to_json(games, filename='frontend/public/today.json'):
    with open(filename, 'w') as f:
        json.dump(games, f, indent=4, default=str)

if __name__ == "__main__":
    games = get_today_games()
    games = parse_games(games)
    save_games_to_json(games)
    print(f"Saved today's games to today.json")