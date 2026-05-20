// netlify/functions/xapi.js

exports.handler = async (event, context) => {
  const BEARER_TOKEN = process.env.X_BEARER_TOKEN || "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";
  const HANDLES = ["zbriefkani","haidari_ii","K992Zhraa","shang_salar","fenk24","adamrizgar","mohammed_fayeqA","ahmed_hazharr","safinbarzany","MEJPUK"];
  const usernames = HANDLES.join(',');

  try {
    // 1. Fetch user profile data
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by?usernames=${usernames}&user.fields=profile_image_url,public_metrics`, 
      {
        headers: { 'Authorization': `Bearer ${BEARER_TOKEN}`, 'Content-Type': 'application/json' }
      }
    );
    const userJson = await userResponse.json();

    if (!userJson.data) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to fetch users", details: userJson })
      };
    }

    // 2. Fetch up to 100 recent tweets per user to parse real timelines
    const enrichedData = await Promise.all(userJson.data.map(async (user) => {
      try {
        const tweetResponse = await fetch(
          `https://api.twitter.com/2/users/${user.id}/tweets?tweet.fields=public_metrics,created_at&max_results=100`,
          { headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` } }
        );
        const tweetJson = await tweetResponse.json();
        
        const tweets = (tweetJson.data || []).map(tweet => ({
          text: tweet.text,
          created_at: tweet.created_at, // Crucial for filtering real dates
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0
        }));

        return { ...user, tweets };
      } catch (e) {
        return { ...user, tweets: [] };
      }
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ data: enrichedData })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
