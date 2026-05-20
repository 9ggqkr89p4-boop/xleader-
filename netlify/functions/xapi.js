// netlify/functions/getTweets.js
exports.handler = async (event) => {
  const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";
  const username = event.queryStringParameters?.username;
  if (!username) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing username" }) };
  }
  try {
    // 1. Get user ID
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: { Authorization: `Bearer ${BEARER}` }
    });
    const userJson = await userRes.json();
    if (!userJson.data || !userJson.data.id) throw new Error("User not found");
    const userId = userJson.data.id;

    // 2. Get tweets from last 24h
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const url = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url&max_results=10&start_time=${oneDayAgo}`;
    const tweetsRes = await fetch(url, { headers: { Authorization: `Bearer ${BEARER}` } });
    const tweetsJson = await tweetsRes.json();
    
    const tweets = tweetsJson.data || [];
    const mediaMap = new Map();
    if (tweetsJson.includes?.media) {
      tweetsJson.includes.media.forEach(media => {
        mediaMap.set(media.media_key, media.url || media.preview_image_url);
      });
    }
    const result = tweets.map(tweet => {
      const mediaKey = tweet.attachments?.media_keys?.[0];
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        like_count: tweet.public_metrics?.like_count || 0,
        reply_count: tweet.public_metrics?.reply_count || 0,
        retweet_count: tweet.public_metrics?.retweet_count || 0,
        media_url: mediaKey ? (mediaMap.get(mediaKey) || null) : null,
        tweet_url: `https://twitter.com/${username}/status/${tweet.id}`
      };
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ data: result })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};