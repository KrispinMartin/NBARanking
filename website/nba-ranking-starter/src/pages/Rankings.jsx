import React, { useEffect, useState } from "react";
import API from "../api";

function Rankings() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");

  // Load players from API
  useEffect(() => {
    API.get("/rankings?limit=360")
      .then((r) => {
        setPlayers(r.data);
        setFilteredPlayers(r.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rankings:", err);
        setError("Failed to fetch data from API");
        setLoading(false);
      });
  }, []);

  // Apply filters
  useEffect(() => {
    let data = players;

    if (search) {
      data = data.filter((p) =>
        p.namePlayer?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (teamFilter !== "All") {
      data = data.filter((p) => p.team === teamFilter);
    }
    if (positionFilter !== "All") {
      data = data.filter((p) => p.pos === positionFilter);
    }

    setFilteredPlayers(data);
  }, [search, teamFilter, positionFilter, players]);

  // Unique filters
  const teams = ["All", ...new Set(players.map((p) => p.team).filter(Boolean))];
  const positions = ["All", ...new Set(players.map((p) => p.pos).filter(Boolean))];

  if (loading) return <h2 style={{ color: "white" }}>Loading player rankings...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className="page container">
      <h1>Player Rankings</h1>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #1f2d40",
            background: "#0e1a29",
            color: "#eaf2fb",
            flex: "1",
          }}
        />

        <select
          className="pill"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
        >
          {teams.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>

        <select
          className="pill"
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
        >
          {positions.map((pos, i) => (
            <option key={i} value={pos}>{pos}</option>
          ))}
        </select>
      </div>

      {/* Rankings Table */}
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Team</th>
            <th>Pos</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.length === 0 ? (
            <tr>
              <td colSpan="5">No players found.</td>
            </tr>
          ) : (
            filteredPlayers.map((p, i) => (
              <tr key={i}>
                <td>{p.rank}</td>
                <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {p.headshot_href ? (
                    <img
                      src={p.headshot_href}
                      alt={p.namePlayer}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#13263d",
                      }}
                    />
                  )}
                  {p.namePlayer}
                </td>
                <td>{p.team || "N/A"}</td>
                <td>{p.pos || "N/A"}</td>
                <td>
                  <span className="badge up">{p.score?.toFixed(1)}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Rankings;
