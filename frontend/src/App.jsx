import React, { useEffect, useState } from 'react';
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

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/today')
    .then((res) => res.json())
    .then((data) => {
      setGames(data.items || []);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Failed to fetch games:', err);
      setLoading(false);
    });
}, []);

  return (
    <div className="app-container">
      <h1>Today's MLB Games</h1>
      {loading ? (
        <p>Loading...</p>
      ) : games.length === 0 ? (
        <p>No games today.</p>
      ) : (
        <ul className="game-list">
          {games
            .filter(
              (game) =>
                game.home_pitcher &&
                game.away_pitcher &&
                game.home_pitcher !== 'TBD' &&
                game.away_pitcher !== 'TBD'
            )
            .map((game) => (
              <li key={game.game_id} className="game-item">
                <div className="matchup">
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
                <div className="game-info">
                  {new Date(game.game_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  — {game.status}
                </div>
                <div className="pitchers">
                  <span>
                    <strong>{game.away_team} SP:</strong> {game.away_pitcher}
                  </span>
                  <br />
                  <span>
                    <strong>{game.home_team} SP:</strong> {game.home_pitcher}
                  </span>
                </div>
                <div className="recommendation-tag">
                  {game.recommendation} {game.yrfi_probability != null && (
                    <span style={{ marginLeft: 8, fontWeight: 400 }}>
                      ({Math.round((game.yrfi_probability) * 100)}% YRFI)
                    </span>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default App;