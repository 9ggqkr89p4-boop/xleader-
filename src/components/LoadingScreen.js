import React, { useEffect, useState } from "react";

const MESSAGES = ["Connecting to X API","Fetching team data","Calculating rankings","Rendering dashboard"];

export default function LoadingScreen() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(x => (x+1) % MESSAGES.length), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28, background:"#020408" }}>
      <div style={{ fontFamily:"var(--font-display)", fontSize:48, fontWeight:800, background:"linear-gradient(135deg,#00d4ff,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>𝕏</div>
      <div style={{ width:50, height:50, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.06)", borderTop:"2px solid #00d4ff", borderRight:"2px solid #a855f7", animation:"spin 0.9s linear infinite" }} />
      <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"rgba(232,240,254,0.3)", letterSpacing:"0.12em", textTransform:"uppercase" }}>{MESSAGES[i]}...</div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
