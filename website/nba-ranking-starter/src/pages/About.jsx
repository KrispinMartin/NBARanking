import React from "react";
export default function About() {
  return (
    <div className="page container">
      <h1>About Our NBA Ranking Project</h1>

      <div className="panel" style={{ marginBottom: "20px" }}>
        <h3>Project Overview</h3>
        <p className="muted">
          This ranking system was created to provide basketball fans with a clear,
          data-driven way to track player performance. Instead of relying only on
          traditional box score stats, our system highlights trends, hot and cold streaks,
          and comparisons to help fans and analysts get a deeper perspective on the game.
        </p>
      </div>

      <div className="panel">
        <h3>Our Team</h3>
        <p className="muted">We are four students passionate about data, sports, and technology:</p>

        <div className="grid grid-4" style={{ marginTop: "16px" }}>
          <div className="panel" style={{ textAlign: "center" }}>
            <div className="avatar" style={{ margin: "0 auto 12px" }} />
            <h4>Student One</h4>
            <p className="muted">Frontend Developer</p>
          </div>

          <div className="panel" style={{ textAlign: "center" }}>
            <div className="avatar" style={{ margin: "0 auto 12px" }} />
            <h4>Student Two</h4>
            <p className="muted">Data Scientist</p>
          </div>

          <div className="panel" style={{ textAlign: "center" }}>
            <div className="avatar" style={{ margin: "0 auto 12px" }} />
            <h4>Student Three</h4>
            <p className="muted">Backend Developer</p>
          </div>

          <div className="panel" style={{ textAlign: "center" }}>
            <div className="avatar" style={{ margin: "0 auto 12px" }} />
            <h4>Student Four</h4>
            <p className="muted">Project Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
