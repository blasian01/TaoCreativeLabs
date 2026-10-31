import {PRIVATE_HEADERS} from './domain';
import {denied} from './handlers';
import {mediaAssetSchema,mediaRefSchema} from './media-schema';
export async function handleMedia(state:'owner'|'anonymous'|'forbidden'|'unconfigured',ref:string|null,read:(ref:string)=>Promise<unknown>){
 if(state!=='owner')return denied(state);
 if(!mediaRefSchema.safeParse(ref).success)return Response.json({error:'Invalid media reference'},{status:400,headers:PRIVATE_HEADERS});
 try{
  const value=await read(ref!);if(!value)return Response.json({error:'Preview not imported'},{status:404,headers:PRIVATE_HEADERS});
  const asset=mediaAssetSchema.parse(value);
  return new Response(new Uint8Array(Buffer.from(asset.base64,'base64')),{headers:{...PRIVATE_HEADERS,'Content-Type':asset.contentType,'Content-Security-Policy':"default-src 'none'; sandbox",'X-Robots-Tag':'noindex, nofollow'}});
 }catch{return Response.json({error:'Preview temporarily unavailable'},{status:503,headers:PRIVATE_HEADERS});}
}
