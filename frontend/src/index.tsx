
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

const teamIdMap = {
  'Arizona Diamondbacks': 109,
  'Atlanta Braves': 144,
  'Baltimore Orioles': 110,
  'Boston Red Sox': 111,
  'Chicago Cubs': 112,
  'Chicago White Sox': 145,
  'Cincinnati Reds': 113,
  'Cleveland Guardians': 114,
  'Colorado Rockies': 115,
  'Detroit Tigers': 116,
  'Houston Astros': 117,
  'Kansas City Royals': 118,
  'Los Angeles Angels': 108,
  'Los Angeles Dodgers': 119,
  'Miami Marlins': 146,
  'Milwaukee Brewers': 158,
  'Minnesota Twins': 142,
  'New York Mets': 121,
  'New York Yankees': 147,
  'Athletics': 133,
  'Oakland Athletics': 133,
  'Philadelphia Phillies': 143,
  'Pittsburgh Pirates': 134,
  'San Diego Padres': 135,
  'San Francisco Giants': 137,
  'Seattle Mariners': 136,
  'St. Louis Cardinals': 138,
  'Tampa Bay Rays': 139,
  'Texas Rangers': 140,
  'Toronto Blue Jays': 141,
  'Washington Nationals': 120,
};

function getTeamLogo(teamName) {
  const teamId = teamIdMap[teamName];
  return teamId ? `https://www.mlbstatic.com/team-logos/${teamId}.svg` : '';
}

type Game = {
  game_id: number;
  home_team: string;
  away_team: string;
  game_time: string;
  status: string;
  home_pitcher: string;
  away_pitcher: string;
  recommendation: string;
};  

const App = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/today.json')
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load game data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <h1>Today’s First Run Inning Predictions</h1>
      {loading ? (
        <p>Loading games...</p>
      ) : (
        <ul className="game-list">
          {games.map((game) => (
            <li key={game.game_id} className="game-item">
              <div className="teams">
              <img
                src={getTeamLogo(game.away_team)}
                alt={game.away_team}
                className="team-logo"
              />
              
                <strong>{game.away_team}</strong> @ <strong>{game.home_team}</strong>
              
              <img
                src={getTeamLogo(game.home_team)}
                alt={game.home_team}
                className="team-logo"
              />
              </div>
              <div className="game-time">
                {new Date(game.game_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                — {game.status}
              </div>
              <div className="pitchers">
                <p><strong>Away SP:</strong> {game.away_pitcher}</p>
                <p><strong>Home SP:</strong> {game.home_pitcher}</p>
              </div>
              <div className="recommendation">
                <strong>Recommendation:</strong> {game.recommendation}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
