import React from "react";
import { NavLink } from 'react-router-dom'
import Logo from '../assets/logo.svg'   // your basketball logo

export default function NavBar() {
  const link = ({ isActive }) => 'tab' + (isActive ? ' active' : '')

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={Logo} alt="NBA Ranking" className="brand-img" />
          </NavLink>
        </div>

        <div className="tabs">
          <NavLink to="/" className={link} end>Home</NavLink>
          <NavLink to="/rankings" className={link}>Rankings</NavLink>
          <NavLink to="/compare" className={link}>Compare</NavLink>
          <NavLink to="/streaks" className={link}>Trends</NavLink>
          <NavLink to="/about" className={link}>About</NavLink> {/* 👈 now points to your About page */}
        </div>
      </div>
    </nav>
  )
}
