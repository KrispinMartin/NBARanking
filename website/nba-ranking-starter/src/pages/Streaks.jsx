import React, { useEffect, useState } from "react";
import API from "../api";

export default function Streaks() {
  const [range, setRange] = useState(5);
  const [hotPlayers, setHotPlayers] = useState([]);
  const [coldPlayers, setColdPlayers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get(`/trends?range=${range}`);
        setHotPlayers(res.data.hot || []);
        setColdPlayers(res.data.cold || []);
      } catch (err) {
        console.error("Error fetching streak data:", err);
      }
    }
    fetchData();
  }, [range]);

  const renderPlayerCard = (p, color, valueColor) => {
    const streak = p.streak_value || 0;

    return (
      <div
        key={p.player_name}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0f1824",
          borderRadius: "12px",
          padding: "14px 18px",
          border: `1px solid ${color}30`,
          boxShadow: `0 0 8px ${color}20`,
          marginBottom: "12px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={p.headshot_href}
            alt={p.player_name}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: `2px solid ${color}`,
              objectFit: "cover",
            }}
          />
          <div>
            <h3
              style={{
                color: "#fff",
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {p.player_name}
            </h3>
            <p
              style={{
                color: "#94a3b8",
                margin: 0,
                fontSize: "13px",
              }}
            >
              {p.team} • {p.position}
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span
            style={{
              color: valueColor,
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "0.3px",
            }}
          >
            {Math.abs(streak).toFixed(1)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="page" style={{ padding: "20px" }}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "1.5rem",
          color: "#fff",
        }}
      >
        Hot & Cold Streaks
      </h1>

      {/* Toggle Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "2rem",
          background: "#0e1a29",
          borderRadius: "10px",
          padding: "6px",
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setRange(5)}
          style={{
            background: range === 5 ? "#2563eb" : "transparent",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            color: "#fff",
            fontWeight: "500",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow:
              range === 5 ? "0 0 12px rgba(37,99,235,0.5)" : "none",
          }}
        >
          Last 5 Games
        </button>
        <button
          onClick={() => setRange(10)}
          style={{
            background: range === 10 ? "#2563eb" : "transparent",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            color: "#fff",
            fontWeight: "500",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow:
              range === 10 ? "0 0 12px rgba(37,99,235,0.5)" : "none",
          }}
        >
          Last 10 Games
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* HOT PLAYERS */}
        <div>
          <h2
            style={{
              color: "#ef4444",
              fontSize: "1.4rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            🔥 Hot Players
          </h2>
          {hotPlayers.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No hot players found.</p>
          ) : (
            hotPlayers.map((p) =>
              renderPlayerCard(p, "#ef4444", "#ef4444")
            )
          )}
        </div>

        {/* COLD PLAYERS */}
        <div>
          <h2
            style={{
              color: "#3b82f6",
              fontSize: "1.4rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            ❄️ Cold Players
          </h2>
          {coldPlayers.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No cold players found.</p>
          ) : (
            coldPlayers.map((p) =>
              renderPlayerCard(p, "#3b82f6", "#3b82f6")
            )
          )}
        </div>
      </div>
    </div>
  );
}
