// netlify/functions/xapi.js

exports.handler = async (event, context) => {
  // It is safest to keep your Token hidden in environment variables, 
  // but we fallback to your hardcoded one so it works out of the box.
  const BEARER_TOKEN = process.env.X_BEARER_TOKEN || "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";
  
  const HANDLES = ["zbriefkani","haidari_ii","K992Zhraa","shang_salar","fenk24","adamrizgar","mohammed_fayeqA","ahmed_hazharr","safinbarzany","MEJPUK"];
  const usernames = HANDLES.join(',');

  try {
    // 1. Fetch all user profile information and follower counts
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by?usernames=${usernames}&user.fields=profile_image_url,public_metrics`, 
      {
        headers: { 
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const userJson = await userResponse.json();

    if (!userJson.data) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Failed to fetch users from X API", details: userJson })
      };
    }

    // 2. Loop through each user and grab their latest tweets to calculate real live metrics
    const enrichedData = await Promise.all(userJson.data.map(async (user) => {
      try {
        const tweetResponse = await fetch(
          `https://api.twitter.com/2/users/${user.id}/tweets?tweet.fields=public_metrics,created_at&max_results=5`,
          {
            headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` }
          }
        );
        const tweetJson = await tweetResponse.json();
        
        // Format the tweets array to perfectly match what your frontend parsing rules expect
        const tweets = (tweetJson.data || []).map(tweet => ({
          text: tweet.text,
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          media_url: null // Media details require media.fields expansions; kept null for direct lightweight loading
        }));

        return {
          ...user,
          tweets: tweets
        };
      } catch (tweetError) {
        // Fallback gracefully per-user if a specific timeline block is locked or restricted
        return {
          ...user,
          tweets: []
        };
      }
    }));

    // 3. Return payload structure cleanly to your frontend dashboard application
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: enrichedData })
    };

  } catch (globalError) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal Server Error", message: globalError.message })
    };
  }
};
