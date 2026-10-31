import {jwtVerify,createRemoteJWKSet,type JWTVerifyGetKey} from 'jose';
export type ViewerRole='portfolio'|'creative';
export type Viewer={clientId:string;role:ViewerRole};
export type ViewerClients=Record<string,ViewerRole>;
export function parseViewerClients(raw:string|undefined):ViewerClients{
 if(!raw)return {};try{const value=JSON.parse(raw);if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).length>25) return {};
 if(Object.entries(value).some(([id,role])=>!/^[A-Za-z0-9_-]{8,100}$/.test(id)||!['portfolio','creative'].includes(String(role))))return {};return value;}catch{return {};}
}
export function viewerVerifier(issuer:string,audience:string,clients:ViewerClients,jwks:JWTVerifyGetKey){
 return async(header:string|null):Promise<Viewer|null>=>{
 if(!header?.startsWith('Bearer ')||header.length>12000)return null;
 try{const {payload}=await jwtVerify(header.slice(7),jwks,{issuer,audience,algorithms:['RS256'],maxTokenAge:'1h',requiredClaims:['exp','iat','sub','azp','scope']});
 const id=payload.azp;if(typeof id!=='string'||!Object.hasOwn(clients,id)||payload.sub!==id+'@clients'||payload.gty!=='client-credentials'||typeof payload.scope!=='string'||!payload.scope.split(' ').includes('read:marketing')||typeof payload.exp!=='number'||typeof payload.iat!=='number'||payload.exp-payload.iat>3600)return null;
 return {clientId:id,role:clients[id]};}catch{return null;}
 };
}
let verify:ReturnType<typeof viewerVerifier>|undefined;
export function configuredViewerVerifier(){
 const clients=parseViewerClients(process.env.MARKETING_VIEWER_CLIENTS);
 const domain=process.env.AUTH0_DOMAIN,audience=process.env.MARKETING_API_AUDIENCE;
 if(!domain||!/^[a-z0-9.-]+\.auth0\.com$/.test(domain)||!audience||!Object.keys(clients).length)return null;
 return verify??=viewerVerifier(`https://${domain}/`,audience,clients,createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`),{timeoutDuration:5000,cooldownDuration:30000}));
}
