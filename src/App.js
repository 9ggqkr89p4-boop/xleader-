import React, { useState, useEffect, useCallback } from "react";
import { fetchTeamData } from "./api";
import { generateMockTeam } from "./mockData";
import Header from "./components/Header";
import PeriodTabs from "./components/PeriodTabs";
import SummaryBar from "./components/SummaryBar";
import RankingGrid from "./components/RankingGrid";
import MemberModal from "./components/MemberModal";
import ChartSection from "./components/ChartSection";
import LoadingScreen from "./components/LoadingScreen";

const COLORS = ["#00d4ff","#ff6b35","#a855f7","#22c55e","#f59e0b","#ec4899","#14b8a6","#f97316","#818cf8","#84cc16"];

export default function App() {
  const [team, setTeam] = useState([]);
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const raw = await fetchTeamData();
      setTeam(raw.map((m, i) => ({ ...m, color: COLORS[i] })));
      setIsDemoMode(false);
    } catch (err) {
      setTeam(generateMockTeam());
      setIsDemoMode(true);
      setError(err.message);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const id = setInterval(() => loadData(false), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loadData]);

  const ranked = [...team].sort((a, b) => {
    const sa = a.stats?.[period];
    const sb = b.stats?.[period];
    if (!sa || !sb) return 0;
    return (sb.likes * 2 + sb.comments * 3 + sb.posts) - (sa.likes * 2 + sa.comments * 3 + sa.posts);
  });

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <Header lastRefresh={lastRefresh} onRefresh={loadData} isDemoMode={isDemoMode} />
      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px" }}>
        {isDemoMode && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "16px 20px", margin: "20px 0", fontFamily: "var(--font-mono)", fontSize: 13, color: "#fca5a5" }}>
            ⚠ Demo Mode — Add X_BEARER_TOKEN in Netlify → Site settings → Environment variables
          </div>
        )}
        <div style={{ marginTop: 32 }}><PeriodTabs value={period} onChange={setPeriod} /></div>
        <div style={{ marginTop: 24 }}><SummaryBar team={ranked} period={period} /></div>
        <div style={{ marginTop: 40 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 20 }}>Team Rankings</div>
          <RankingGrid members={ranked} period={period} onSelect={setSelected} />
        </div>
        <div style={{ marginTop: 40 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 20 }}>Analytics Overview</div>
          <ChartSection members={ranked} period={period} />
        </div>
      </main>
      {selected && <MemberModal member={selected} period={period} onClose={() => setSelected(null)} />}
    </div>
  );
}
