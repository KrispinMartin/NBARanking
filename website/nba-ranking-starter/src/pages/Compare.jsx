import React, { useState, useEffect } from "react";
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend,
  ResponsiveContainer, Tooltip
} from "recharts";
import API from "../api";
import PlayerCard from "../components/PlayerCard";

// SearchableSelect with dark theme
function SearchableSelect({ options, value, onChange, placeholder, isClearable, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: "relative", ...style }}>
      <div
        style={{
          background: "#1a2332",
          border: "2px solid #2d3e52",
          borderRadius: "12px",
          padding: "12px 16px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minWidth: "200px",
        }}
      >
        <input
          type="text"
          value={isOpen ? searchTerm : (value ? value.label : "")}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: value ? "#ffffff" : "#64748b",
            fontSize: "14px",
            fontWeight: "500",
            width: "100%",
            cursor: "pointer",
          }}
        />
        <span style={{ color: "#64748b", marginLeft: "8px" }}>▼</span>
      </div>

      {isOpen && (
        <>
          <div
            onClick={() => {
              setIsOpen(false);
              setSearchTerm("");
            }}
            style={{
              position: "fixed", top: 0, left: 0,
              right: 0, bottom: 0, zIndex: 998,
            }}
          />
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            marginTop: "8px", background: "#1a2332",
            border: "2px solid #2d3e52", borderRadius: "12px",
            maxHeight: "300px", overflowY: "auto",
            zIndex: 999, boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}>
            {isClearable && value && (
              <div
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                style={{
                  padding: "12px 16px", color: "#ef4444",
                  cursor: "pointer", fontSize: "14px",
                  borderBottom: "1px solid #2d3e52",
                  fontWeight: "500",
                }}
              >
                Clear Selection
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  style={{
                    padding: "12px 16px", color: "#ffffff",
                    cursor: "pointer", fontSize: "14px", fontWeight: "500",
                    background: value?.value === option.value ? "#2d3e5220" : "transparent",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#2d3e5240"}
                  onMouseLeave={(e) => e.target.style.background = value?.value === option.value ? "#2d3e5220" : "transparent"}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px 16px", color: "#64748b", fontSize: "14px" }}>
                No players found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Custom Tooltip for Radar Chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a2332",
        border: "2px solid #2d3e52",
        borderRadius: "8px",
        padding: "12px",
      }}>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 8px 0", fontWeight: "600" }}>
          {payload[0].payload.stat}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontSize: "14px", margin: "4px 0", fontWeight: "600" }}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper function to get stat value from player object with multiple fallbacks
function getStatValue(player, ...keys) {
  for (let key of keys) {
    if (player[key] !== undefined && player[key] !== null) {
      return Number(player[key]);
    }
  }
  return 0;
}

export default function Compare() {
  const [players, setPlayers] = useState([]);
  const [numSlots, setNumSlots] = useState(2);
  const [selected, setSelected] = useState([null, null, null, null]);
  const [compareData, setCompareData] = useState([]);
  const [teamFilter, setTeamFilter] = useState(null);
  const [posFilter, setPosFilter] = useState(null);

  useEffect(() => {
    API.get("/rankings?limit=360")
      .then((res) => setPlayers(res.data))
      .catch((err) => console.error("Error fetching players:", err));
  }, []);

  const handleCompare = () => {
    const query = selected
      .slice(0, numSlots)
      .filter(Boolean)
      .map((p, i) => `player${i + 1}=${encodeURIComponent(p.value)}`)
      .join("&");

    if (query) {
      API.get(`/compare?${query}`)
        .then((res) => {
          console.log("Compare API response:", res.data); // Debug log
          setCompareData(res.data);
        })
        .catch((err) => console.error("Error comparing players:", err));
    }
  };

  // Build radar data with fallback field names
  const radarData = [
    { stat: "Impact", keys: ["IMPACT_100", "impact_100", "impact", "IMPACT"] },
    { stat: "Scoring", keys: ["SCORING_100", "scoring_100", "scoring", "SCORING"] },
    { stat: "Playmaking", keys: ["PLAY_100", "playmaking_100", "playmaking", "PLAYMAKING", "PLAY"] },
    { stat: "Rebounding", keys: ["REB_100", "rebounding_100", "rebounding", "REBOUNDING", "REB"] },
    { stat: "Discipline", keys: ["DISC_100", "discipline_100", "discipline", "DISCIPLINE", "DISC"] },
    { stat: "Defense", keys: ["DEF_100", "defense_100", "defense", "DEFENSE", "DEF"] }
  ].map((statInfo) => {
    let row = { stat: statInfo.stat };
    compareData.forEach((p) => {
      row[p.namePlayer] = getStatValue(p, ...statInfo.keys);
    });
    return row;
  });

  const playerOptions = players
    .filter((p) => {
      if (teamFilter && p.team !== teamFilter.value) return false;
      if (posFilter && p.pos !== posFilter.value) return false;
      return true;
    })
    .map((p) => ({ value: p.namePlayer, label: p.namePlayer }));

  const teamOptions = [...new Set(players.map((p) => p.team))].map((t) => ({ value: t, label: t }));
  const posOptions = [...new Set(players.map((p) => p.pos))].map((p) => ({ value: p, label: p }));

  const colors = ["#3b82f6", "#f97316", "#22c55e", "#e11d48"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{
          color: "#ffffff",
          fontSize: "42px",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "40px",
        }}>
          Compare Players
        </h1>

        {/* Filters at top */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "16px", marginBottom: "40px", flexWrap: "wrap",
        }}>
          <SearchableSelect options={teamOptions} value={teamFilter} onChange={setTeamFilter} placeholder="Filter by Team" isClearable />
          <SearchableSelect options={posOptions} value={posFilter} onChange={setPosFilter} placeholder="Filter by Position" isClearable />
        </div>

        {/* Player selection */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "16px", marginBottom: "32px",
          flexWrap: "wrap", alignItems: "center",
        }}>
          {Array.from({ length: numSlots }).map((_, idx) => (
            <SearchableSelect
              key={idx}
              options={playerOptions}
              value={selected[idx]}
              onChange={(val) => {
                const newSelected = [...selected];
                newSelected[idx] = val;
                setSelected(newSelected);
              }}
              placeholder={`Player ${idx + 1}`}
              isClearable
              style={{ minWidth: "240px" }}
            />
          ))}

          {numSlots < 4 && (
            <button
              onClick={() => setNumSlots(numSlots + 1)}
              style={{
                background: "linear-gradient(135deg, #2d3e52 0%, #1a2332 100%)",
                border: "2px solid #3b82f6",
                borderRadius: "12px",
                color: "#3b82f6",
                padding: "12px 24px",
                fontSize: "14px", fontWeight: "600",
                cursor: "pointer",
              }}
            >
              + ADD PLAYER
            </button>
          )}

          <button
            onClick={handleCompare}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              border: "none", borderRadius: "12px",
              color: "#ffffff", padding: "12px 32px",
              fontSize: "14px", fontWeight: "700",
              cursor: "pointer",
            }}
          >
            COMPARE
          </button>
        </div>

        {/* Player Cards */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "24px", marginBottom: "60px", flexWrap: "wrap",
        }}>
          {compareData.length > 0 ? (
            Array.from({ length: numSlots }).map((_, idx) => (
              <PlayerCard
                key={idx}
                player={compareData[idx]}
                color={colors[idx % colors.length]}
              />
            ))
          ) : (
            <p style={{
              color: "#64748b", fontSize: "18px",
              textAlign: "center", padding: "60px 20px",
              fontWeight: "500",
            }}>
              Select players and click COMPARE to view stats
            </p>
          )}
        </div>

        {/* Radar Chart */}
        {compareData.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #1a2332 0%, #0f1824 100%)",
            borderRadius: "20px", padding: "40px 20px",
            marginTop: "40px", border: "2px solid #2d3e52",
          }}>
            <h2 style={{
              color: "#ffffff", fontSize: "28px",
              fontWeight: "700", textAlign: "center",
              marginBottom: "30px",
            }}>
              Statistical Comparison
            </h2>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2d3e52" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#94a3b8", fontSize: 14, fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} stroke="#2d3e52" />
                <Tooltip content={<CustomTooltip />} />
                {compareData.map((p, idx) => (
                  <Radar
                    key={p.namePlayer}
                    name={p.namePlayer}
                    dataKey={p.namePlayer}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.25}
                    strokeWidth={3}
                  />
                ))}
                <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "14px", fontWeight: 600 }} iconType="circle" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}