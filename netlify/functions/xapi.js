<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>𝕏 News Team — Command Center</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<style>
:root{
--bg:#03030f;--bg2:#060614;--s1:#0a0a1e;--s2:#0d0d24;
--border:#161630;--border2:#20203a;
--gold:#f6c90e;--gold2:#ffe566;--goldA:rgba(246,201,14,0.12);
--silver:#b8c8d8;--bronze:#c87040;
--green:#00f090;--greenA:rgba(0,240,144,0.1);
--red:#ff3355;--blue:#2d9cff;--purple:#9b5de5;
--text:#dde0f0;--muted:#3a3a60;--muted2:#5a5a88;
--r:6px;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:2px;height:2px;}
::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px;}

.parallax-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
.pb-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.07;animation:orbFloat 12s ease-in-out infinite;}
.pb-orb:nth-child(1){width:500px;height:500px;background:var(--gold);top:-100px;left:-150px;animation-delay:0s;}
.pb-orb:nth-child(2){width:400px;height:400px;background:var(--purple);bottom:-100px;right:-100px;animation-delay:-4s;}
.pb-orb:nth-child(3){width:300px;height:300px;background:var(--green);top:40%;left:60%;animation-delay:-8s;}
@keyframes orbFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-30px) scale(1.05);}}
.grid-overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(246,201,14,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(246,201,14,0.018) 1px,transparent 1px);background-size:44px 44px;}

.page{position:relative;z-index:1;}

.hero{text-align:center;padding:28px 16px 20px;background:linear-gradient(180deg,rgba(246,201,14,0.06) 0%,transparent 100%);border-bottom:1px solid var(--border2);position:relative;overflow:hidden;}
.hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(0,240,144,0.08);border:1px solid rgba(0,240,144,0.2);border-radius:20px;padding:3px 12px;font-size:8px;color:var(--green);letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;}
.live-dot{width:5px;height:5px;background:var(--green);border-radius:50%;animation:livePulse 2s infinite;}
@keyframes livePulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,240,144,0.5);}60%{opacity:0.7;box-shadow:0 0 0 5px rgba(0,240,144,0);}}
.hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,9vw,4rem);letter-spacing:8px;color:var(--gold);text-shadow:0 0 40px rgba(246,201,14,0.3);line-height:1;}
.hero-sub{font-size:8px;color:var(--muted2);letter-spacing:3px;text-transform:uppercase;margin-top:6px;}

.refresh-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:var(--s1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:20;backdrop-filter:blur(10px);}
.ri{font-size:8px;color:var(--muted2);}
.rb{background:transparent;border:1px solid rgba(246,201,14,0.35);color:var(--gold);padding:5px 14px;font-family:'DM Mono',monospace;font-size:9px;cursor:pointer;border-radius:2px;letter-spacing:2px;transition:all 0.2s;}
.rb:hover{background:var(--goldA);}
.rb:disabled{opacity:0.4;}

.overall-section{padding:14px 14px 0;}
.sec-label{font-size:8px;color:var(--muted2);letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.sec-label::before,.sec-label::after{content:'';flex:1;height:1px;background:var(--border2);}

.alltime-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:8px;}
.at-card{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px 10px;text-align:center;transition:transform 0.25s,border-color 0.25s;}
.at-card:hover{transform:translateY(-2px);border-color:var(--border2);}
.at-v{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--gold);line-height:1;text-shadow:0 0 20px rgba(246,201,14,0.3);}
.at-l{font-size:7px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-top:3px;}
.at-icon{font-size:18px;margin-bottom:4px;}

.daily-overall{display:grid;grid-template-columns:repeat(4,1fr);background:var(--s1);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:14px;}
.do-item{padding:10px 4px;text-align:center;border-right:1px solid var(--border);}
.do-item:last-child{border-right:none;}
.do-v{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:var(--green);line-height:1;}
.do-v.zero{color:var(--muted);}
.do-l{font-size:6px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:2px;}

.period-tabs{display:flex;gap:0;margin:0 14px 14px;background:var(--s1);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;}
.period-tab{flex:1;padding:10px 4px;text-align:center;cursor:pointer;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted2);border:none;background:transparent;transition:all 0.3s;position:relative;}
.period-tab.active{color:var(--gold);background:var(--goldA);}
.period-tab.active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--gold);}
.period-tab:not(:last-child){border-right:1px solid var(--border);}

.period-content{display:none;animation:fadeSlide 0.35s ease;}
.period-content.active{display:block;}
@keyframes fadeSlide{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}

.rank-board{padding:0 14px;display:flex;flex-direction:column;gap:8px;}
.rcard{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform 0.25s cubic-bezier(.34,1.56,.64,1),box-shadow 0.25s,border-color 0.25s;animation:cardIn 0.4s ease both;}
@keyframes cardIn{from{opacity:0;transform:translateX(-16px);}to{opacity:1;transform:translateX(0);}}
.rcard:hover{transform:translateX(5px);border-color:var(--border2);box-shadow:-4px 0 0 var(--gold),0 8px 30px rgba(0,0,0,0.5);}
.rcard.gold-card{border-color:rgba(246,201,14,0.4);background:linear-gradient(120deg,rgba(246,201,14,0.07),var(--s1) 55%);}
.rcard.silver-card{border-color:rgba(184,200,216,0.25);}
.rcard.bronze-card{border-color:rgba(200,112,64,0.25);}

.rc-main{display:flex;align-items:center;gap:10px;padding:12px 12px 0;}
.rc-rank{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;min-width:32px;text-align:center;line-height:1;flex-shrink:0;}
.rc-rank.r1{color:var(--gold);text-shadow:0 0 20px rgba(246,201,14,0.6);}
.rc-rank.r2{color:var(--silver);}
.rc-rank.r3{color:var(--bronze);}
.rc-rank.rn{color:var(--muted);font-size:1.1rem;}
.av-wrap{position:relative;flex-shrink:0;}
.avatar{width:46px;height:46px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;border:2px solid;background:var(--bg2);}
.avatar img{width:100%;height:100%;object-fit:cover;display:block;}
.av-letter{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;}
.crown{position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:13px;}
.rc-info{flex:1;min-width:0;}
.rc-name{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;}
.rc-handle{font-size:8px;color:var(--muted2);margin-top:1px;}
.rc-link{font-size:8px;color:var(--blue);text-decoration:none;display:inline-block;margin-top:2px;}
.rc-score{flex-shrink:0;text-align:right;}
.rc-pts{font-family:'Bebas Neue',sans-serif;font-size:0.9rem;padding:3px 8px;border-radius:3px;border:1px solid;white-space:nowrap;}

.rc-eng{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);margin-top:10px;}
.rc-eng-item{padding:7px 4px;text-align:center;border-right:1px solid var(--border);}
.rc-eng-item:last-child{border-right:none;}
.rc-eng-v{font-family:'Bebas Neue',sans-serif;font-size:1rem;line-height:1;}
.rc-eng-v.green{color:var(--green);}
.rc-eng-v.red{color:#ff6b8a;}
.rc-eng-v.blue{color:var(--blue);}
.rc-eng-v.gold{color:var(--gold);}
.rc-eng-v.zero{color:var(--muted);}
.rc-eng-k{font-size:6px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:1px;}

.rc-top-tweet{padding:8px 12px;border-top:1px solid var(--border);background:rgba(246,201,14,0.02);}
.rtt-label{font-size:7px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;}
.rtt-text{font-size:9px;color:var(--muted2);line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.rtt-stats{display:flex;gap:10px;margin-top:5px;flex-wrap:wrap;}
.rtt-s{font-size:9px;color:var(--muted2);display:flex;align-items:center;gap:3px;}
.rtt-s span{font-family:'Bebas Neue',sans-serif;font-size:0.9rem;color:var(--text);}

.rc-bar{height:2px;background:var(--border);}
.rc-bar-fill{height:2px;transition:width 1s cubic-bezier(.34,1.56,.64,1);}

.charts-wrap{padding:0 14px 14px;}
.chart-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}
.chart-box{background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:12px;overflow:hidden;}
.chart-box.full{grid-column:1/-1;}
.ct{font-family:'Bebas Neue',sans-serif;font-size:0.85rem;letter-spacing:2px;color:var(--gold);margin-bottom:10px;}
.chart-box canvas{max-height:160px;}

.modal-bg{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.92);overflow-y:auto;-webkit-overflow-scrolling:touch;}
.modal-bg.open{display:block;}
.modal{background:var(--s2);border:1px solid var(--border2);border-radius:12px;margin:12px;overflow:hidden;animation:modalIn 0.35s cubic-bezier(.34,1.56,.64,1);}
@keyframes modalIn{from{opacity:0;transform:scale(0.92) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}
.modal-stripe{height:4px;width:100%;}
.modal-inner{padding:16px;}
.modal-close{float:right;background:rgba(255,255,255,0.06);border:1px solid var(--border2);color:var(--muted2);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;margin-left:10px;}
.modal-close:hover{background:rgba(255,255,255,0.12);color:var(--text);}
.modal-header{display:flex;align-items:center;gap:14px;margin-bottom:14px;clear:both;}
.modal-av{width:64px;height:64px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;border:3px solid;background:var(--bg);flex-shrink:0;}
.modal-av img{width:100%;height:100%;object-fit:cover;}
.modal-av-letter{font-family:'Bebas Neue',sans-serif;font-size:2rem;}
.modal-name{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;line-height:1.1;}
.modal-handle{font-size:9px;color:var(--muted2);margin-top:3px;}
.modal-pts{font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:2px;margin-top:4px;}
.msec{font-size:8px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;padding:10px 0 6px;border-bottom:1px solid var(--border);margin-bottom:10px;}
.m-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:4px;}
.m-stat{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;padding:10px 6px;text-align:center;}
.m-stat-v{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:var(--gold);line-height:1;}
.m-stat-k{font-size:7px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
.m-eng{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:4px;}
.m-eng-item{background:var(--greenA);border:1px solid rgba(0,240,144,0.12);border-radius:4px;padding:10px;display:flex;align-items:center;gap:8px;}
.m-eng-icon{font-size:18px;}
.m-eng-v{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:var(--green);line-height:1;}
.m-eng-k{font-size:7px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.tweet-item{padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;transition:all 0.15s;}
.tweet-item:last-child{border-bottom:none;}
.tweet-item:hover{background:rgba(255,255,255,0.015);margin:0 -16px;padding:10px 16px;}
.tweet-num-wrap{display:flex;gap:8px;align-items:flex-start;}
.tweet-n{font-family:'Bebas Neue',sans-serif;font-size:0.7rem;color:var(--muted);min-width:16px;margin-top:2px;flex-shrink:0;}
.tweet-body{flex:1;}
.tweet-txt{font-size:9px;line-height:1.6;color:var(--muted2);margin-bottom:5px;}
.tweet-stats{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.ts{display:flex;align-items:center;gap:3px;font-size:9px;color:var(--muted2);}
.ts .tv{font-family:'Bebas Neue',sans-serif;font-size:0.9rem;}
.ts.lk .tv{color:#ff6b8a;}.ts.rt .tv{color:var(--green);}.ts.rp .tv{color:var(--blue);}.ts.qt .tv{color:var(--gold);}
.tw-time{font-size:7px;color:var(--muted);margin-left:auto;}
.tweet-total-bar{background:rgba(246,201,14,0.05);border:1px solid rgba(246,201,14,0.15);border-radius:4px;padding:10px;margin-top:10px;}
.ttb-title{font-size:8px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.ttb-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;}
.ttb-item{text-align:center;}
.ttb-v{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;color:var(--gold);}
.ttb-k{font-size:6px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.visit-btn{display:block;text-align:center;background:rgba(45,156,255,0.08);border:1px solid rgba(45,156,255,0.25);color:var(--blue);padding:12px;border-radius:4px;text-decoration:none;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:'DM Mono',monospace;margin-top:14px;transition:all 0.2s;}
.visit-btn:hover{background:rgba(45,156,255,0.15);}
.loading{text-align:center;padding:50px 20px;}
.spinner{width:32px;height:32px;border:2px solid var(--border2);border-top-color:var(--gold);border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto 14px;}
@keyframes spin{to{transform:rotate(360deg)}}
.lt{font-size:9px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;}
.err{margin:14px;padding:14px;background:rgba(255,51,85,0.06);border:1px solid rgba(255,51,85,0.2);border-radius:4px;font-size:9px;color:#ff6070;line-height:1.8;}
.no-posts{padding:14px;text-align:center;font-size:9px;color:var(--muted);letter-spacing:2px;}
.footer{text-align:center;padding:16px;font-size:7px;color:var(--muted);letter-spacing:2px;border-top:1px solid var(--border);}
</style>
</head>
<body>
<div class="parallax-bg">
<div class="pb-orb"></div><div class="pb-orb"></div><div class="pb-orb"></div>
</div>
<div class="grid-overlay"></div>
<div class="page">

<div class="hero">
<div class="hero-badge"><span class="live-dot"></span>LIVE COMMAND CENTER</div>
<div class="hero-title">𝕏 NEWS TEAM</div>
<div class="hero-sub">9 Members · @safinbarzany · v12</div>
</div>

<div class="refresh-bar">
<span class="ri" id="last-updated">Loading...</span>
<button class="rb" id="refresh-btn" onclick="fetchAll()">↻ REFRESH</button>
</div>

<div class="overall-section">
<div class="sec-label">📊 ALL-TIME OVERALL</div>
<div class="alltime-grid">
<div class="at-card"><div class="at-icon">👥</div><div class="at-v" id="at-followers">—</div><div class="at-l">Total Followers</div></div>
<div class="at-card"><div class="at-icon">📝</div><div class="at-v" id="at-posts">—</div><div class="at-l">Total Posts</div></div>
<div class="at-card"><div class="at-icon">👁</div><div class="at-v" id="at-following">—</div><div class="at-l">Total Following</div></div>
<div class="at-card"><div class="at-icon">⭐</div><div class="at-v" id="at-score">—</div><div class="at-l">Team Score</div></div>
</div>

<div class="sec-label">📅 TODAY — ALL 9 MEMBERS COMBINED</div>
<div class="daily-overall">
<div class="do-item"><div class="do-v zero" id="do-posts">—</div><div class="do-l">📝 Posts</div></div>
<div class="do-item"><div class="do-v zero" id="do-likes">—</div><div class="do-l">❤️ Likes</div></div>
<div class="do-item"><div class="do-v zero" id="do-rts">—</div><div class="do-l">🔁 RTs</div></div>
<div class="do-item"><div class="do-v zero" id="do-replies">—</div><div class="do-l">💬 Replies</div></div>
</div>

<div class="period-tabs">
<button class="period-tab active" onclick="setPeriod('daily',this)">📅 Daily</button>
<button class="period-tab" onclick="setPeriod('weekly',this)">📆 Weekly</button>
<button class="period-tab" onclick="setPeriod('alltime',this)">🏆 All Time</button>
</div>
</div>

<!-- DAILY -->
<div id="period-daily" class="period-content active">
<div class="rank-board" id="board-daily">
<div class="loading"><div class="spinner"></div><div class="lt">Loading daily rankings...</div></div>
</div>
<div class="charts-wrap" style="margin-top:14px;">
<div class="sec-label" style="padding:0 0 10px">📊 DAILY CHARTS</div>
<div class="chart-row">
<div class="chart-box"><div class="ct">❤️ LIKES</div><canvas id="cd-likes"></canvas></div>
<div class="chart-box"><div class="ct">🔁 RETWEETS</div><canvas id="cd-rts"></canvas></div>
</div>
<div class="chart-row">
<div class="chart-box"><div class="ct">💬 REPLIES</div><canvas id="cd-replies"></canvas></div>
<div class="chart-box"><div class="ct">📝 POSTS</div><canvas id="cd-posts"></canvas></div>
</div>
<div class="chart-row">
<div class="chart-box full"><div class="ct">🔥 TOTAL ENGAGEMENT</div><canvas id="cd-eng"></canvas></div>
</div>
</div>
</div>

<!-- WEEKLY -->
<div id="period-weekly" class="period-content">
<div class="rank-board" id="board-weekly">
<div class="loading"><div class="spinner"></div><div class="lt">Loading weekly rankings...</div></div>
</div>
<div class="charts-wrap" style="margin-top:14px;">
<div class="sec-label" style="padding:0 0 10px">📊 WEEKLY CHARTS</div>
<div class="chart-row">
<div class="chart-box"><div class="ct">❤️ WEEK LIKES</div><canvas id="cw-likes"></canvas></div>
<div class="chart-box"><div class="ct">🔁 WEEK RTs</div><canvas id="cw-rts"></canvas></div>
</div>
<div class="chart-row">
<div class="chart-box full"><div class="ct">📝 WEEK POSTS</div><canvas id="cw-posts"></canvas></div>
</div>
</div>
</div>

<!-- ALL TIME -->
<div id="period-alltime" class="period-content">
<div class="rank-board" id="board-alltime">
<div class="loading"><div class="spinner"></div><div class="lt">Loading all-time rankings...</div></div>
</div>
<div class="charts-wrap" style="margin-top:14px;">
<div class="sec-label" style="padding:0 0 10px">📊 ALL-TIME CHARTS</div>
<div class="chart-row">
<div class="chart-box"><div class="ct">📝 TOTAL POSTS</div><canvas id="ca-posts"></canvas></div>
<div class="chart-box"><div class="ct">👥 FOLLOWERS</div><canvas id="ca-follow"></canvas></div>
</div>
<div class="chart-row">
<div class="chart-box full"><div class="ct">⭐ SCORE DISTRIBUTION</div><canvas id="ca-score"></canvas></div>
</div>
</div>
</div>

</div>

<div class="modal-bg" id="modal-bg" onclick="closeModal(event)">
<div class="modal" id="modal-box"></div>
</div>

<div class="footer">Score = Posts×10 + Followers×0.1 · Engagement = Likes+RTs+Replies · News Team · v12</div>

<script>
const HANDLES=["zbriefkani","haidari_ii","K992Zhraa","shang_salar","fenk24","adamrizgar","mohammed_fayeqA","ahmed_hazharr","safinbarzany"];
const COLORS=["#f6c90e","#00c6ff","#ff6b9d","#7c3aed","#10b981","#f97316","#06b6d4","#84cc16","#a78bfa"];
let teamData=[],charts={},currentPeriod='daily';

const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':String(n||0);
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const score=u=>(u.public_metrics?.tweet_count||0)*10+(u.public_metrics?.followers_count||0)*0.1;
const eng=m=>(m?.total_likes||0)+(m?.total_retweets||0)+(m?.total_replies||0);
const colorFor=u=>COLORS[HANDLES.findIndex(h=>h.toLowerCase()===u.username?.toLowerCase())%COLORS.length]||COLORS[0];
const timeAgo=iso=>{if(!iso)return'';const d=Date.now()-new Date(iso).getTime(),m=Math.floor(d/60000);return m<1?'now':m<60?m+'m':Math.floor(m/60)+'h';};

document.addEventListener('scroll',()=>{
const y=window.scrollY;
document.querySelectorAll('.pb-orb').forEach((o,i)=>{o.style.transform=`translateY(${y*(0.1+i*0.05)}px)`;});
},{passive:true});

function setPeriod(p,el){
currentPeriod=p;
document.querySelectorAll('.period-tab').forEach(t=>t.classList.remove('active'));
document.querySelectorAll('.period-content').forEach(c=>c.classList.remove('active'));
el.classList.add('active');
document.getElementById('period-'+p).classList.add('active');
if(teamData.length){renderPeriod(p);renderCharts(p);}
}

async function fetchAll(){
const btn=document.getElementById('refresh-btn');
btn.disabled=true;btn.textContent='↻ LOADING...';
try{
const res=await fetch('/.netlify/functions/xapi');
if(!res.ok)throw new Error('Server '+res.status);
const json=await res.json();
if(json.error)throw new Error(json.error);
if(!json.data)throw new Error('No data');
teamData=json.data.map(u=>({...u,color:colorFor(u)}));
updateOverall();
renderPeriod(currentPeriod);
renderCharts(currentPeriod);
const t=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
document.getElementById('last-updated').textContent='Updated: '+t;
localStorage.setItem('xv12',JSON.stringify({data:teamData,ts:new Date().toISOString()}));
}catch(e){
['board-daily','board-weekly','board-alltime'].forEach(id=>{
const el=document.getElementById(id);
if(el)el.innerHTML=`<div class="err"><b>⚠ ERROR</b><br>${e.message}</div>`;
});
}
btn.disabled=false;btn.textContent='↻ REFRESH';
}

function updateOverall(){
const totF=teamData.reduce((s,u)=>s+(u.public_metrics?.followers_count||0),0);
const totP=teamData.reduce((s,u)=>s+(u.public_metrics?.tweet_count||0),0);
const totFo=teamData.reduce((s,u)=>s+(u.public_metrics?.following_count||0),0);
const totSc=Math.round(teamData.reduce((s,u)=>s+score(u),0));
const todayP=teamData.reduce((s,u)=>s+(u.today_metrics?.tweet_count||0),0);
const todayL=teamData.reduce((s,u)=>s+(u.today_metrics?.total_likes||0),0);
const todayR=teamData.reduce((s,u)=>s+(u.today_metrics?.total_retweets||0),0);
const todayRp=teamData.reduce((s,u)=>s+(u.today_metrics?.total_replies||0),0);
document.getElementById('at-followers').textContent=fmt(totF);
document.getElementById('at-posts').textContent=fmt(totP);
document.getElementById('at-following').textContent=fmt(totFo);
document.getElementById('at-score').textContent=fmt(totSc);
document.getElementById('do-posts').textContent=todayP||0;
document.getElementById('do-likes').textContent=fmt(todayL);
document.getElementById('do-rts').textContent=fmt(todayR);
document.getElementById('do-replies').textContent=fmt(todayRp);
}

function renderPeriod(p){
if(p==='daily')renderBoard('board-daily','today');
if(p==='weekly')renderBoard('board-weekly','week');
if(p==='alltime')renderBoard('board-alltime','alltime');
}

function renderBoard(boardId,mode){
const board=document.getElementById(boardId);
if(!board||!teamData.length)return;
const getEng=u=>{
if(mode==='alltime')return score(u);
const m=mode==='today'?(u.today_metrics||{}):(u.week_metrics||{});
return eng(m);
};
const sorted=[...teamData].sort((a,b)=>getEng(b)-getEng(a));
const topEng=Math.max(getEng(sorted[0])||1,1);
board.innerHTML='';
sorted.forEach((u,idx)=>{
const pm=u.public_metrics||{};
const tm=u.today_metrics||{};
const wm=u.week_metrics||{};
const m=mode==='today'?tm:mode==='week'?wm:pm;
const sc=Math.round(score(u));
const e=Math.round(getEng(u));
const bp=Math.min(100,Math.round((e/topEng)*100));
const rc=idx===0?'gold-card':idx===1?'silver-card':idx===2?'bronze-card':'';
const rl=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'#'+(idx+1);
const rt=idx===0?'r1':idx===1?'r2':idx===2?'r3':'rn';
const img=u.profile_image_url?u.profile_image_url.replace('_normal','_bigger'):null;
const topTweet=mode==='today'?(u.today_tweets||[])[0]:mode==='week'?(u.week_tweets||[])[0]:null;

let engHtml='';
if(mode!=='alltime'){
engHtml=`<div class="rc-eng">
<div class="rc-eng-item"><div class="rc-eng-v red ${!m.total_likes?'zero':''}">${fmt(m.total_likes||0)}</div><div class="rc-eng-k">❤️ Likes</div></div>
<div class="rc-eng-item"><div class="rc-eng-v green ${!m.total_retweets?'zero':''}">${fmt(m.total_retweets||0)}</div><div class="rc-eng-k">🔁 RTs</div></div>
<div class="rc-eng-item"><div class="rc-eng-v blue ${!m.total_replies?'zero':''}">${fmt(m.total_replies||0)}</div><div class="rc-eng-k">💬 Replies</div></div>
<div class="rc-eng-item"><div class="rc-eng-v gold">${m.tweet_count||0}</div><div class="rc-eng-k">📝 Posts</div></div>
</div>`;
}else{
engHtml=`<div class="rc-eng">
<div class="rc-eng-item"><div class="rc-eng-v gold">${fmt(pm.tweet_count||0)}</div><div class="rc-eng-k">📝 Posts</div></div>
<div class="rc-eng-item"><div class="rc-eng-v blue">${fmt(pm.followers_count||0)}</div><div class="rc-eng-k">👥 Follow</div></div>
<div class="rc-eng-item"><div class="rc-eng-v green">${fmt(pm.following_count||0)}</div><div class="rc-eng-k">👤 Fwing</div></div>
<div class="rc-eng-item"><div class="rc-eng-v red">${sc}</div><div class="rc-eng-k">⭐ Score</div></div>
</div>`;
}

const tweetPreview=topTweet?`<div class="rc-top-tweet">
<div class="rtt-label">🔥 TOP POST ${mode==='week'?'THIS WEEK':'TODAY'}</div>
<div class="rtt-text">${esc(topTweet.text||'')}</div>
<div class="rtt-stats">
<div class="rtt-s">❤️ <span>${topTweet.public_metrics?.like_count||0}</span></div>
<div class="rtt-s">🔁 <span>${topTweet.public_metrics?.retweet_count||0}</span></div>
<div class="rtt-s">💬 <span>${topTweet.public_metrics?.reply_count||0}</span></div>
<div class="rtt-s" style="margin-left:auto;font-size:7px;color:var(--muted)">${timeAgo(topTweet.created_at)}</div>
</div>
</div>`:'';

const card=document.createElement('div');
card.className='rcard '+rc;
card.style.animationDelay=idx*0.06+'s';
card.onclick=()=>openProfile(u,mode);
card.innerHTML=`
<div class="rc-main">
<div class="rc-rank ${rt}">${rl}</div>
<div class="av-wrap">
${idx===0?'<div class="crown">👑</div>':''}
<div class="avatar" style="border-color:${u.color}55;background:${u.color}11">
${img?`<img src="${img}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`:''}
<span class="av-letter" style="${img?'display:none':'display:flex'};color:${u.color}">${(u.name||u.username||'?')[0].toUpperCase()}</span>
</div>
</div>
<div class="rc-info">
<div class="rc-name" style="color:${u.color}">${u.name||u.username}</div>
<div class="rc-handle">@${u.username}</div>
<a class="rc-link" href="https://x.com/${u.username}" target="_blank" onclick="event.stopPropagation()">↗ X PROFILE</a>
</div>
<div class="rc-score">
<div class="rc-pts" style="border-color:${u.color}44;color:${u.color}">${mode==='alltime'?sc+'PTS':fmt(e)+' ENG'}</div>
</div>
</div>
${engHtml}
${tweetPreview}
<div class="rc-bar"><div class="rc-bar-fill" style="width:${bp}%;background:${u.color}"></div></div>`;
board.appendChild(card);
});
}

function renderCharts(p){
if(!teamData.length)return;
const mkBar=(id,data,key)=>{
const ctx=document.getElementById(id);if(!ctx)return;
if(charts[id])try{charts[id].destroy();}catch(e){}
charts[id]=new Chart(ctx,{type:'bar',data:{labels:data.map(u=>(u.name||u.username).split(' ')[0]),datasets:[{data:data.map(key),backgroundColor:data.map(u=>u.color+'88'),borderColor:data.map(u=>u.color),borderWidth:2,borderRadius:3}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#3a3a60',font:{size:7}},grid:{color:'#161630'}},y:{ticks:{color:'#3a3a60',font:{size:7}},grid:{color:'#161630'}}}}});
};
const mkDoughnut=(id,data,key)=>{
const ctx=document.getElementById(id);if(!ctx)return;
if(charts[id])try{charts[id].destroy();}catch(e){}
charts[id]=new Chart(ctx,{type:'doughnut',data:{labels:data.map(u=>u.name||u.username),datasets:[{data:data.map(key),backgroundColor:data.map(u=>u.color+'cc'),borderColor:data.map(u=>u.color),borderWidth:2}]},options:{responsive:true,plugins:{legend:{display:true,position:'bottom',labels:{color:'#dde0f0',font:{size:7},boxWidth:8}}}}});
};
if(p==='daily'){
mkBar('cd-likes',[...teamData].sort((a,b)=>(b.today_metrics?.total_likes||0)-(a.today_metrics?.total_likes||0)),u=>u.today_metrics?.total_likes||0);
mkBar('cd-rts',[...teamData].sort((a,b)=>(b.today_metrics?.total_retweets||0)-(a.today_metrics?.total_retweets||0)),u=>u.today_metrics?.total_retweets||0);
mkBar('cd-replies',[...teamData].sort((a,b)=>(b.today_metrics?.total_replies||0)-(a.today_metrics?.total_replies||0)),u=>u.today_metrics?.total_replies||0);
mkBar('cd-posts',[...teamData].sort((a,b)=>(b.today_metrics?.tweet_count||0)-(a.today_metrics?.tweet_count||0)),u=>u.today_metrics?.tweet_count||0);
mkBar('cd-eng',[...teamData].sort((a,b)=>eng(b.today_metrics)-eng(a.today_metrics)),u=>eng(u.today_metrics));
}else if(p==='weekly'){
mkBar('cw-likes',[...teamData].sort((a,b)=>(b.week_metrics?.total_likes||0)-(a.week_metrics?.total_likes||0)),u=>u.week_metrics?.total_likes||0);
mkBar('cw-rts',[...teamData].sort((a,b)=>(b.week_metrics?.total_retweets||0)-(a.week_metrics?.total_retweets||0)),u=>u.week_metrics?.total_retweets||0);
mkBar('cw-posts',[...teamData].sort((a,b)=>(b.week_metrics?.tweet_count||0)-(a.week_metrics?.tweet_count||0)),u=>u.week_metrics?.tweet_count||0);
}else{
mkBar('ca-posts',[...teamData].sort((a,b)=>(b.public_metrics?.tweet_count||0)-(a.public_metrics?.tweet_count||0)),u=>u.public_metrics?.tweet_count||0);
mkBar('ca-follow',[...teamData].sort((a,b)=>(b.public_metrics?.followers_count||0)-(a.public_metrics?.followers_count||0)),u=>u.public_metrics?.followers_count||0);
mkDoughnut('ca-score',[...teamData].sort((a,b)=>score(b)-score(a)),u=>Math.round(score(u)));
}
}

function openProfile(u,mode){
const pm=u.public_metrics||{};
const tm=u.today_metrics||{};
const wm=u.week_metrics||{};
const img=u.profile_image_url?u.profile_image_url.replace('_normal','_bigger'):null;
const sc=Math.round(score(u));
const tweets=mode==='week'?(u.week_tweets||[]):(u.today_tweets||[]);
const label=mode==='alltime'?'ALL-TIME':mode==='week'?'THIS WEEK':'TODAY';
const metrics=mode==='today'?tm:mode==='week'?wm:pm;
const totals=tweets.reduce((a,t)=>{const m=t.public_metrics||{};return{l:a.l+(m.like_count||0),r:a.r+(m.retweet_count||0),rp:a.rp+(m.reply_count||0),q:a.q+(m.quote_count||0)};},{l:0,r:0,rp:0,q:0});

const tweetsHtml=tweets.length?tweets.map((t,i)=>{
const m=t.public_metrics||{};
return`<div class="tweet-item" onclick="window.open('https://x.com/${u.username}/status/${t.id}','_blank');event.stopPropagation()">
<div class="tweet-num-wrap">
<div class="tweet-n">${i+1}</div>
<div class="tweet-body">
<div class="tweet-txt">${esc(t.text||'')}</div>
<div class="tweet-stats">
<div class="ts lk">❤️<span class="tv">${m.like_count||0}</span></div>
<div class="ts rt">🔁<span class="tv">${m.retweet_count||0}</span></div>
<div class="ts rp">💬<span class="tv">${m.reply_count||0}</span></div>
<div class="ts qt">🗨️<span class="tv">${m.quote_count||0}</span></div>
${i===0?'<span style="font-size:7px;padding:1px 6px;background:rgba(246,201,14,0.12);border:1px solid rgba(246,201,14,0.3);border-radius:10px;color:var(--gold);font-family:\'Bebas Neue\',sans-serif;letter-spacing:1px">TOP</span>':''}
<div class="tw-time">${timeAgo(t.created_at)}</div>
</div>
</div>
</div>
</div>`;
}).join(''):`<div class="no-posts">NO POSTS ${label}</div>`;

document.getElementById('modal-box').innerHTML=`
<div class="modal-stripe" style="background:linear-gradient(90deg,${u.color},${u.color}44)"></div>
<div class="modal-inner">
<button class="modal-close" onclick="closeModal()">✕</button>
<div class="modal-header">
<div class="modal-av" style="border-color:${u.color};background:${u.color}11">
${img?`<img src="${img}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`:''}
<span class="modal-av-letter" style="${img?'display:none':'display:flex'};color:${u.color}">${(u.name||u.username||'?')[0].toUpperCase()}</span>
</div>
<div>
<div class="modal-name" style="color:${u.color}">${u.name||u.username}</div>
<div class="modal-handle">@${u.username}</div>
<div class="modal-pts" style="color:${u.color}">${sc} PTS · <a href="https://x.com/${u.username}" target="_blank" style="color:var(--blue);font-size:9px">↗ X Profile</a></div>
</div>
</div>
${u.description?`<div style="font-size:9px;color:var(--muted2);line-height:1.7;padding:10px;background:rgba(255,255,255,0.02);border-radius:4px;border-left:2px solid ${u.color}44;margin-bottom:10px">${esc(u.description)}</div>`:''}
<div class="msec">📊 ALL-TIME STATS</div>
<div class="m-stats">
<div class="m-stat"><div class="m-stat-v">${fmt(pm.tweet_count||0)}</div><div class="m-stat-k">Posts</div></div>
<div class="m-stat"><div class="m-stat-v">${fmt(pm.followers_count||0)}</div><div class="m-stat-k">Followers</div></div>
<div class="m-stat"><div class="m-stat-v">${fmt(pm.following_count||0)}</div><div class="m-stat-k">Following</div></div>
</div>
<div class="msec">📅 ${label} ENGAGEMENT</div>
<div class="m-eng">
<div class="m-eng-item"><div class="m-eng-icon">📝</div><div><div class="m-eng-v">${metrics.tweet_count||0}</div><div class="m-eng-k">Posts</div></div></div>
<div class="m-eng-item"><div class="m-eng-icon">❤️</div><div><div class="m-eng-v">${fmt(metrics.total_likes||0)}</div><div class="m-eng-k">Likes</div></div></div>
<div class="m-eng-item"><div class="m-eng-icon">🔁</div><div><div class="m-eng-v">${fmt(metrics.total_retweets||0)}</div><div class="m-eng-k">Retweets</div></div></div>
<div class="m-eng-item"><div class="m-eng-icon">💬</div><div><div class="m-eng-v">${fmt(metrics.total_replies||0)}</div><div class="m-eng-k">Replies</div></div></div>
</div>
<div class="msec">🐦 ${label} TWEETS (${tweets.length})</div>
${tweetsHtml}
${tweets.length?`<div class="tweet-total-bar">
<div class="ttb-title">📊 TOTAL FROM ${tweets.length} TWEETS</div>
<div class="ttb-grid">
<div class="ttb-item"><div class="ttb-v">${fmt(totals.l)}</div><div class="ttb-k">❤️ Likes</div></div>
<div class="ttb-item"><div class="ttb-v">${fmt(totals.r)}</div><div class="ttb-k">🔁 RTs</div></div>
<div class="ttb-item"><div class="ttb-v">${fmt(totals.rp)}</div><div class="ttb-k">💬 Replies</div></div>
<div class="ttb-item"><div class="ttb-v">${fmt(totals.q)}</div><div class="ttb-k">🗨️ Quotes</div></div>
</div>
</div>`:''}
<a class="visit-btn" href="https://x.com/${u.username}" target="_blank">↗ VISIT @${u.username} ON X</a>
</div>`;
document.getElementById('modal-bg').classList.add('open');
document.getElementById('modal-bg').scrollTop=0;
}

function closeModal(e){
if(!e||e.target===document.getElementById('modal-bg'))
document.getElementById('modal-bg').classList.remove('open');
}

window.addEventListener('load',()=>{
try{
const c=localStorage.getItem('xv12');
if(c){
const{data,ts}=JSON.parse(c);
if((Date.now()-new Date(ts).getTime())/3600000<1){
teamData=data.map(u=>({...u,color:colorFor(u)}));
updateOverall();renderPeriod('daily');renderCharts('daily');
document.getElementById('last-updated').textContent='Cached: '+new Date(ts).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
return;
}
}
}catch(e){}
fetchAll();
});
setInterval(fetchAll,60*60*1000);
</script>
</body>
</html>