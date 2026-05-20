exports.handler = async function(event, context) {
  const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";
  // CORRECTED HANDLES (based on your screenshot and actual X usernames)
  const HANDLES = [
    "zbriefkani",
    "haidari_ii",
    "K99Zhraa",        // was K992Zhraa – fixed
    "shang_salar",
    "fenk24",
    "adamrizgar",
    "mohammed_fayeqA",
    "ahmed_hazharr",
    "safinbarzany"
  ];

  try {
    // 1. Fetch user details for all handles
    const userUrl = `https://api.twitter.com/2/users/by?usernames=${HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name`;
    const userRes = await fetch(userUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });
    const userData = await userRes.json();
    
    // Build a map of found users
    const foundUsers = new Map();
    if (userData.data) {
      userData.data.forEach(u => foundUsers.set(u.username.toLowerCase(), u));
    }
    // Track missing handles
    const missingHandles = HANDLES.filter(h => !foundUsers.has(h.toLowerCase()));
    
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();

    // Process each handle: if missing, create placeholder user
    const usersWithTweets = await Promise.all(HANDLES.map(async (handle) => {
      let user = foundUsers.get(handle.toLowerCase());
      if (!user) {
        // Placeholder for missing user
        user = {
          username: handle,
          name: handle,
          public_metrics: { tweet_count: 0, followers_count: 0, following_count: 0 },
          profile_image_url: null,
          description: null,
          missing: true
        };
      }
      // Try to fetch tweets (skip if missing)
      let tweets = [];
      try {
        if (!user.missing) {
          // Get user ID
          const idUrl = `https://api.twitter.com/2/users/by/username/${user.username}`;
          const idRes = await fetch(idUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });
          const idJson = await idRes.json();
          if (idJson.data) {
            const userId = idJson.data.id;
            const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url&max_results=10&start_time=${oneDayAgo}`;
            const tweetsRes = await fetch(tweetsUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });
            const tweetsJson = await tweetsRes.json();
            const rawTweets = tweetsJson.data || [];
            const mediaMap = new Map();
            if (tweetsJson.includes?.media) {
              tweetsJson.includes.media.forEach(media => {
                mediaMap.set(media.media_key, media.url || media.preview_image_url);
              });
            }
            tweets = rawTweets.map(tweet => ({
              id: tweet.id,
              text: tweet.text,
              created_at: tweet.created_at,
              like_count: tweet.public_metrics?.like_count || 0,
              reply_count: tweet.public_metrics?.reply_count || 0,
              retweet_count: tweet.public_metrics?.retweet_count || 0,
              media_url: tweet.attachments?.media_keys?.[0] ? (mediaMap.get(tweet.attachments.media_keys[0]) || null) : null,
              tweet_url: `https://twitter.com/${user.username}/status/${tweet.id}`
            }));
          }
        }
      } catch (err) {
        console.error(`Tweet fetch failed for ${handle}:`, err.message);
      }
      return { ...user, tweets, missing: user.missing || false };
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ data: usersWithTweets, missing: missingHandles })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};