import React, { useEffect, useState } from "react";
import API from "../api";

function Rankings() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [statFilter, setStatFilter] = useState("TOTAL_100");

  // Advanced stat options (from your CSV)
  const statOptions = [
    "IMPACT_100",
    "SCORING_100",
    "PLAY_100",
    "REB_100",
    "DISC_100",
    "DEF_100",
    "TOTAL_100",
  ];

  // Fetch players when stat changes
  useEffect(() => {
    setLoading(true);
    API.get(`/rankings?limit=360&stat=${statFilter}`)
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
  }, [statFilter]);

  // Apply search + filters
  useEffect(() => {
    let data = [...players];

    if (search) {
      data = data.filter((p) =>
        p.namePlayer?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (teamFilter !== "All Teams") {
      data = data.filter((p) => p.team === teamFilter);
    }

    if (positionFilter !== "All Positions") {
      data = data.filter((p) => p.pos === positionFilter);
    }

    setFilteredPlayers(data);
  }, [search, teamFilter, positionFilter, players]);

  // Unique filter values
  const teams = ["All Teams", ...new Set(players.map((p) => p.team).filter(Boolean))];
  const positions = ["All Positions", ...new Set(players.map((p) => p.pos).filter(Boolean))];

  if (loading) return <h2 style={{ color: "white" }}>Loading player rankings...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className="page container">
      <h1>Player Rankings</h1>

      {/* Search + Filters */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Smaller Search Bar */}
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
            flex: "0.8",
            minWidth: "200px",
          }}
        />

        {/* Team Filter */}
        <select
          className="pill"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
        >
          {teams.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Position Filter */}
        <select
          className="pill"
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
        >
          {positions.map((pos, i) => (
            <option key={i} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        {/* Stat Filter */}
        <select
          className="pill"
          value={statFilter}
          onChange={(e) => setStatFilter(e.target.value)}
        >
          {statOptions.map((s, i) => (
            <option key={i} value={s}>
              {s.replace("_100", "").replace("_", " ")}
            </option>
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
            <th>{statFilter.replace("_100", "")}</th>
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
                  <span className="badge up">
                    {p.score ? p.score.toFixed(1) : "—"}
                  </span>
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
