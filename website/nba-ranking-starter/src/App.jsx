import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Rankings from "./pages/Rankings.jsx";
import Compare from "./pages/Compare.jsx";
import Streaks from "./pages/Streaks.jsx";
import About from "./pages/About.jsx";   // 👈 import About page

export default function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/streaks" element={<Streaks />} />
        <Route path="/about" element={<About />} /> {/* 👈 new route */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
