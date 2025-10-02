import React from "react";
export default function StatPill({label, value}){
  return <div className="kpi">
    <div className="muted" style={{fontSize:12, letterSpacing:'.5px', textTransform:'uppercase', fontWeight:800}}>{label}</div>
    <div className="value">{value}</div>
    <div className="muted subtle">Placeholder • will update with live data</div>
  </div>
}
