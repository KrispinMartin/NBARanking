import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [topPlayers, setTopPlayers] = useState([]);
  const [hotPlayers, setHotPlayers] = useState([]);
  const [coldPlayers, setColdPlayers] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const rankRes = await API.get("/rankings?limit=25");
        setTopPlayers(rankRes.data || []);

        const trendRes = await API.get("/trends?range=5");
        setHotPlayers(trendRes.data.hot || []);
        setColdPlayers(trendRes.data.cold || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    }
    fetchData();
  }, []);

  const renderPlayerRow = (p, idx) => (
    <div
      key={idx}
      onClick={() => navigate("/compare", { state: { preselect: p.namePlayer } })}
      style={{
        display: "grid",
        gridTemplateColumns: "50px 1fr 80px 60px 80px",
        alignItems: "center",
        padding: "12px 18px",
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#132f4c60")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ color: "#94a3b8", fontWeight: 500 }}>{idx + 1}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {p.headshot_href ? (
          <img
            src={p.headshot_href}
            alt={p.namePlayer}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #2d3e52",
            }}
          />
        ) : (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#1e293b",
            }}
          />
        )}
        <div style={{ color: "#fff", fontWeight: 600 }}>{p.namePlayer}</div>
      </div>
      <div style={{ color: "#94a3b8", fontWeight: 500 }}>{p.team}</div>
      <div style={{ color: "#94a3b8", fontWeight: 500 }}>{p.pos}</div>
      <div
        style={{
          color: "#3b82f6",
          textAlign: "right",
          fontWeight: 700,
        }}
      >
        {p.score?.toFixed(1)}
      </div>
    </div>
  );

  const renderStreakRow = (p, idx, color) => (
    <div
      key={idx}
      onClick={() => navigate("/compare", { state: { preselect: p.player_name } })}
      style={{
        display: "grid",
        gridTemplateColumns: "50px 1fr 80px 60px 80px",
        alignItems: "center",
        padding: "12px 18px",
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#132f4c60")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ color: "#94a3b8", fontWeight: 500 }}>{idx + 1}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {p.headshot_href ? (
          <img
            src={p.headshot_href}
            alt={p.player_name}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              border: `1px solid ${color}`,
            }}
          />
        ) : (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#1e293b",
              border: `1px solid ${color}`,
            }}
          />
        )}
        <div style={{ color: "#fff", fontWeight: 600 }}>{p.player_name}</div>
      </div>
      <div style={{ color: "#94a3b8", fontWeight: 500 }}>{p.team}</div>
      <div style={{ color: "#94a3b8", fontWeight: 500 }}>{p.position}</div>
      <div style={{ color, textAlign: "right", fontWeight: 700 }}>
        {Math.abs(p.streak_value || 0).toFixed(1)}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: "#0a1929",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "40px",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#fff",
          marginBottom: "36px",
        }}
      >
        NBA Player Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "30px",
          alignItems: "stretch",
        }}
      >
        {/* Left: Top Players */}
        <section
          style={{
            background: "#0f1824",
            borderRadius: "20px",
            border: "2px solid #1e4976",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            onClick={() => navigate("/rankings")}
            style={{
              background: "linear-gradient(90deg, #132f4c, #0f1824)",
              padding: "18px 24px",
              fontWeight: "700",
              fontSize: "20px",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
          >
            🏆 Top Players
          </div>
          <div
            style={{
              overflowY: "auto",
              flex: 1,
              maxHeight: "850px",
              scrollbarWidth: "thin",
              scrollbarColor: "#2563eb #0f1824",
            }}
          >
            {topPlayers.slice(0, 25).map(renderPlayerRow)}
          </div>
        </section>

        {/* Right: Player Trends */}
        <section
          style={{
            background: "#0f1824",
            borderRadius: "20px",
            border: "2px solid #1e4976",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            onClick={() => navigate("/streaks")}
            style={{
              background: "linear-gradient(90deg, #132f4c, #0f1824)",
              padding: "18px 24px",
              fontWeight: "700",
              fontSize: "20px",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
          >
            📈 Player Trends
          </div>
          <div
            style={{
              overflowY: "auto",
              flex: 1,
              maxHeight: "850px",
              scrollbarWidth: "thin",
              scrollbarColor: "#2563eb #0f1824",
            }}
          >
            <h3 style={{ color: "#ef4444", margin: "16px 18px 8px" }}>🔥 Hot Players</h3>
            {hotPlayers.slice(0, 12).map((p, i) => renderStreakRow(p, i, "#ef4444"))}
            <h3 style={{ color: "#3b82f6", margin: "16px 18px 8px" }}>❄️ Cold Players</h3>
            {coldPlayers.slice(0, 12).map((p, i) => renderStreakRow(p, i, "#3b82f6"))}
          </div>
        </section>
      </div>

      {/* Enhanced Compare Section - Replace your existing compare section with this */}
<section
  style={{
    marginTop: "50px",
    background: "linear-gradient(135deg, #0a1929 0%, #0f1824 50%, #0a1929 100%)",
    borderRadius: "24px",
    border: "2px solid #1e4976",
    overflow: "hidden",
    position: "relative",
  }}
>
  {/* Animated background elements */}
  <div
    style={{
      position: "absolute",
      top: "20%",
      left: "10%",
      width: "300px",
      height: "300px",
      background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
      borderRadius: "50%",
      filter: "blur(60px)",
      animation: "pulse 4s ease-in-out infinite",
    }}
  />
  <div
    style={{
      position: "absolute",
      bottom: "20%",
      right: "10%",
      width: "300px",
      height: "300px",
      background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
      borderRadius: "50%",
      filter: "blur(60px)",
      animation: "pulse 4s ease-in-out infinite 2s",
    }}
  />

  <style>
    {`
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.8; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
    `}
  </style>

  <div
    onClick={() => navigate("/compare")}
    style={{
      background: "linear-gradient(90deg, #132f4c, #0f1824, #132f4c)",
      backgroundSize: "200% 100%",
      padding: "24px 32px",
      fontWeight: "700",
      fontSize: "24px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      position: "relative",
      zIndex: 1,
      borderBottom: "1px solid #1e4976",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundPosition = "100% 0";
      e.currentTarget.style.letterSpacing = "1px";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundPosition = "0% 0";
      e.currentTarget.style.letterSpacing = "0px";
    }}
  >
    <span style={{ display: "inline-block", marginRight: "12px", fontSize: "28px" }}>⚔️</span>
    Compare Players
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "50px",
      padding: "60px 40px",
      flexWrap: "wrap",
      position: "relative",
      zIndex: 1,
    }}
  >
    {/* Player 1 Card */}
    <div
      style={{
        background: "linear-gradient(135deg, #1a2d42 0%, #0f1824 100%)",
        border: "2px solid #2d4a66",
        borderRadius: "20px",
        padding: "32px",
        textAlign: "center",
        width: "340px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(59,130,246,0.3)";
        e.currentTarget.style.borderColor = "#3b82f6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
        e.currentTarget.style.borderColor = "#2d4a66";
      }}
    >
      {/* Player Image */}
      <div
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: "4px solid #3b82f6",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f1824 100%)",
          boxShadow: "0 0 0 4px rgba(59,130,246,0.2)",
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: "60px", filter: "grayscale(100%)", opacity: 0.4 }}>👤</div>
      </div>
      
      <h3
        style={{
          color: "#fff",
          fontSize: "22px",
          fontWeight: "700",
          marginBottom: "8px",
        }}
      >
        Player Name
      </h3>
      
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
        TEAM • POSITION
      </p>

      {/* Overall Score */}
      <div
        style={{
          background: "rgba(30,58,95,0.6)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", marginBottom: "8px", letterSpacing: "1px" }}>
          OVERALL SCORE
        </div>
        <div style={{ color: "#3b82f6", fontSize: "48px", fontWeight: "700", lineHeight: "1" }}>
          --
        </div>
      </div>

      {/* Stats Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
        {["Impact", "Scoring", "Playmaking", "Rebounding", "Discipline", "Defense"].map((stat) => (
          <div key={stat}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "500" }}>{stat}</span>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: "700" }}>--</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "rgba(59,130,246,0.2)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "0%",
                  height: "100%",
                  background: "#3b82f6",
                  borderRadius: "4px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Radar Chart */}
    <div
      style={{
        width: "500px",
        height: "500px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="500" height="500" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: "#1e40af", stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#f97316", stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: "#c2410c", stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>

        {/* Background hexagons */}
        {[100, 80, 60, 40, 20].map((scale, i) => {
          const points = [];
          for (let j = 0; j < 6; j++) {
            const angle = (Math.PI / 3) * j - Math.PI / 2;
            const x = 250 + scale * Math.cos(angle);
            const y = 250 + scale * Math.sin(angle);
            points.push(`${x},${y}`);
          }
          return (
            <polygon
              key={i}
              points={points.join(" ")}
              fill="none"
              stroke="#2d4a66"
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}

        {/* Grid lines from center */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = 250 + 100 * Math.cos(angle);
          const y = 250 + 100 * Math.sin(angle);
          return (
            <line
              key={i}
              x1="250"
              y1="250"
              x2={x}
              y2={y}
              stroke="#2d4a66"
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}

        {/* Labels */}
        {["Impact", "Scoring", "Playmaking", "Rebounding", "Discipline", "Defense"].map((label, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = 250 + 130 * Math.cos(angle);
          const y = 250 + 130 * Math.sin(angle);
          return (
            <text
              key={label}
              x={x}
              y={y}
              fill="#94a3b8"
              fontSize="14"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          );
        })}

        {/* Placeholder data polygons */}
        <polygon
          points="250,200 290,220 280,270 250,290 220,270 210,220"
          fill="url(#blueGradient)"
          stroke="#3b82f6"
          strokeWidth="2"
          opacity="0.7"
        />
        <polygon
          points="250,180 300,230 270,280 250,300 210,260 200,210"
          fill="url(#orangeGradient)"
          stroke="#f97316"
          strokeWidth="2"
          opacity="0.7"
        />
      </svg>
    </div>

    {/* Player 2 Card */}
    <div
      style={{
        background: "linear-gradient(135deg, #2d2419 0%, #0f1824 100%)",
        border: "2px solid #4a3728",
        borderRadius: "20px",
        padding: "32px",
        textAlign: "center",
        width: "340px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(249,115,22,0.3)";
        e.currentTarget.style.borderColor = "#f97316";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
        e.currentTarget.style.borderColor = "#4a3728";
      }}
    >
      {/* Player Image */}
      <div
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: "4px solid #f97316",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5c2d12 0%, #0f1824 100%)",
          boxShadow: "0 0 0 4px rgba(249,115,22,0.2)",
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: "60px", filter: "grayscale(100%)", opacity: 0.4 }}>👤</div>
      </div>
      
      <h3
        style={{
          color: "#fff",
          fontSize: "22px",
          fontWeight: "700",
          marginBottom: "8px",
        }}
      >
        Player Name
      </h3>
      
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
        TEAM • POSITION
      </p>

      {/* Overall Score */}
      <div
        style={{
          background: "rgba(92,45,18,0.6)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", marginBottom: "8px", letterSpacing: "1px" }}>
          OVERALL SCORE
        </div>
        <div style={{ color: "#f97316", fontSize: "48px", fontWeight: "700", lineHeight: "1" }}>
          --
        </div>
      </div>

      {/* Stats Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
        {["Impact", "Scoring", "Playmaking", "Rebounding", "Discipline", "Defense"].map((stat) => (
          <div key={stat}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "500" }}>{stat}</span>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: "700" }}>--</span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "rgba(249,115,22,0.2)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "0%",
                  height: "100%",
                  background: "#f97316",
                  borderRadius: "4px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  <div style={{ textAlign: "center", paddingBottom: "60px", position: "relative", zIndex: 1 }}>
    <button
      onClick={() => navigate("/compare")}
      style={{
        background: "linear-gradient(135deg, #2563eb 0%, #dc2626 100%)",
        border: "none",
        borderRadius: "12px",
        padding: "16px 48px",
        color: "#fff",
        fontWeight: 700,
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(37,99,235,0.4), 0 4px 12px rgba(220,38,38,0.3)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.08) translateY(-2px)";
        e.target.style.boxShadow = "0 12px 36px rgba(37,99,235,0.6), 0 6px 18px rgba(220,38,38,0.5)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1) translateY(0)";
        e.target.style.boxShadow = "0 8px 24px rgba(37,99,235,0.4), 0 4px 12px rgba(220,38,38,0.3)";
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>Start Comparison →</span>
    </button>
  </div>
</section>

</div> )/* closes main dashboard wrapper */}
