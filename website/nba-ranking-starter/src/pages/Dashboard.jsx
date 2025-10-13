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

      {/* Compare Section */}
      <section
        style={{
          marginTop: "50px",
          background: "#0f1824",
          borderRadius: "20px",
          border: "2px solid #1e4976",
          paddingBottom: "50px",
        }}
      >
        <div
          onClick={() => navigate("/compare")}
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
          ⚔️ Compare Players
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "60px",
            padding: "60px 20px",
            flexWrap: "wrap",
          }}
        >
          {/* Placeholder Player 1 */}
          <div
            style={{
              background: "linear-gradient(135deg, #1a2332 0%, #0f1824 100%)",
              border: "2px dashed #3b82f6",
              borderRadius: "16px",
              padding: "32px 24px",
              textAlign: "center",
              width: "280px",
              minHeight: "520px",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "2px dashed #3b82f6",
                margin: "0 auto 16px",
              }}
            />
            <h3 style={{ color: "#3b82f6", fontSize: "20px", fontWeight: "600" }}>PLAYER 1</h3>
            <p style={{ color: "#94a3b8", marginTop: "8px" }}>
              TEAM: -- | POS: -- | SCORE: --
            </p>
          </div>

          {/* Mock Radar Chart */}
          <div
            style={{
              width: "520px",
              height: "480px",
              background:
                "radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, rgba(249,115,22,0.1) 100%)",
              border: "2px solid #2d3e52",
              borderRadius: "20px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#94a3b8",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Statistical Comparison
            </div>
          </div>

          {/* Placeholder Player 2 */}
          <div
            style={{
              background: "linear-gradient(135deg, #1a2332 0%, #0f1824 100%)",
              border: "2px dashed #f97316",
              borderRadius: "16px",
              padding: "32px 24px",
              textAlign: "center",
              width: "280px",
              minHeight: "520px",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "2px dashed #f97316",
                margin: "0 auto 16px",
              }}
            />
            <h3 style={{ color: "#f97316", fontSize: "20px", fontWeight: "600" }}>PLAYER 2</h3>
            <p style={{ color: "#94a3b8", marginTop: "8px" }}>
              TEAM: -- | POS: -- | SCORE: --
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/compare")}
            style={{
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
              border: "none",
              borderRadius: "8px",
              padding: "12px 28px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 0 12px rgba(37,99,235,0.4)",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 0.85)}
            onMouseLeave={(e) => (e.target.style.opacity = 1)}
          >
            
          </button>
        </div>
      </section>
    </div>
  );
}
