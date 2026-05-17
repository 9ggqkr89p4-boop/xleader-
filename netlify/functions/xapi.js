exports.handler = async function(event, context) {
  const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAA%2BGNTP4%2BsUhhdS%2BKIrH4%2BoyjFN7I%3DUoDIbeWydpwmhUDUJ2P3WNI6hZcPUih81ni2LVenCAFq1CSLlx";
  const HANDLES = ["zbriefkani","haidari_ii","K992Zhraa","shang_salar","fenk24","adamrizgar","mohammed_fayeqA","ahmed_hazharr","safinbarzany"];

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    // Step 1: Get user profiles
    const usernames = HANDLES.join(",");
    const userUrl = `https://api.twitter.com/2/users/by?usernames=${usernames}&user.fields=public_metrics,profile_image_url,description,name`;
    const userRes = await fetch(userUrl, {
      headers: { "Authorization": `Bearer ${decodeURIComponent(BEARER)}` }
    });
    const userData = await userRes.json();
    if (!userData.data) throw new Error("No user data: " + JSON.stringify(userData));

    // Step 2: For each user, get their recent tweets with engagement metrics
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 30);
    monthStart.setHours(0, 0, 0, 0);

    const enriched = await Promise.all(userData.data.map(async (user) => {
      try {
        // Fetch recent tweets (up to 100) with engagement metrics
        const tweetsUrl = `https://api.twitter.com/2/users/${user.id}/tweets?max_results=100&tweet.fields=public_metrics,created_at&start_time=${monthStart.toISOString()}`;
        const tweetsRes = await fetch(tweetsUrl, {
          headers: { "Authorization": `Bearer ${decodeURIComponent(BEARER)}` }
        });
        const tweetsData = await tweetsRes.json();
        const tweets = tweetsData.data || [];

        // Calculate daily stats
        const todayTweets = tweets.filter(t => new Date(t.created_at) >= todayStart);
        const weekTweets = tweets.filter(t => new Date(t.created_at) >= weekStart);
        const monthTweets = tweets; // already filtered to last 30 days

        const sumMetrics = (list) => list.reduce((acc, t) => {
          const m = t.public_metrics || {};
          return {
            posts: acc.posts + 1,
            likes: acc.likes + (m.like_count || 0),
            retweets: acc.retweets + (m.retweet_count || 0),
            replies: acc.replies + (m.reply_count || 0),
            quotes: acc.quotes + (m.quote_count || 0),
          };
        }, { posts: 0, likes: 0, retweets: 0, replies: 0, quotes: 0 });

        return {
          ...user,
          daily: sumMetrics(todayTweets),
          weekly: sumMetrics(weekTweets),
          monthly: sumMetrics(monthTweets),
        };
      } catch (e) {
        // If tweet fetch fails for a user, return base data
        return {
          ...user,
          daily: { posts: 0, likes: 0, retweets: 0, replies: 0, quotes: 0 },
          weekly: { posts: 0, likes: 0, retweets: 0, replies: 0, quotes: 0 },
          monthly: { posts: 0, likes: 0, retweets: 0, replies: 0, quotes: 0 },
        };
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ data: enriched })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
