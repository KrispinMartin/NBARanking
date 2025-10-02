import React, { useEffect, useState } from "react";
import API from "../api";
import styles from "./Streaks.module.css";  // optional, if you want separate styling

function Streaks() {
  const [streaks, setStreaks] = useState([]);

  useEffect(() => {
    API.get("/streaks?limit=20")
      .then((res) => setStreaks(res.data))
      .catch((err) => console.error("Error fetching streaks:", err));
  }, []);

  const hotPlayers = streaks.filter((p) => p.status && p.status.includes("Hot"));
  const coldPlayers = streaks.filter((p) => p.status && p.status.includes("Cold"));

  return (
    <div className="page">
      <h1>Hot & Cold Streaks</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div className="panelAccent">
          <h2>🔥 Hot Players</h2>
          {hotPlayers.length === 0
            ? <p>No hot players found.</p>
            : hotPlayers.map((p, i) => (
              <div key={i} className="player-card">
                <strong>{p.namePlayer}</strong>
                <p>{p.status}</p>
              </div>
            ))}
        </div>

        <div className="panelAccent">
          <h2>❄️ Cold Players</h2>
          {coldPlayers.length === 0
            ? <p>No cold players found.</p>
            : coldPlayers.map((p, i) => (
              <div key={i} className="player-card">
                <strong>{p.namePlayer}</strong>
                <p>{p.status}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Streaks;
