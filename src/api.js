const BASE = "/.netlify/functions/twitter";

export async function fetchTeamData() {
  const res = await fetch(`${BASE}?action=team`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "API error");
  return json.team;
}
