import React from "react";

const PERIODS = [
  { id:"daily",   label:"Daily"    },
  { id:"weekly",  label:"Weekly"   },
  { id:"monthly", label:"Monthly"  },
  { id:"overall", label:"All Time" },
];

export default function PeriodTabs({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:6, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:4, width:"fit-content" }}>
      {PERIODS.map(p => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          style={{
            padding:"8px 18px",
            borderRadius:9,
            fontFamily:"var(--font-display)",
            fontSize:13,
            fontWeight:600,
            cursor:"pointer",
            border: value===p.id ? "1px solid rgba(0,212,255,0.25)" : "1px solid transparent",
            background: value===p.id ? "linear-gradient(135deg,rgba(0,212,255,0.15),rgba(168,85,247,0.15))" : "transparent",
            color: value===p.id ? "#fff" : "rgba(232,240,254,0.3)",
            transition:"all 0.2s"
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
