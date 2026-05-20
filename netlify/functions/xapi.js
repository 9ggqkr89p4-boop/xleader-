exports.handler = async function(event, context) {
  const BEARER = decodeURIComponent("AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAtXlCaHSMCJQ51LQoOUN%2BBqMK9%2F8%3DY6htAMAyoZkdBIan75xZvokSc77X7yOkmFZRaZSmNACig9f40c");

  const REQUIRED_HANDLES = [
    "zbriefkani",
    "haidari_ii",
    "K992Zhraa",
    "shang_salar",
    "fenk24",
    "adamrizgar",
    "Mohammed_FayeqA",
    "ahmed_hazharr",
    "safinbarzany"
  ];

  const authHeader = { "Authorization": `Bearer ${BEARER}` };

  try {
    const userUrl = `https://api.twitter.com/2/users/by?usernames=${REQUIRED_HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name`;
    const userRes = await fetch(userUrl, { headers: authHeader });
    const userData = await userRes.json();

    if (userData.errors || !userData.data) {
      console.error("User fetch error:", JSON.stringify(userData));
    }

    const foundMap = new Map();
    if (userData.data) {
      userData.data.forEach(u => foundMap.set(u.username.toLowerCase(), u));
    }

    // Try last 24h first, fall back to 7 days if no tweets found
    const oneDayAgo  = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const usersWithTweets = await Promise.all(REQUIRED_HANDLES.map(async (handle) => {
      let user = foundMap.get(handle.toLowerCase());
      let isPlaceholder = false;

      if (!user) {
        isPlaceholder = true;
        user = {
          username: handle,
          name: handle,
          public_metrics: { tweet_count: 0, followers_count: 0, following_count: 0 },
          profile_image_url: null,
          description: null
        };
      }

      let tweets = [];
      let tweetWindow = "24h";

      if (!isPlaceholder) {
        // Helper to fetch tweets for a given start_time
        const fetchTweets = async (startTime) => {
          const url = `https://api.twitter.com/2/users/${user.id}/tweets?tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url&max_results=10&start_time=${startTime}`;
          const res = await fetch(url, { headers: authHeader });
          const json = await res.json();
          if (json.errors) console.error(`Tweet error for ${handle}:`, JSON.stringify(json.errors));
          return json;
        };

        try {
          let tweetsJson = await fetchTweets(oneDayAgo);
          let rawTweets = tweetsJson.data || [];

          // If no tweets in last 24h, try last 7 days
          if (rawTweets.length === 0) {
            tweetsJson = await fetchTweets(sevenDaysAgo);
            rawTweets = tweetsJson.data || [];
            tweetWindow = "7d";
          }

          const mediaMap = new Map();
          if (tweetsJson.includes?.media) {
            tweetsJson.includes.media.forEach(m => {
              mediaMap.set(m.media_key, m.url || m.preview_image_url);
            });
          }

          tweets = rawTweets.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            like_count: tweet.public_metrics?.like_count || 0,
            reply_count: tweet.public_metrics?.reply_count || 0,
            retweet_count: tweet.public_metrics?.retweet_count || 0,
            media_url: tweet.attachments?.media_keys?.[0]
              ? (mediaMap.get(tweet.attachments.media_keys[0]) || null)
              : null,
            tweet_url: `https://twitter.com/${user.username}/status/${tweet.id}`
          }));

        } catch (err) {
          console.error(`Tweet fetch failed for ${handle}:`, err.message);
        }
      }

      return { ...user, tweets, tweetWindow, placeholder: isPlaceholder };
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ data: usersWithTweets })
    };

  } catch (error) {
    console.error("Handler error:", error.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
