const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    // 1. Get the username from the frontend request URL
    const username = event.queryStringParameters.username;
    
    if (!username) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing username parameter" })
        };
    }

    // 2. Access your private X Bearer Token saved in your Netlify Environment Variables
    const token = process.env.X_BEARER_TOKEN;
    if (!token) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "X_BEARER_TOKEN is missing in Netlify settings" })
        };
    }

    try {
        // STEP A: Fetch the user's ID, Name, and Profile Picture details
        const userUrl = `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,public_metrics`;
        const userRes = await fetch(userUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const userData = await userRes.json();

        if (!userData.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: `User @${username} not found on X` })
            };
        }

        const userId = userData.data.id;
        const userMetrics = {
            name: userData.data.name,
            profile_image_url: userData.data.profile_image_url,
            followers_count: userData.data.public_metrics?.followers_count || 0
        };

        // STEP B: Fetch the user's latest tweets along with their timestamps and engagement values
        // This targets up to 100 recent tweets so we can check for posts made today
        const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,public_metrics&max_results=100`;
        const tweetsRes = await fetch(tweetsUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const tweetsData = await tweetsRes.json();

        // 3. Return both sets of data cleanly back to your frontend dashboard script
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_metrics: userMetrics,
                tweets: tweetsData
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Backend failed to fetch from X API: " + error.message })
        };
    }
};
