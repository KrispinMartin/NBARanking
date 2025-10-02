import React, { useEffect, useState } from "react";
import API from "../api";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    API.get("/rankings?limit=100")
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error("Error fetching dashboard:", err));
  }, []);

  const totalPlayers = players.length;
  const avgRating =
    players.length > 0
      ? (players.reduce((sum, p) => sum + p.score, 0) / players.length).toFixed(2)
      : 0;
  const top5 = players.slice(0, 5);

  return (
    <div className="page">
      <h1>NBA Dashboard</h1>
      <div className={styles.statsGrid}>
        <div className="panelAccent">
          <p>Total Players</p>
          <h3>{totalPlayers}</h3>
        </div>
        <div className="panelAccent">
          <p>Average Rating</p>
          <h3>{avgRating}</h3>
        </div>
      </div>

      <h2>Top 5 Players</h2>
      <ul>
        {top5.map((p, i) => (
          <li key={i}>
            {p.rank}. {p.namePlayer} – {p.score?.toFixed(1)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
