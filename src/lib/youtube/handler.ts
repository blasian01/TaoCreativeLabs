import{denied}from '../admin/handlers';import{PRIVATE_HEADERS}from '../admin/domain';import{boundedJson}from '../admin/security';import{writeSchema,type Draft}from './model';
export async function handleWrite(req:Request,state:Parameters<typeof denied>[0],write:(d:Draft,b:number,m:'import'|'save')=>Promise<unknown>){
 if(state!=='owner')return denied(state);
 if(!req.headers.get('origin')||req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Same-origin owner request required'},{status:403,headers:PRIVATE_HEADERS});
 let body;try{body=writeSchema.parse(await boundedJson(req));if(body.mode==='import'&&body.baseVersion!==0)throw Error('invalid');}catch{return Response.json({error:'Invalid bounded script request'},{status:400,headers:PRIVATE_HEADERS});}
 try{return Response.json(await write(body.script,body.baseVersion,body.mode),{headers:PRIVATE_HEADERS});}catch(e){const conflict=(e as Error).message==='conflict';return Response.json({error:conflict?'Version conflict: reload current script; your unsaved text is retained.':'Script storage unavailable'},{status:conflict?409:503,headers:PRIVATE_HEADERS});}
}
