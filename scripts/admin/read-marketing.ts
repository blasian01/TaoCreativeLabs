/** Agent-side read-only helper. Inject credentials at process startup through approved secure binding, including OpenBot's approved private store. Never secret values in CLI arguments, logs or shared/project files. */
async function main(){
 const domain=process.env.TAO_MARKETING_AUTH0_DOMAIN,audience=process.env.TAO_MARKETING_AUDIENCE,clientId=process.env.TAO_MARKETING_CLIENT_ID,secret=process.env.TAO_MARKETING_CLIENT_SECRET;
 if(!domain||!/^[a-z0-9.-]+\.auth0\.com$/.test(domain)||!audience||!clientId||!secret)throw new Error('Secure service credential binding required');
 if(audience!=='https://www.taocreativelabs.com/api/marketing')throw new Error('Unexpected marketing audience');
 const tokenResponse=await fetch(`https://${domain}/oauth/token`,{method:'POST',redirect:'error',headers:{'content-type':'application/json'},body:JSON.stringify({client_id:clientId,client_secret:secret,audience,grant_type:'client_credentials',scope:'read:marketing'})});
 if(!tokenResponse.ok)throw new Error('Read-only service token exchange rejected');
 const auth=await tokenResponse.json();if(typeof auth.access_token!=='string')throw new Error('Read-only service token missing');
 const url=new URL('https://www.taocreativelabs.com/api/marketing/evidence');
 for(const arg of process.argv.slice(2)){const pair=arg.split('=');if(pair.length!==2||!['app','platform','from','through','status','format','offset','limit','observationOffset'].includes(pair[0]))throw new Error('Invalid evidence query');url.searchParams.set(pair[0],pair[1]);}
 const response=await fetch(url,{redirect:'error',headers:{authorization:`Bearer ${auth.access_token}`}});if(!response.ok)throw new Error('Protected marketing read rejected');
 console.log(JSON.stringify(await response.json()));
}
main().catch(()=>{console.error('Marketing read failed; verify secure read-only identity/configuration. No token or secret logged.');process.exitCode=1;});
export {};
