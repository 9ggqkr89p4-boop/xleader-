import React from "react";

const METRICS = [
  { key:"posts",       label:"Total Posts",   color:"#00d4ff" },
  { key:"likes",       label:"Total Likes",   color:"#ec4899" },
  { key:"comments",    label:"Total Replies", color:"#a855f7" },
  { key:"reposts",     label:"Reposts",       color:"#22c55e" },
  { key:"impressions", label:"Impressions",   color:"#f59e0b" },
];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
  return String(n);
}

function sum(team, period, key) {
  return team.reduce((acc, m) => acc + (m.stats?.[period]?.[key] || 0), 0);
}

export default function SummaryBar({ team, period }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
      {METRICS.map((m, i) => (
        <div key={m.key} style={{ background:"#0a1628", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:m.color, opacity:0.6 }} />
          <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(232,240,254,0.3)", marginBottom:10 }}>{m.label}</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:800, letterSpacing:"-0.03em", color:"var(--text-primary)", lineHeight:1 }}>{fmt(sum(team, period, m.key))}</div>
          <div style={{ fontSize:11, color:"rgba(232,240,254,0.3)", marginTop:5, fontFamily:"var(--font-mono)" }}>across {team.length} members</div>
        </div>
      ))}
    </div>
  );
}
