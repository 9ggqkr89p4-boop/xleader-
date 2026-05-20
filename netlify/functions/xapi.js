exports.handler = async function(event, context) {
  const BEARER = "YOUR_BEARER_TOKEN";

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

  try {

    const userUrl =
      `https://api.twitter.com/2/users/by?usernames=${REQUIRED_HANDLES.join(",")}&user.fields=public_metrics,profile_image_url,description,name`;

    const userRes = await fetch(userUrl, {
      headers: {
        "Authorization": `Bearer ${BEARER}`
      }
    });

    const userData = await userRes.json();

    console.log("USER DATA:", userData);

    const foundMap = new Map();

    if (userData.data) {
      userData.data.forEach(u => {
        foundMap.set(u.username.toLowerCase(), u);
      });
    }

    const now = Date.now();

    const dailyDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const weeklyDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthlyDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    const usersWithTweets = await Promise.all(

      REQUIRED_HANDLES.map(async (handle) => {

        let user = foundMap.get(handle.toLowerCase());

        let isPlaceholder = false;

        if (!user) {

          isPlaceholder = true;

          user = {
            username: handle,
            name: handle,
            public_metrics: {
              tweet_count: 0,
              followers_count: 0,
              following_count: 0
            },
            profile_image_url: null,
            description: null
          };
        }

        let tweets = [];

        let stats = {
          daily: 0,
          weekly: 0,
          monthly: 0
        };

        if (!isPlaceholder) {

          try {

            const tweetsUrl =
              `https://api.twitter.com/2/users/${user.id}/tweets?tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url&max_results=100`;

            const tweetsRes = await fetch(tweetsUrl, {
              headers: {
                "Authorization": `Bearer ${BEARER}`
              }
            });

            const tweetsJson = await tweetsRes.json();

            console.log(`TWEETS ${handle}:`, tweetsJson);

            const rawTweets = tweetsJson.data || [];

            const mediaMap = new Map();

            if (tweetsJson.includes?.media) {
              tweetsJson.includes.media.forEach(media => {
                mediaMap.set(
                  media.media_key,
                  media.url || media.preview_image_url
                );
              });
            }

            rawTweets.forEach(tweet => {

              const created = new Date(tweet.created_at).getTime();

              if (created >= new Date(dailyDate).getTime()) {
                stats.daily++;
              }

              if (created >= new Date(weeklyDate).getTime()) {
                stats.weekly++;
              }

              if (created >= new Date(monthlyDate).getTime()) {
                stats.monthly++;
              }

            });

            tweets = rawTweets.map(tweet => ({
              id: tweet.id,
              text: tweet.text,
              created_at: tweet.created_at,
              like_count: tweet.public_metrics?.like_count || 0,
              reply_count: tweet.public_metrics?.reply_count || 0,
              retweet_count: tweet.public_metrics?.retweet_count || 0,
              media_url:
                tweet.attachments?.media_keys?.[0]
                  ? (mediaMap.get(tweet.attachments.media_keys[0]) || null)
                  : null,
              tweet_url:
                `https://twitter.com/${user.username}/status/${tweet.id}`
            }));

          } catch (err) {

            console.error(`Tweet fetch failed for ${handle}:`, err.message);

          }
        }

        return {
          ...user,
          tweets,
          stats,
          placeholder: isPlaceholder
        };

      })

    );

    return {

      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      },

      body: JSON.stringify({
        data: usersWithTweets
      })

    };

  } catch (error) {

    return {

      statusCode: 500,

      headers: {
        "Access-Control-Allow-Origin": "*"
      },

      body: JSON.stringify({
        error: error.message
      })

    };

  }
};