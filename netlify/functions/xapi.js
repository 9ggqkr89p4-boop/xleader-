const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAA8OAoaxxve1sR4wAwhvT%2FST3%2F6kE%3DLHRwaAxT88yujpEYThZqbV4G45hJQlGt6AFIyXT2OMfHfnNyTl";
const HANDLES = ["zbriefkani","haidari_ii","K992Zhraa","shang_salar","fenk24","adamrizgar","mohammed_fayeqA","ahmed_hazharr","safinbarzany"];

const headers = {
"Authorization": "Bearer " + BEARER,
"Content-Type": "application/json"
};

const CORS = {
"Content-Type": "application/json",
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "GET, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type"
};

async function fetchUsers() {
const url = `https://api.twitter.com/2/users/by?usernames=${HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name,created_at,location,verified`;
const res = await fetch(url, { headers });
if (!res.ok) throw new Error(`Users API error: ${res.status} ${await res.text()}`);
return res.json();
}

async function fetchTodayTimeline(userId) {
const now = new Date();
const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
const params = new URLSearchParams({
max_results: "100",
start_time: todayStart.toISOString(),
end_time: now.toISOString(),
"tweet.fields": "public_metrics,created_at,text",
exclude: "retweets"
});
const res = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?${params}`, { headers });
if (!res.ok) return { data: [] };
const json = await res.json();
return { data: json.data || [] };
}

async function fetchWeekTimeline(userId) {
const now = new Date();
const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const params = new URLSearchParams({
max_results: "100",
start_time: weekStart.toISOString(),
end_time: now.toISOString(),
"tweet.fields": "public_metrics,created_at,text",
exclude: "retweets"
});
const res = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?${params}`, { headers });
if (!res.ok) return { data: [] };
const json = await res.json();
return { data: json.data || [] };
}

function aggregate(tweets) {
return tweets.reduce((acc, t) => {
const m = t.public_metrics || {};
return {
tweet_count: acc.tweet_count + 1,
total_likes: acc.total_likes + (m.like_count || 0),
total_retweets: acc.total_retweets + (m.retweet_count || 0),
total_replies: acc.total_replies + (m.reply_count || 0),
total_quotes: acc.total_quotes + (m.quote_count || 0),
};
}, { tweet_count: 0, total_likes: 0, total_retweets: 0, total_replies: 0, total_quotes: 0 });
}

exports.handler = async function(event, context) {
if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
try {
const usersData = await fetchUsers();
if (!usersData.data) throw new Error("No users: " + JSON.stringify(usersData));
const users = usersData.data;

const results = await Promise.allSettled(users.map(async (user) => {
const [todayRes, weekRes] = await Promise.allSettled([
fetchTodayTimeline(user.id),
fetchWeekTimeline(user.id)
]);
const todayTweets = todayRes.status === "fulfilled" ? todayRes.value.data : [];
const weekTweets = weekRes.status === "fulfilled" ? weekRes.value.data : [];
const sortedToday = [...todayTweets].sort((a,b) =>
((b.public_metrics?.like_count||0)+(b.public_metrics?.retweet_count||0)+(b.public_metrics?.reply_count||0)) -
((a.public_metrics?.like_count||0)+(a.public_metrics?.retweet_count||0)+(a.public_metrics?.reply_count||0))
);
const sortedWeek = [...weekTweets].sort((a,b) =>
((b.public_metrics?.like_count||0)+(b.public_metrics?.retweet_count||0)) -
((a.public_metrics?.like_count||0)+(a.public_metrics?.retweet_count||0))
);
return {
...user,
today_tweets: sortedToday,
today_metrics: aggregate(todayTweets),
week_tweets: sortedWeek,
week_metrics: aggregate(weekTweets),
};
}));

const enriched = results.map((r, i) => r.status === "fulfilled" ? r.value : {
...users[i],
today_tweets: [], today_metrics: { tweet_count:0,total_likes:0,total_retweets:0,total_replies:0,total_quotes:0 },
week_tweets: [], week_metrics: { tweet_count:0,total_likes:0,total_retweets:0,total_replies:0,total_quotes:0 },
});

return {
statusCode: 200, headers: CORS,
body: JSON.stringify({ data: enriched, fetched_at: new Date().toISOString() })
};
} catch(e) {
return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
}
};