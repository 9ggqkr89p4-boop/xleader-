const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAFQFUjucJcgcVabzS1R%2BxhjItvzE%3DHn54Sco7d9BQ2dF6fuuhH59RyNowiEGTDcExv5WNu7akpBTBHj";
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
  const url = `https://api.twitter.com/2/users/by?usernames=${HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name,created_at,location,url,verified,pinned_tweet_id`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Users API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchUserTimeline(userId) {
  // Get today's start time in UTC
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const startTime = todayStart.toISOString();
  const endTime = now.toISOString();

  const params = new URLSearchParams({
    max_results: "100",
    start_time: startTime,
    end_time: endTime,
    "tweet.fields": "public_metrics,created_at,text,attachments,entities,referenced_tweets,conversation_id",
    "media.fields": "url,preview_image_url,type",
    "expansions": "attachments.media_keys,referenced_tweets.id",
    exclude: "retweets"
  });

  const url = `https://api.twitter.com/2/users/${userId}/tweets?${params}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`Timeline error for ${userId}: ${res.status} ${errText}`);
    return { data: [], meta: { result_count: 0 } };
  }
  const json = await res.json();
  return json;
}

async function fetchWeeklyTimeline(userId) {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    max_results: "100",
    start_time: weekStart.toISOString(),
    end_time: now.toISOString(),
    "tweet.fields": "public_metrics,created_at",
    exclude: "retweets"
  });

  const url = `https://api.twitter.com/2/users/${userId}/tweets?${params}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return { data: [], meta: { result_count: 0 } };
  return res.json();
}

function aggregateMetrics(tweets) {
  if (!tweets || tweets.length === 0) {
    return { tweet_count: 0, total_likes: 0, total_retweets: 0, total_replies: 0, total_impressions: 0, total_quotes: 0 };
  }
  return tweets.reduce((acc, t) => {
    const m = t.public_metrics || {};
    return {
      tweet_count: acc.tweet_count + 1,
      total_likes: acc.total_likes + (m.like_count || 0),
      total_retweets: acc.total_retweets + (m.retweet_count || 0),
      total_replies: acc.total_replies + (m.reply_count || 0),
      total_impressions: acc.total_impressions + (m.impression_count || 0),
      total_quotes: acc.total_quotes + (m.quote_count || 0),
    };
  }, { tweet_count: 0, total_likes: 0, total_retweets: 0, total_replies: 0, total_impressions: 0, total_quotes: 0 });
}

exports.handler = async function(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  try {
    // 1. Fetch all user profiles
    const usersData = await fetchUsers();
    if (!usersData.data) throw new Error("No user data returned: " + JSON.stringify(usersData));

    const users = usersData.data;

    // 2. For each user, fetch today's tweets + weekly tweets in parallel
    const timelineResults = await Promise.allSettled(
      users.map(async (user) => {
        const [todayResult, weekResult] = await Promise.allSettled([
          fetchUserTimeline(user.id),
          fetchWeeklyTimeline(user.id)
        ]);

        const todayTweets = todayResult.status === "fulfilled" ? (todayResult.value.data || []) : [];
        const weekTweets = weekResult.status === "fulfilled" ? (weekResult.value.data || []) : [];

        const todayMetrics = aggregateMetrics(todayTweets);
        const weekMetrics = aggregateMetrics(weekTweets);

        // Sort today's tweets by engagement (likes + retweets + replies)
        const sortedTodayTweets = [...todayTweets].sort((a, b) => {
          const engA = (a.public_metrics?.like_count || 0) + (a.public_metrics?.retweet_count || 0) + (a.public_metrics?.reply_count || 0);
          const engB = (b.public_metrics?.like_count || 0) + (b.public_metrics?.retweet_count || 0) + (b.public_metrics?.reply_count || 0);
          return engB - engA;
        });

        return {
          ...user,
          today_tweets: sortedTodayTweets,
          today_metrics: todayMetrics,
          week_metrics: weekMetrics,
        };
      })
    );

    const enrichedUsers = timelineResults.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      // fallback: return base user data if timeline fetch failed
      return {
        ...users[i],
        today_tweets: [],
        today_metrics: { tweet_count: 0, total_likes: 0, total_retweets: 0, total_replies: 0, total_impressions: 0, total_quotes: 0 },
        week_metrics: { tweet_count: 0, total_likes: 0, total_retweets: 0, total_replies: 0, total_impressions: 0, total_quotes: 0 },
      };
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        data: enrichedUsers,
        fetched_at: new Date().toISOString(),
        meta: {
          total_members: enrichedUsers.length,
          total_posts_today: enrichedUsers.reduce((s, u) => s + u.today_metrics.tweet_count, 0),
          total_likes_today: enrichedUsers.reduce((s, u) => s + u.today_metrics.total_likes, 0),
          total_retweets_today: enrichedUsers.reduce((s, u) => s + u.today_metrics.total_retweets, 0),
        }
      })
    };

  } catch (e) {
    console.error("xapi handler error:", e);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message, stack: e.stack })
    };
  }
};