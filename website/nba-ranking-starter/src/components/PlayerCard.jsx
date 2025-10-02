import React from "react";
export default function PlayerCard({name='Player Name', team='TEAM', footer=''}){
  return (
    <div className="panel" style={{display:'grid', gap:12}}>
      <div className="row">
        <div className="avatar" />
        <div>
          <div style={{fontWeight:800}}>{name}</div>
          <div className="muted" style={{fontSize:12}}>{team}</div>
        </div>
      </div>
      <div className="skeleton" />
      <div className="row" style={{justifyContent:'space-between'}}>
        <span className="muted"></span>
        <span className="badge up">{footer || '+0'}</span>
      </div>
    </div>
  )
}
