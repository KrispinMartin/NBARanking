import React, { useState } from "react";
import API from "../api";

function Compare() {
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [results, setResults] = useState([]);

  const handleCompare = () => {
    const query = players
      .map((p, i) => (p ? `player${i + 1}=${encodeURIComponent(p)}` : ""))
      .filter(Boolean)
      .join("&");

    if (!query) return;

    API.get(`/compare?${query}`)
      .then((res) => setResults(res.data))
      .catch((err) => console.error("Error comparing:", err));
  };

  return (
    <div className="page">
      <h1>Compare Players</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        {players.map((p, i) => (
          <input
            key={i}
            placeholder={`Player ${i + 1}`}
            value={p}
            onChange={(e) => {
              const copy = [...players];
              copy[i] = e.target.value;
              setPlayers(copy);
            }}
          />
        ))}
        <button onClick={handleCompare} className="pill">Compare</button>
      </div>

      {results.length > 0 && (
        <table className="panelAccent">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Impact</th>
              <th>Scoring</th>
              <th>Playmaking</th>
              <th>Rebounding</th>
              <th>Discipline</th>
              <th>Defense</th>
            </tr>
          </thead>
          <tbody>
            {results.map((p, i) => (
              <tr key={i}>
                <td>{p.rank}</td>
                <td>{p.namePlayer}</td>
                <td>{p.score_total.toFixed(3)}</td>
                <td>{p.Z_IMPACT.toFixed(2)}</td>
                <td>{p.Z_SCORING.toFixed(2)}</td>
                <td>{p.Z_PLAY.toFixed(2)}</td>
                <td>{p.Z_REB.toFixed(2)}</td>
                <td>{p.Z_DISC.toFixed(2)}</td>
                <td>{p.Z_DEF.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Compare;
