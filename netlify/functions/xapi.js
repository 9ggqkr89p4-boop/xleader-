exports.handler = async function(event, context) {
  const BEARER = "AAAAAAAAAAAAAAAAAAAAALeV9gEAAAAAuX5QA3jwd0G3TyB7C5fVwkqIx24%3Dxy64eGFbzC7SzRBPApsUJUy1CXkleLPhGJXyvbp3SfsSnMeKoe";
  const HANDLES = "zbriefkani,haidari_ii,K992Zhraa,shang_salar,fenk24,adamrizgar,mohammed_fayeqA,ahmed_hazharr,safinbarzany";
  try {
    const url = "https://api.twitter.com/2/users/by?usernames="+HANDLES+"&user.fields=public_metrics,profile_image_url,description,name";
    const res = await fetch(url, {headers:{"Authorization":"Bearer "+BEARER}});
    const data = await res.json();
    return {statusCode:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"},body:JSON.stringify(data)};
  } catch(e) {
    return {statusCode:500,headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({error:e.message})};
  }
};
