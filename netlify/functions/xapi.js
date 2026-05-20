exports.handler = async function(event, context) {
  // OLD token — confirmed working for user lookup
  const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";

  const REQUIRED_HANDLES = [
    "zbriefkani","haidari_ii","K992Zhraa","shang_salar",
    "fenk24","adamrizgar","Mohammed_FayeqA","ahmed_hazharr","safinbarzany"
  ];

  const headers = { "Authorization": `Bearer ${BEARER}` };

  try {
    // 1. Fetch all 9 users in one call
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by?usernames=${REQUIRED_HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name`,
      { headers }
    );
    const userData = await userRes.json();
    console.log("User lookup status:", userRes.status);
    if (userData.errors) console.error("User errors:", JSON.stringify(userData.errors));

    const foundMap = new Map();
    (userData.data || []).forEach(u => foundMap.set(u.username.toLowerCase(), u));

    // 2. Try 24h window, fall back to 7 days if empty
    const oneDayAgo   = new Date(Date.now() -      24*60*60*1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString();

    const usersWithTweets = await Promise.all(REQUIRED_HANDLES.map(async (handle) => {
      let user = foundMap.get(handle.toLowerCase());

      if (!user) {
        return {
          username: handle, name: handle,
          public_metrics: { tweet_count:0, followers_count:0, following_count:0 },
          profile_image_url: null, description: null,
          tweets: [], tweetWindow: "none", placeholder: true
        };
      }

      let tweets = [];
      let tweetWindow = "24h";

      const getTweets = async (since) => {
        const url = `https://api.twitter.com/2/users/${user.id}/tweets`
          + `?tweet.fields=created_at,public_metrics,attachments`
          + `&expansions=attachments.media_keys`
          + `&media.fields=url,preview_image_url`
          + `&max_results=10`
          + `&start_time=${since}`;
        const r = await fetch(url, { headers });
        const j = await r.json();
        console.log(`Tweets for ${handle} (since ${since}):`, r.status, JSON.stringify(j).slice(0,200));
        return j;
      };

      try {
        let j = await getTweets(oneDayAgo);
        if (!j.data || j.data.length === 0) {
          j = await getTweets(sevenDaysAgo);
          tweetWindow = "7d";
        }

        const mediaMap = new Map();
        (j.includes?.media || []).forEach(m => mediaMap.set(m.media_key, m.url || m.preview_image_url));

        tweets = (j.data || []).map(t => ({
          id: t.id,
          text: t.text,
          created_at: t.created_at,
          like_count:    t.public_metrics?.like_count    || 0,
          reply_count:   t.public_metrics?.reply_count   || 0,
          retweet_count: t.public_metrics?.retweet_count || 0,
          media_url: t.attachments?.media_keys?.[0]
            ? (mediaMap.get(t.attachments.media_keys[0]) || null) : null,
          tweet_url: `https://twitter.com/${user.username}/status/${t.id}`
        }));
      } catch(err) {
        console.error(`Tweet fetch failed for ${handle}:`, err.message);
      }

      return { ...user, tweets, tweetWindow, placeholder: false };
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" },
      body: JSON.stringify({ data: usersWithTweets })
    };

  } catch (error) {
    console.error("Fatal error:", error.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
