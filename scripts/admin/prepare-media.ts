import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ingestionSchema} from '../../src/lib/admin/validation';
const[input,alt,output]=process.argv.slice(2);
if(!input||!alt||!output)throw Error('Usage: tsx scripts/admin/prepare-media.ts INPUT_IMAGE ALT_TEXT PRIVATE_OUTPUT_JSON');
const bytes=readFileSync(input);
if(bytes.length>240000)throw Error('Supply an approved dashboard preview no larger than 240000 bytes; this adapter never edits the image');
const digest=createHash('sha256').update(bytes).digest('hex');
const contentType=bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a'?'image/png':bytes.subarray(0,3).toString('hex')==='ffd8ff'?'image/jpeg':'image/webp';
const ref='archive:media:'+digest;
const payload=ingestionSchema.parse({schemaVersion:1,batchId:'media_'+digest,observedAt:new Date().toISOString(),mediaAssets:[{ref,contentType,base64:bytes.toString('base64'),alt}]});
// Retain this exact envelope for idempotent retries; regenerating its timestamp
// under the same batch ID is a different body and must conflict.
writeFileSync(output,JSON.stringify(payload),{mode:0o600,flag:'wx'});
console.log(ref);
