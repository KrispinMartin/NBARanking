import React from "react";

export default function PlayerCard({ player, color }) {
  if (!player) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #1a2332 0%, #0f1824 100%)",
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
          minWidth: "280px",
          maxWidth: "320px",
          border: "2px dashed #2d3e52",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "520px",
        }}
      >
        <p style={{ color: "#64748b", fontSize: "16px", fontWeight: "500" }}>
          Empty Slot
        </p>
      </div>
    );
  }

  // Use API field names (not the old _100 ones)
  const stats = [
    { label: "Impact", value: player.impact || 0 },
    { label: "Scoring", value: player.scoring || 0 },
    { label: "Playmaking", value: player.playmaking || 0 },
    { label: "Rebounding", value: player.rebounding || 0 },
    { label: "Discipline", value: player.discipline || 0 },
    { label: "Defense", value: player.defense || 0 },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a2332 0%, #0f1824 100%)",
        borderRadius: "16px",
        padding: "32px 24px",
        textAlign: "center",
        minWidth: "280px",
        maxWidth: "320px",
        border: `2px solid ${color}20`,
        boxShadow: `0 4px 20px ${color}15`,
      }}
    >
      <img
        src={player.headshot_href}
        alt={player.namePlayer}
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          marginBottom: "16px",
          border: `3px solid ${color}`,
          objectFit: "cover",
        }}
      />
      <h3
        style={{
          color: "#ffffff",
          fontSize: "20px",
          margin: "0 0 8px 0",
          fontWeight: "600",
        }}
      >
        {player.namePlayer}
      </h3>
      <p
        style={{
          color: "#94a3b8",
          fontSize: "14px",
          margin: "0 0 16px 0",
        }}
      >
        {player.team} • {player.pos}
      </p>

      {/* Overall Score */}
      <div
        style={{
          background: `${color}20`,
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            color: "#94a3b8",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Overall Score
        </div>
        <h2
          style={{
            color: color,
            fontSize: "36px",
            margin: "4px 0 0 0",
            fontWeight: "700",
          }}
        >
          {player.score || 0}
        </h2>
      </div>

      {/* Individual Stats */}
      {stats.map((s, i) => (
        <div key={i} style={{ margin: "16px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                fontWeight: "500",
              }}
            >
              {s.label}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#ffffff",
                fontWeight: "600",
              }}
            >
              {Number(s.value).toFixed(1)}
            </span>
          </div>
          <div
            style={{
              background: "#0f1824",
              borderRadius: "8px",
              height: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${s.value}%`,
                background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                height: "100%",
                borderRadius: "8px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
