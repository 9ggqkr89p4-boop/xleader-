exports.handler = async function(event, context) {
  const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";
  const HANDLES = ["zbriefkani","haidari_ii","K992Zhraa","shang_salar","fenk24","adamrizgar","mohammed_fayeqA","ahmed_hazharr","safinbarzany"];

  try {
    // 1. Fetch user details for all handles
    const userUrl = `https://api.twitter.com/2/users/by?usernames=${HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name`;
    const userRes = await fetch(userUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });
    const userData = await userRes.json();
    if (!userData.data) throw new Error("No user data returned");

    const users = userData.data;
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();

    // 2. For each user, fetch their recent tweets (last 24h)
    const usersWithTweets = await Promise.all(users.map(async (user) => {
      try {
        // Get user ID
        const idUrl = `https://api.twitter.com/2/users/by/username/${user.username}`;
        const idRes = await fetch(idUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });
        const idJson = await idRes.json();
        if (!idJson.data) return { ...user, tweets: [], tweetsError: "No ID" };
        const userId = idJson.data.id;

        // Fetch tweets
        const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url&max_results=10&start_time=${oneDayAgo}`;
        const tweetsRes = await fetch(tweetsUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });
        const tweetsJson = await tweetsRes.json();

        const tweets = tweetsJson.data || [];
        const mediaMap = new Map();
        if (tweetsJson.includes?.media) {
          tweetsJson.includes.media.forEach(media => {
            mediaMap.set(media.media_key, media.url || media.preview_image_url);
          });
        }
        const formattedTweets = tweets.map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at,
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          retweet_count: tweet.public_metrics?.retweet_count || 0,
          media_url: tweet.attachments?.media_keys?.[0] ? (mediaMap.get(tweet.attachments.media_keys[0]) || null) : null,
          tweet_url: `https://twitter.com/${user.username}/status/${tweet.id}`
        }));
        return { ...user, tweets: formattedTweets };
      } catch (err) {
        console.error(`Failed for ${user.username}:`, err.message);
        return { ...user, tweets: [], tweetsError: err.message };
      }
    }));

    // 3. Return combined data
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ data: usersWithTweets })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};