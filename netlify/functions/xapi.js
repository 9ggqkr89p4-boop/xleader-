const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAA0vua%2F1kBs9%2Bxwqiutoh93msJp1Y%3Dxa5KbanQRqymKCT23AgXYtZr3AQ0R9xXQQLQweEU2kSRBxDVfS";
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
  if (!res.ok) throw new Error(`Users API error: ${res.status} - ${await res.text()}`);
  return res.json();
}

async function fetchTimeline(userId, startTime) {
  const now = new Date();
  const params = new URLSearchParams({
    max_results: "100",
    start_time: startTime.toISOString(),
    end_time: now.toISOString(),
    "tweet.fields": "public_metrics,created_at,text",
    exclude: "retweets"
  });
  const res = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?${params}`, { headers });

  // Log actual error for debugging
  if (!res.ok) {
    const errText = await res.text();
    console.log(`Timeline error for ${userId}: ${res.status} - ${errText}`);
    return { data: [], error: `${res.status}: ${errText}` };
  }

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

exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };

  try {
    const usersData = await fetchUsers();
    if (!usersData.data) throw new Error("No users returned: " + JSON.stringify(usersData));
    const users = usersData.data;

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const results = await Promise.allSettled(users.map(async (user) => {
      const [todayRes, weekRes] = await Promise.allSettled([
        fetchTimeline(user.id, todayStart),
        fetchTimeline(user.id, weekStart)
      ]);

      const todayTweets = todayRes.status === "fulfilled" ? todayRes.value.data : [];
      const weekTweets  = weekRes.status  === "fulfilled" ? weekRes.value.data  : [];

      const sortByEng = (arr) => [...arr].sort((a, b) => {
        const score = t => (t.public_metrics?.like_count||0) + (t.public_metrics?.retweet_count||0) + (t.public_metrics?.reply_count||0);
        return score(b) - score(a);
      });

      return {
        ...user,
        today_tweets:  sortByEng(todayTweets),
        today_metrics: aggregate(todayTweets),
        week_tweets:   sortByEng(weekTweets),
        week_metrics:  aggregate(weekTweets),
        // Debug: expose any API errors
        today_api_error: todayRes.status === "fulfilled" ? (todayRes.value.error || null) : todayRes.reason?.message,
        week_api_error:  weekRes.status  === "fulfilled" ? (weekRes.value.error  || null) : weekRes.reason?.message,
      };
    }));

    const enriched = results.map((r, i) =>
      r.status === "fulfilled" ? r.value : {
        ...users[i],
        today_tweets: [], today_metrics: { tweet_count:0, total_likes:0, total_retweets:0, total_replies:0, total_quotes:0 },
        week_tweets:  [], week_metrics:  { tweet_count:0, total_likes:0, total_retweets:0, total_replies:0, total_quotes:0 },
        error: r.reason?.message
      }
    );

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ data: enriched, fetched_at: new Date().toISOString() })
    };

  } catch(e) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message })
    };
  }
};
