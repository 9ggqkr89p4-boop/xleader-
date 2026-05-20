exports.handler = async function(event, context) {
  const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";
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

  const range = event.queryStringParameters?.range || "daily";
  const rangeMap = { daily: 1, weekly: 7 };
  const days = rangeMap[range] || 1;
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Wait helper to avoid rate limits
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  async function fetchAllTweets(userId, username) {
    let allTweets = [];
    let nextToken = null;

    do {
      const paginationParam = nextToken ? `&pagination_token=${nextToken}` : "";
      const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url&max_results=100&start_time=${startTime}${paginationParam}`;

      const tweetsRes = await fetch(tweetsUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });

      // If rate limited, wait 15 seconds and retry once
      if (tweetsRes.status === 429) {
        console.warn(`Rate limited on ${username}, waiting 15s...`);
        await wait(15000);
        continue;
      }

      const tweetsJson = await tweetsRes.json();

      if (tweetsJson.errors || !tweetsJson.data) {
        console.error(`No data for ${username}:`, JSON.stringify(tweetsJson));
        break;
      }

      const mediaMap = new Map();
      if (tweetsJson.includes?.media) {
        tweetsJson.includes.media.forEach(media => {
          mediaMap.set(media.media_key, media.url || media.preview_image_url);
        });
      }

      const pageTweets = tweetsJson.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        like_count: tweet.public_metrics?.like_count || 0,
        reply_count: tweet.public_metrics?.reply_count || 0,
        retweet_count: tweet.public_metrics?.retweet_count || 0,
        media_url: tweet.attachments?.media_keys?.[0]
          ? (mediaMap.get(tweet.attachments.media_keys[0]) || null)
          : null,
        tweet_url: `https://twitter.com/${username}/status/${tweet.id}`
      }));

      allTweets = allTweets.concat(pageTweets);
      nextToken = tweetsJson.meta?.next_token || null;

      if (allTweets.length >= 500) break;

      // Small delay between pages
      if (nextToken) await wait(1000);

    } while (nextToken);

    return allTweets;
  }

  try {
    const userUrl = `https://api.twitter.com/2/users/by?usernames=${REQUIRED_HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name`;
    const userRes = await fetch(userUrl, { headers: { "Authorization": `Bearer ${BEARER}` } });
    const userData = await userRes.json();

    const foundMap = new Map();
    if (userData.data) {
      userData.data.forEach(u => foundMap.set(u.username.toLowerCase(), u));
    }

    // Process users ONE BY ONE instead of all at once
    const usersWithTweets = [];
    for (const handle of REQUIRED_HANDLES) {
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
      if (!isPlaceholder) {
        try {
          tweets = await fetchAllTweets(user.id, user.username);
        } catch (err) {
          console.error(`Tweet fetch failed for ${handle}:`, err.message);
        }
      }

      usersWithTweets.push({ ...user, tweets, placeholder: isPlaceholder });

      // 1 second delay between each user to respect rate limits
      await wait(1000);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ range, data: usersWithTweets })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
