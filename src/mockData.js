const NAMES = [
  { username: "adamrizgar",      name: "Adam Rizgar" },
  { username: "mejpuk",          name: "Mej Puk" },
  { username: "zbriefkani",      name: "Z Briefkani" },
  { username: "mohammed_fayeqa", name: "Mohammed Fayeqa" },
  { username: "k992zhraa",       name: "K992 Zhraa" },
  { username: "ahmed_hazharr",   name: "Ahmed Hazharr" },
  { username: "Fenk24",          name: "Fenk 24" },
  { username: "shang_salar",     name: "Shang Salar" },
  { username: "haidari_ii",      name: "Haidari II" },
  { username: "safinbarzany",    name: "Safin Barzany" },
];

const COLORS = ["#00d4ff","#ff6b35","#a855f7","#22c55e","#f59e0b","#ec4899","#14b8a6","#f97316","#818cf8","#84cc16"];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeTweets(count) {
  const samples = [
    "Just dropped our latest analysis — the numbers don't lie 📊",
    "Thread incoming on why this matters for everyone watching 🧵",
    "Big update from our team. Stay tuned for more details 🔥",
    "Behind the scenes look at what we've been building lately 👀",
    "Hot take: consistency beats perfection every single time ✅",
    "Numbers are in for this week. Another record broken 🚀",
    "Grateful for this community. Your support fuels everything 🙏",
    "Quick reminder: the best time to start was yesterday 💡",
    "We asked, you answered. Here are the results from our poll 📈",
    "Live update: things are moving faster than expected tonight ⚡",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `tweet_${Math.random().toString(36).substr(2, 9)}`,
    text: samples[i % samples.length],
    created_at: new Date(Date.now() - rand(0, 86400000 * 7)).toISOString(),
    public_metrics: {
      like_count: rand(10, 500),
      reply_count: rand(2, 80),
      retweet_count: rand(1, 120),
      impression_count: rand(500, 20000),
    }
  }));
}

function calcStats(tweets) {
  return tweets.reduce((acc, t) => {
    const m = t.public_metrics;
    return {
      posts: acc.posts + 1,
      likes: acc.likes + m.like_count,
      comments: acc.comments + m.reply_count,
      reposts: acc.reposts + m.retweet_count,
      impressions: acc.impressions + m.impression_count,
    };
  }, { posts:0, likes:0, comments:0, reposts:0, impressions:0 });
}

export function generateMockTeam() {
  return NAMES.map((member, i) => {
    const daily   = makeTweets(rand(1, 5));
    const weekly  = makeTweets(rand(5, 25));
    const monthly = makeTweets(rand(20, 80));
    const overall = makeTweets(rand(50, 200));
    return {
      profile: {
        id: `user_${i}`,
        name: member.name,
        username: member.username,
        profile
