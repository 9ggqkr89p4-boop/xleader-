exports.handler = async function () {

const BEARER = process.env.X_BEARER;

const HANDLES = [
"zbriefkani",
"haidari_ii",
"K992Zhraa",
"shang_salar",
"fenk24",
"adamrizgar",
"mohammed_fayeqA",
"ahmed_hazharr",
"safinbarzany"
];

try {

const url =
https://api.twitter.com/2/users/by?usernames=${HANDLES.join(',')}&user.fields=public_metrics,profile_image_url,description,name;

const response = await fetch(url,{
headers:{
Authorization:Bearer ${BEARER}
}
});

const data = await response.json();

return {
statusCode:200,
headers:{
"Content-Type":"application/json",
"Access-Control-Allow-Origin":""
},
body:JSON.stringify(data)
};

} catch(error){

return {
statusCode:500,
headers:{
"Access-Control-Allow-Origin":""
},
body:JSON.stringify({
error:error.message
})
};

}

};