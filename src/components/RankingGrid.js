import React from "react";

const MEDALS = ["🥇","🥈","🥉"];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
  return String(n);
}

export default function RankingGrid({ members, period, onSelect }) {
  const maxScore = members.reduce((max, m) => {
    const s = m.stats?.[period];
    if (!s) return max;
    return Math.max(max, s.likes*2 + s.comments*3 + s.posts);
  }, 1);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
      {members.map((m, i) => {
        const s = m.stats?.[period] || {};
        const score = (s.likes||0)*2 + (s.comments||0)*3 + (s.posts||0);
        const pct = Math.round((score/maxScore)*100);
        const rank = i+1;
        const initials = m.profile.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

        return (
          <div
            key={m.profile.username}
            onClick={() => onSelect(m)}
            style={{ background:"#0a1628", border:`1px solid rgba(255,255,255,0.06)`, borderRadius:18, padding:22, cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=m.color+"50"; e.currentTarget.style.transform="translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.transform="translateY(0)"; }}
          >
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:m.color, opacity: rank<=3 ? 0.9 : 0.35 }} />
            <div style={{ position:"absolute", top:14, right:14, fontFamily:"var(--font-mono)", fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:6, background: rank===1?"linear-gradient(135deg,#FFD700,#FFA500)": rank===2?"linear-gradient(135deg,#C0C0C0,#909090)": rank===3?"linear-gradient(135deg,#CD7F32,#8B4513)":"rgba(255,255,255,0.06)", color: rank<=3?"#000":"rgba(232,240,254,0.3)" }}>
              {rank<=3 ? MEDALS[rank-1] : `#${rank}`}
            </div>

            <div style={{ position:"relative", width:60, height:60, marginBottom:14 }}>
              <div style={{ position:"absolute", inset:-4, borderRadius:"50%", border:`2px solid ${m.color}${rank<=3?"80":"40"}`, boxShadow: rank<=3?`0 0 12px ${m.color}40`:"none" }} />
              <img
                src={m.profile.profile_image_url?.replace("_normal","_bigger") || ""}
                alt={m.profile.name}
                style={{ width:60, height:60, borderRadius:"50%", objectFit:"cover", border:`2px solid ${m.color}60`, display:"block", background:"#060d18" }}
                onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
              />
              <div style={{ width:60, height:60, borderRadius:"50%", background:`${m.color}20`, border:`2px solid ${m.color}60`, display:"none", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:m.color }}>{initials}</div>
            </div>

            <div style={{ fontFamily:"var(--font-display)", fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.profile.name}</div>
            <a href={`https://x.com/${m.profile.username}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ fontFamily:"var(--font-mono)", fontSize:11, color:m.color, display:"block", marginBottom:14, opacity:0.8 }}>@{m.profile.username}</a>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[["posts",s.posts,"#00d4ff","Posts"],["likes",s.likes,"#ec4899","Likes"],["comments",s.comments,"#a855f7","Replies"],["reposts",s.reposts,"#22c55e","Reposts"]].map(([key,val,color,label]) => (
                <div key={key} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:800, color, letterSpacing:"-0.02em", lineHeight:1 }}>{fmt(val)}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(232,240,254,0.3)", marginTop:3 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:12, height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:m.color, borderRadius:2 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
