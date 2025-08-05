
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

type Game = {
  game_id: string;
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
    fetch('/data/today.json') // Assumes today.json is in public/data/
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
      <h1>Today’s MLB Predictions</h1>
      {loading ? (
        <p>Loading games...</p>
      ) : (
        <ul className="game-list">
          {games.map((game) => (
            <li key={game.game_id} className="game-item">
              <div className="teams">
                <strong>{game.away_team}</strong> @ <strong>{game.home_team}</strong>
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
