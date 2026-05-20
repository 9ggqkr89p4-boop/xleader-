import React, { useState } from "react";

export default function Header({ lastRefresh, onRefresh, isDemoMode }) {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    setSpinning(true);
    await onRefresh();
    setTimeout(() => setSpinning(false), 1000);
  };

  const timeStr = lastRefresh
    ? lastRefresh.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })
    : "—";

  return (
    <header style={{ position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)", background:"rgba(2,4,8,0.85)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth:1440, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#00d4ff,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#000" }}>𝕏</div>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:800, color:"var(--text-primary)" }}>Team Analytics</div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase" }}>CEO Dashboard · 10 Members</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {isDemoMode ? (
            <div style={{ background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:6, padding:"4px 10px", fontFamily:"var(--font-mono)", fontSize:10, color:"#f59e0b" }}>DEMO MODE</div>
          ) : (
            <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:6, padding:"4px 10px", fontFamily:"var(--font-mono)", fontSize:10, color:"#22c55e", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
              LIVE
            </div>
          )}
          <div style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>Updated {timeStr}</div>
          <button onClick={handleRefresh} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"var(--text-secondary)", fontFamily:"var(--font-mono)", fontSize:12, cursor:"pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={spinning ? { animation:"spin 1s linear infinite" } : {}}>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </header>
  );
}
