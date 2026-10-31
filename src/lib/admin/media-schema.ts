import {z} from 'zod';
import {createHash} from 'node:crypto';
export const mediaRefSchema=z.string().regex(/^archive:media:[a-f0-9]{64}$/);
export const mediaAssetSchema=z.object({ref:mediaRefSchema,contentType:z.enum(['image/png','image/jpeg','image/webp']),base64:z.string().min(16).max(320000).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),alt:z.string().trim().min(1).max(500)}).strict().refine(a=>{
 const b=Buffer.from(a.base64,'base64');
 const signature=a.contentType==='image/png'?b.subarray(0,8).toString('hex')==='89504e470d0a1a0a':a.contentType==='image/jpeg'?b.subarray(0,3).toString('hex')==='ffd8ff':b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP';
 return signature&&a.ref==='archive:media:'+createHash('sha256').update(b).digest('hex');
},'Image signature and content digest must match');
