import React, { useState, useEffect } from "react";
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend,
  ResponsiveContainer, Tooltip
} from "recharts";
import API from "../api";
import PlayerCard from "../components/PlayerCard";

// --- 1️⃣ SearchableSelect (for players)
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
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            color: "#fff",
            fontSize: "14px",
            fontWeight: "500",
            width: "100%",
            cursor: "text",
          }}
        />
        <span style={{ color: "#64748b", marginLeft: "8px", cursor: "pointer" }}>▼</span>
      </div>

      {isOpen && (
        <>
          <div
            onClick={() => { setIsOpen(false); setSearchTerm(""); }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
          />
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            marginTop: "6px", background: "#1a2332",
            border: "2px solid #2d3e52", borderRadius: "12px",
            maxHeight: "300px", overflowY: "auto", zIndex: 999
          }}>
            {isClearable && value && (
              <div
                onClick={() => { onChange(null); setIsOpen(false); setSearchTerm(""); }}
                style={{
                  padding: "10px 16px", color: "#ef4444",
                  borderBottom: "1px solid #2d3e52", cursor: "pointer",
                }}
              >
                Clear Selection
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(""); }}
                  style={{
                    padding: "10px 16px", color: "#fff",
                    background: value?.value === opt.value ? "#2d3e5233" : "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#2d3e5240"}
                  onMouseLeave={(e) => e.target.style.background = value?.value === opt.value ? "#2d3e5233" : "transparent"}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div style={{ padding: "10px 16px", color: "#64748b" }}>No players found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// --- 2️⃣ SimpleSelect (for Compare Mode, no typing)
function SimpleSelect({ options, value, onChange, placeholder, style }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative", ...style }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "#1a2332",
          border: "2px solid #2d3e52",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          color: "#fff",
          fontSize: "14px",
          minWidth: "200px",
        }}
      >
        {value ? value.label : placeholder}
        <span style={{ color: "#64748b" }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "#1a2332", border: "2px solid #2d3e52",
          borderRadius: "12px", marginTop: "6px", zIndex: 999
        }}>
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{
                padding: "10px 14px",
                color: value?.value === opt.value ? "#3b82f6" : "#fff",
                background: value?.value === opt.value ? "#2d3e5233" : "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => e.target.style.background = "#2d3e5240"}
              onMouseLeave={(e) => e.target.style.background = value?.value === opt.value ? "#2d3e5233" : "transparent"}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a2332",
        border: "2px solid #2d3e52",
        borderRadius: "8px",
        padding: "12px",
      }}>
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "6px" }}>
          {payload[0].payload.stat}
        </p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, fontSize: "14px", margin: "3px 0" }}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function getStatValue(player, ...keys) {
  for (let key of keys) {
    if (player[key] !== undefined && player[key] !== null) {
      return Number(player[key]);
    }
  }
  return 0;
}

// --- MAIN ---
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
    const validPlayers = selected.slice(0, numSlots).filter(Boolean);
    if (validPlayers.length === 0) return;

    const query = validPlayers
      .map((p, i) => `player${i + 1}=${encodeURIComponent(p.value)}`)
      .join("&");

    API.get(`/compare?${query}`)
      .then((res) => setCompareData(res.data))
      .catch((err) => console.error("Error comparing players:", err));
  };

  const playerOptions = players
    .filter((p) => (!teamFilter || p.team === teamFilter.value) && (!posFilter || p.pos === posFilter.value))
    .map((p) => ({ value: p.namePlayer, label: p.namePlayer }));

  const teamOptions = [...new Set(players.map((p) => p.team))].map((t) => ({ value: t, label: t }));
  const posOptions = [...new Set(players.map((p) => p.pos))].map((p) => ({ value: p, label: p }));
  const compareModes = [
    { value: 2, label: "Compare 2 Players" },
    { value: 3, label: "Compare 3 Players" },
    { value: 4, label: "Compare 4 Players" },
  ];

  const colors = ["#3b82f6", "#f97316", "#22c55e", "#e11d48"];

  const radarData = [
    { stat: "Impact", keys: ["impact", "IMPACT", "IMPACT_100"] },
    { stat: "Scoring", keys: ["scoring", "SCORING", "SCORING_100"] },
    { stat: "Playmaking", keys: ["playmaking", "PLAY", "PLAY_100"] },
    { stat: "Rebounding", keys: ["rebounding", "REB", "REB_100"] },
    { stat: "Discipline", keys: ["discipline", "DISC", "DISC_100"] },
    { stat: "Defense", keys: ["defense", "DEF", "DEF_100"] },
  ].map((statInfo) => {
    const row = { stat: statInfo.stat };
    compareData.forEach((p) => {
      row[p.namePlayer] = getStatValue(p, ...statInfo.keys);
    });
    return row;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{
          color: "#fff", fontSize: "42px", fontWeight: 700,
          textAlign: "center", marginBottom: "40px",
        }}>
          Compare Players
        </h1>

        {/* Filters & Compare Mode */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "16px", marginBottom: "40px", flexWrap: "wrap",
        }}>
          <SearchableSelect options={teamOptions} value={teamFilter} onChange={setTeamFilter} placeholder="Filter by Team" isClearable />
          <SearchableSelect options={posOptions} value={posFilter} onChange={setPosFilter} placeholder="Filter by Position" isClearable />
          <SimpleSelect
            options={compareModes}
            value={compareModes.find(m => m.value === numSlots)}
            onChange={(mode) => setNumSlots(mode.value)}
            placeholder="Compare Mode"
          />
        </div>

        {/* Player selectors */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "16px", marginBottom: "32px", flexWrap: "wrap",
        }}>
          {Array.from({ length: numSlots }).map((_, i) => (
            <SearchableSelect
              key={i}
              options={playerOptions}
              value={selected[i]}
              onChange={(val) => {
                const updated = [...selected];
                updated[i] = val;
                setSelected(updated);
              }}
              placeholder={`Player ${i + 1}`}
              isClearable
            />
          ))}

          <button
            onClick={handleCompare}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 22px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(37,99,235,0.4)",
            }}
          >
            COMPARE
          </button>
        </div>

        {/* Player Cards & Radar Chart stay same */}
        <div style={{
          display: "flex", justifyContent: "center",
          flexWrap: "wrap", gap: "24px", marginBottom: "60px",
        }}>
          {compareData.length > 0 ? (
            compareData.map((p, i) => (
              <PlayerCard key={i} player={p} color={colors[i % colors.length]} />
            ))
          ) : (
            <p style={{
              color: "#64748b", fontSize: "18px", textAlign: "center",
              padding: "60px 20px", fontWeight: "500",
            }}>
              Select players and click COMPARE to view stats
            </p>
          )}
        </div>

        {compareData.length > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #1a2332 0%, #0f1824 100%)",
            borderRadius: "20px",
            padding: "40px 20px",
            border: "2px solid #2d3e52",
          }}>
            <h2 style={{
              color: "#fff",
              fontSize: "28px",
              textAlign: "center",
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
                {compareData.map((p, i) => (
                  <Radar
                    key={p.namePlayer}
                    name={p.namePlayer}
                    dataKey={p.namePlayer}
                    stroke={colors[i % colors.length]}
                    fill={colors[i % colors.length]}
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
