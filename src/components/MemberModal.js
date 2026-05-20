import React, { useState, useEffect } from "react";

function fmt(n) { if(!n)return"0"; if(n>=1000)return`${(n/1000).toFixed(1)}K`; return String(n); }
function timeAgo(d) { const diff=Date.now()-new Date(d).getTime(); const m=Math.floor(diff/60000); if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return`${Math.floor(h/24)}d ago`; }

const TABS = ["daily","weekly","monthly","overall"];
const TAB_LABELS = { daily:"Today", weekly:"This Week", monthly:"This Month", overall:"All Time" };

export default function MemberModal({ member, period, onClose }) {
  const [tab, setTab] = useState(period);
  const { profile, stats, tweets, color } = member;
  const s = stats?.[tab] || {};
  const tw = tweets?.[tab] || [];
  const initials = profile.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  useEffect(() => {
    const handler = e => { if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(2,4,8,0.88)", backdropFilter:"blur(10px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#0a1628", border:`1px solid ${color}40`, borderRadius:22, width:"100%", maxWidth:740, maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:`0 30px 80px ${color}20`, position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${color},${color}60,transparent)` }} />

        {/* Header */}
        <div style={{ padding:"28px 30px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"flex-start", gap:18, position:"relative" }}>
          <img
            src={profile.profile_image_url?.replace("_normal","_bigger")||""}
            alt={profile.name}
            onClick={()=>window.open(`https://x.com/${profile.username}`,"_blank")}
            style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", border:`3px solid ${color}`, flexShrink:0, cursor:"pointer" }}
            onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}
          />
          <div style={{ width:72, height:72, borderRadius:"50%", background:`${color}20`, border:`3px solid ${color}`, display:"none", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:26, fontWeight:800, color, flexShrink:0 }}>{initials}</div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color:"var(--text-primary)", marginBottom:2 }}>{profile.name}</div>
            <a href={`https://x.com/${profile.username}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily:"var(--font-mono)", fontSize:13, color, display:"block", marginBottom:8 }}>@{profile.username}</a>
            {profile.description && <div style={{ fontSize:13, color:"rgba(232,240,254,0.55)", marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.description}</div>}
            <div style={{ display:"flex", gap:14, fontFamily:"var(--font-mono)", fontSize:11, color:"rgba(232,240,254,0.3)" }}>
              <span><strong style={{color:"rgba(232,240,254,0.55)"}}>{fmt(profile.public_metrics?.followers_count)}</strong> Followers</span>
              <span><strong style={{color:"rgba(232,240,254,0.55)"}}>{fmt(profile.public_metrics?.following_count)}</strong> Following</span>
              <span><strong style={{color:"rgba(232,240,254,0.55)"}}>{fmt(profile.public_metrics?.tweet_count)}</strong> Tweets</span>
            </div>
          </div>

          <button onClick={onClose} style={{ position:"absolute", top:20, right:20, width:34, height:34, borderRadius:9, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.06)", color:"rgba(232,240,254,0.55)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>

        {/* Period tabs */}
        <div style={{ display:"flex", padding:"14px 30px 0", gap:4, borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,0,0,0.2)" }}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 16px 10px", fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color: tab===t?color:"rgba(232,240,254,0.3)", borderBottom: tab===t?`2px solid ${color}`:"2px solid transparent", cursor:"pointer", background:"none", border:"none", borderBottom: tab===t?`2px solid ${color}`:"2px solid transparent" }}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {[["posts",s.posts,color,"Posts"],["likes",s.likes,"#ec4899","Likes"],["comments",s.comments,"#a855f7","Replies"],["reposts",s.reposts,"#22c55e","Reposts"]].map(([key,val,c,label],i) => (
            <div key={key} style={{ padding:"18px 22px", borderRight: i<3?"1px solid rgba(255,255,255,0.06)":"none" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, color:c, letterSpacing:"-0.03em" }}>{fmt(val)}</div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(232,240,254,0.3)", marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tweet feed */}
        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
          {tw.length===0 ? (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(232,240,254,0.3)", fontFamily:"var(--font-mono)", fontSize:13 }}>No posts found for {TAB_LABELS[tab].toLowerCase()}</div>
          ) : tw.map(t => (
            <div key={t.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:14, lineHeight:1.55, color:"var(--text-primary)", marginBottom:10 }}>{t.text}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"rgba(232,240,254,0.3)" }}>{timeAgo(t.created_at)}</div>
                <div style={{ display:"flex", gap:14 }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"rgba(232,240,254,0.55)" }}>♥ <span style={{color:"#ec4899",fontWeight:600}}>{fmt(t.public_metrics?.like_count)}</span></span>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"rgba(232,240,254,0.55)" }}>💬 <span style={{color:"#a855f7",fontWeight:600}}>{fmt(t.public_metrics?.reply_count)}</span></span>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"rgba(232,240,254,0.55)" }}>🔁 <span style={{color:"#22c55e",fontWeight:600}}>{fmt(t.public_metrics?.retweet_count)}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
