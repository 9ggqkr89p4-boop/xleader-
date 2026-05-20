const BEARER = “AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe”;
let teamData = [];
let enrichedData = [];

// ── helpers ──────────────────────────────────────────────
function escapeHtml(str) {
if (!str) return ‘’;
return str.replace(/[&<>”’]/g, m => ({’&’:’&’,’<’:’<’,’>’:’>’,’”’:’"’,”’”:’'’}[m]));
}
function formatNumber(n) {
n = n || 0;
return n > 999999 ? (n/1000000).toFixed(1)+‘M’ : n > 999 ? (n/1000).toFixed(1)+‘K’ : String(n);
}

// ── fetch from our Netlify function ──────────────────────
async function fetchUsers() {
try {
const res = await fetch(’/.netlify/functions/xapi’);
if (!res.ok) throw new Error(’API fail ’ + res.status);
const json = await res.json();
if (json.data) return json.data;
throw new Error(JSON.stringify(json));
} catch (e) {
console.warn(‘fetchUsers error:’, e);
return null;
}
}

// ── build real engagement from tweets array ───────────────
function buildEngagement(user) {
const tweets = user.tweets || [];
const now = Date.now();
const DAY   = 86400000;
const WEEK  = 7   * DAY;
const MONTH = 30  * DAY;

function sum(arr, field) { return arr.reduce((s, t) => s + (t[field] || 0), 0); }

function period(ms) {
const cutoff = new Date(now - ms).toISOString();
return tweets.filter(t => t.created_at >= cutoff);
}

function stats(arr) {
return {
posts:    arr.length,
likes:    sum(arr, ‘like_count’),
comments: sum(arr, ‘reply_count’),
reposts:  sum(arr, ‘retweet_count’),
get score() { return this.posts*5 + this.likes*2 + this.comments*3 + this.reposts*4; }
};
}

// All-time uses real API counters
const m = user.public_metrics || {};
const alltimePosts    = m.tweet_count    || 0;
const alltimeFollowers= m.followers_count|| 0;
const alltimeLikes    = sum(tweets, ‘like_count’);
const alltimeComments = sum(tweets, ‘reply_count’);
const alltimeReposts  = sum(tweets, ‘retweet_count’);

return {
daily:   stats(period(DAY)),
weekly:  stats(period(WEEK)),
monthly: stats(period(MONTH)),
alltime: {
posts:    alltimePosts,
likes:    alltimeLikes,
comments: alltimeComments,
reposts:  alltimeReposts,
followers:alltimeFollowers,
get score() { return this.posts*5 + this.likes*2 + this.comments*3 + this.reposts*4; }
}
};
}

// ── enrich team ──────────────────────────────────────────
function enrichAll(users) {
return users.map(u => ({ …u, engagement: buildEngagement(u) }));
}

// ── overall stats ────────────────────────────────────────
function renderOverallStats() {
const totFollowers = enrichedData.reduce((s,u) => s + (u.public_metrics?.followers_count||0), 0);
const totLikes     = enrichedData.reduce((s,u) => s + u.engagement.alltime.likes, 0);
const totComments  = enrichedData.reduce((s,u) => s + u.engagement.alltime.comments, 0);
const totReposts   = enrichedData.reduce((s,u) => s + u.engagement.alltime.reposts, 0);

document.getElementById(‘alltimeStats’).innerHTML = `<div class="stat-brick"><div class="stat-number">${formatNumber(totFollowers)}</div><div class="stat-label">TOTAL FOLLOWERS</div></div> <div class="stat-brick"><div class="stat-number">${formatNumber(totLikes)}</div><div class="stat-label">LIKES (24H TWEETS)</div></div> <div class="stat-brick"><div class="stat-number">${formatNumber(totComments)}</div><div class="stat-label">COMMENTS (24H)</div></div> <div class="stat-brick"><div class="stat-number">${formatNumber(totReposts)}</div><div class="stat-label">REPOSTS (24H)</div></div>`;

const dPosts    = enrichedData.reduce((s,u) => s + u.engagement.daily.posts,    0);
const dLikes    = enrichedData.reduce((s,u) => s + u.engagement.daily.likes,    0);
const dComments = enrichedData.reduce((s,u) => s + u.engagement.daily.comments, 0);
const dReposts  = enrichedData.reduce((s,u) => s + u.engagement.daily.reposts,  0);

document.getElementById(‘dailyOverall’).innerHTML = `<div class="daily-title">⚡ TEAM DAILY METRICS (REAL DATA)</div> <div class="daily-grid"> <div class="daily-metric"><div class="daily-value">+${dPosts}</div><div class="stat-label">POSTS TODAY</div></div> <div class="daily-metric"><div class="daily-value">+${dLikes}</div><div class="stat-label">LIKES TODAY</div></div> <div class="daily-metric"><div class="daily-value">+${dComments}</div><div class="stat-label">COMMENTS</div></div> <div class="daily-metric"><div class="daily-value">+${dReposts}</div><div class="stat-label">REPOSTS</div></div> </div>`;
}

// ── ranking ───────────────────────────────────────────────
function getRanking(periodKey) {
return […enrichedData].sort((a,b) => b.engagement[periodKey].score - a.engagement[periodKey].score);
}

function renderRanking(periodKey, containerId) {
const sorted = getRanking(periodKey);
const container = document.getElementById(containerId);
if (!container) return;
container.innerHTML = ‘’;
const topScore = sorted[0]?.engagement[periodKey].score || 1;

sorted.forEach((user, idx) => {
const eng = user.engagement[periodKey];
const rankClass = idx===0?‘rank-1’:idx===1?‘rank-2’:idx===2?‘rank-3’:’’;
const avatarUrl = user.profile_image_url?.replace(’_normal’,’_bigger’) || ‘’;
const name = user.name || user.username;
const card = document.createElement(‘div’);
card.className = `rank-card ${rankClass}`;
card.onclick = () => openProfileModal(user, periodKey);
card.innerHTML = `<div class="card-inner"> <div class="rank-number">${idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'#'+(idx+1)}</div> <div class="avatar"> ${avatarUrl ?`<img src="${avatarUrl}" onerror="this.style.display='none'" />`:`<div class="avatar-fallback">${escapeHtml(name[0])}</div>`} </div> <div class="user-info"> <div class="user-name">${escapeHtml(name)}</div> <div class="user-handle">@${user.username}</div> <a href="https://x.com/${user.username}" target="_blank" style="font-size:9px;color:var(--accent-cyan);text-decoration:none;" onclick="event.stopPropagation()">↗ X profile</a> </div> <div class="engagement-stats"> <div class="stat-badge"><div class="number">${eng.posts}</div><div class="label">📝 Posts</div></div> <div class="stat-badge"><div class="number">${formatNumber(eng.likes)}</div><div class="label">❤️ Likes</div></div> <div class="stat-badge"><div class="number">${formatNumber(eng.comments)}</div><div class="label">💬 Comments</div></div> <div class="stat-badge"><div class="number">${formatNumber(eng.reposts)}</div><div class="label">🔄 Reposts</div></div> <div class="score-pill">${formatNumber(eng.score)} pts</div> </div> </div> <div class="progress-bar"> <div class="progress-fill" style="width:${Math.min(100,Math.round((eng.score/topScore)*100))}%"></div> </div>`;
container.appendChild(card);
});
}

// ── awards ────────────────────────────────────────────────
function renderAwards() {
const periods = [‘daily’,‘weekly’,‘monthly’,‘alltime’];
const periodLabels = { daily:‘Daily’, weekly:‘Weekly’, monthly:‘Monthly’, alltime:‘All-Time’ };
const periodIcons  = { daily:‘🏅’, weekly:‘⚡’, monthly:‘🌟’, alltime:‘👑’ };

const periodWinners = periods.map(p => {
const sorted = getRanking(p);
return sorted[0] ? { period:p, winner:sorted[0], score:sorted[0].engagement[p].score } : null;
}).filter(Boolean);

const byAlltime = k => […enrichedData].sort((a,b) => b.engagement.alltime[k] - a.engagement.alltime[k])[0];
const mostLiked    = byAlltime(‘likes’);
const mostReposted = byAlltime(‘reposts’);
const mostComments = byAlltime(‘comments’);
const mostPosts    = […enrichedData].sort((a,b)=>(b.public_metrics?.tweet_count||0)-(a.public_metrics?.tweet_count||0))[0];
const mostFollowed = […enrichedData].sort((a,b)=>(b.public_metrics?.followers_count||0)-(a.public_metrics?.followers_count||0))[0];

const extraAwards = [
{ icon:‘❤️’, title:‘Most Liked (24h tweets)’,   winner:mostLiked,    value:formatNumber(mostLiked?.engagement.alltime.likes||0),    suffix:‘likes’ },
{ icon:‘🔁’, title:‘Most Reposted (24h tweets)’,winner:mostReposted, value:formatNumber(mostReposted?.engagement.alltime.reposts||0),suffix:‘reposts’ },
{ icon:‘💬’, title:‘Most Comments (24h tweets)’,winner:mostComments, value:formatNumber(mostComments?.engagement.alltime.comments||0),suffix:‘comments’ },
{ icon:‘📝’, title:‘Most Posts (All-Time)’,      winner:mostPosts,    value:formatNumber(mostPosts?.public_metrics?.tweet_count||0),  suffix:‘posts’ },
{ icon:‘👥’, title:‘Most Followers’,             winner:mostFollowed, value:formatNumber(mostFollowed?.public_metrics?.followers_count||0), suffix:‘followers’ },
];

document.getElementById(‘awardsContainer’).innerHTML = ` <div style="grid-column:1/-1;margin-bottom:.5rem"><h3 style="color:var(--gold)">🏅 Period Winners</h3></div> ${periodWinners.map(aw=>`
<div class="award-card">
<div style="font-size:2rem">${periodIcons[aw.period]}</div>
<div><strong>${escapeHtml(aw.winner.name||aw.winner.username)}</strong><br>
<span style="font-size:.7rem">Top ${periodLabels[aw.period]} · ${formatNumber(aw.score)} pts</span></div>
</div>`).join('')} <div style="grid-column:1/-1;margin:1rem 0 .5rem"><h3 style="color:var(--accent-cyan)">🏆 Special Awards</h3></div> ${extraAwards.map(aw=>`
<div class="award-card">
<div style="font-size:2rem">${aw.icon}</div>
<div><strong>${escapeHtml(aw.winner?.name||aw.winner?.username||’—’)}</strong><br>
<span style="font-size:.7rem">${aw.title}<br>${aw.value} ${aw.suffix}</span></div>
</div>`).join('')} `;
}

// ── profile modal ────────────────────────────────────────
function openProfileModal(user, activePeriod) {
const tweets  = user.tweets || [];
const allEng  = user.engagement;
const avatarUrl = user.profile_image_url?.replace(’_normal’,’_bigger’) || ‘’;
const name    = user.name || user.username;
const periods = [‘daily’,‘weekly’,‘monthly’,‘alltime’];
const pLabels = { daily:‘Daily’, weekly:‘Weekly’, monthly:‘Monthly’, alltime:‘All-Time’ };

const periodCardsHtml = periods.map(p => {
const eng = allEng[p];
return ` <div class="period-card"> <div class="period-title">${pLabels[p]}</div> <div class="period-stat-row"> <span>📝 ${eng.posts}</span> <span>❤️ ${formatNumber(eng.likes)}</span> <span>💬 ${formatNumber(eng.comments)}</span> <span>🔄 ${formatNumber(eng.reposts)}</span> </div> </div>`;
}).join(’’);

let postsHtml = ‘’;
let todayPosts = 0, todayLikes = 0, todayComments = 0, todayReposts = 0;
const todayStr = new Date().toISOString().slice(0,10);

if (tweets.length) {
tweets.forEach(t => {
const isToday = t.created_at?.slice(0,10) === todayStr;
if (isToday) {
todayPosts++;
todayLikes    += t.like_count    || 0;
todayComments += t.reply_count   || 0;
todayReposts  += t.retweet_count || 0;
}
const isRT = t.text?.startsWith(‘RT @’);
postsHtml += `<div class="post-item"> <div style="font-size:.65rem;color:var(--text-muted);margin-bottom:4px"> ${isRT ? '🔁 REPOST' : '📝 POST'} · ${t.created_at ? new Date(t.created_at).toLocaleString() : ''} </div> <div class="post-text">${escapeHtml(t.text)}</div> ${t.media_url ?`<img class="post-img" src="${t.media_url}" onerror="this.style.display='none'" />` : ''} <div class="post-engagement"> ❤️ ${formatNumber(t.like_count||0)} &nbsp;·&nbsp; 💬 ${formatNumber(t.reply_count||0)} &nbsp;·&nbsp; 🔁 ${formatNumber(t.retweet_count||0)} <a href="${t.tweet_url}" target="_blank" style="margin-left:auto;color:var(--gold);font-size:.65rem;text-decoration:none">↗ View</a> </div> </div>`;
});
} else {
postsHtml = ‘<div style="padding:1rem;text-align:center;color:var(--text-muted)">📭 No posts in last 24h.</div>’;
}

const summaryHtml = todayPosts > 0 ? ` <div class="today-summary"> <strong>📅 Today's Summary</strong><br> 📝 ${todayPosts} posts &nbsp;|&nbsp; ❤️ ${formatNumber(todayLikes)} likes &nbsp;|&nbsp; 💬 ${formatNumber(todayComments)} comments &nbsp;|&nbsp; 🔁 ${formatNumber(todayReposts)} reposts </div>` : ‘’;

document.getElementById(‘modalDynamic’).innerHTML = `<div style="padding:1rem"> <div style="display:flex;gap:16px;align-items:center;margin-bottom:1rem"> <div class="avatar" style="width:70px;height:70px;border-color:var(--gold)"> ${avatarUrl ?`<img src="${avatarUrl}" onerror="this.style.display='none'" />`:`<div class="avatar-fallback">${escapeHtml(name[0])}</div>`} </div> <div> <h2>${escapeHtml(name)}</h2> <div style="color:var(--text-muted)">@${user.username}</div> <div style="font-size:.8rem;color:var(--gold);margin-top:4px"> ${formatNumber(user.public_metrics?.followers_count||0)} followers · ${formatNumber(user.public_metrics?.tweet_count||0)} total posts </div> </div> </div> ${user.description ? `<div style="font-size:.8rem;color:var(--text-muted);margin-bottom:1rem;padding:.6rem;background:rgba(255,255,255,.03);border-radius:12px">${escapeHtml(user.description)}</div>` : ''} <h4 style="margin:.8rem 0 .5rem">📊 Engagement Breakdown</h4> <div class="period-stats-grid">${periodCardsHtml}</div> <h4 style="margin:.8rem 0 .5rem">📝 Last 24h Posts (${tweets.length})</h4> <div class="post-list">${postsHtml}</div> ${summaryHtml} <a href="https://x.com/${user.username}" target="_blank" style="display:block;margin:1rem 0;text-align:center;color:var(--gold);text-decoration:none"> 🔗 Visit @${user.username} on X </a> </div>`;

document.getElementById(‘profileModal’).classList.add(‘open’);
}

// ── tab switching ────────────────────────────────────────
function switchTab(period) {
document.querySelectorAll(’.ranking-panel’).forEach(p => p.classList.remove(‘active-panel’));
document.querySelectorAll(’.tab-btn’).forEach(b => b.classList.remove(‘active’));
const panelMap = { daily:‘dailyPanel’, weekly:‘weeklyPanel’, monthly:‘monthlyPanel’, alltime:‘alltimePanel’, awards:‘awardsPanel’ };
const el = document.getElementById(panelMap[period]);
if (el) el.classList.add(‘active-panel’);
const btn = […document.querySelectorAll(’.tab-btn’)].find(b => b.dataset.period === period);
if (btn) btn.classList.add(‘active’);
}

function refreshAllData() {
if (!teamData.length) return;
enrichedData = enrichAll(teamData);
renderOverallStats();
renderRanking(‘daily’,   ‘dailyRankList’);
renderRanking(‘weekly’,  ‘weeklyPanel’);
renderRanking(‘monthly’, ‘monthlyPanel’);
renderRanking(‘alltime’, ‘alltimePanel’);
renderAwards();
}

// ── init ─────────────────────────────────────────────────
async function init() {
document.getElementById(‘dailyRankList’).innerHTML =
‘<div style="padding:2rem;text-align:center;color:var(--text-muted)">⏳ Loading live data from X…</div>’;

const users = await fetchUsers();
if (users && users.length) {
teamData    = users;
enrichedData = enrichAll(teamData);
renderOverallStats();
renderRanking(‘daily’,   ‘dailyRankList’);
renderRanking(‘weekly’,  ‘weeklyPanel’);
renderRanking(‘monthly’, ‘monthlyPanel’);
renderRanking(‘alltime’, ‘alltimePanel’);
renderAwards();
} else {
document.getElementById(‘dailyRankList’).innerHTML =
‘<div style="padding:2rem;color:#f43f5e">⚠️ Failed to load data. Check Netlify function logs.</div>’;
}
}

// ── event listeners ──────────────────────────────────────
document.querySelectorAll(’.tab-btn’).forEach(btn => {
btn.addEventListener(‘click’, () => switchTab(btn.dataset.period));
});
document.getElementById(‘closeModalBtn’)?.addEventListener(‘click’, () =>
document.getElementById(‘profileModal’).classList.remove(‘open’));
document.getElementById(‘profileModal’)?.addEventListener(‘click’, e => {
if (e.target === document.getElementById(‘profileModal’))
document.getElementById(‘profileModal’).classList.remove(‘open’);
});
document.getElementById(‘refreshDataBtn’)?.addEventListener(‘click’, async () => {
const users = await fetchUsers();
if (users && users.length) { teamData = users; refreshAllData(); }
});

init();
setInterval(async () => {
const users = await fetchUsers();
if (users && users.length) { teamData = users; refreshAllData(); }
}, 3600000); // auto-refresh every 1 hour