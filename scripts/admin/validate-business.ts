import {readFileSync,writeFileSync} from 'node:fs';
import {parseSnapshot} from '../../src/lib/business-insights';
const [input,output]=process.argv.slice(2);
if(!input||!output)throw new Error('Explicit aggregate snapshot input/output paths required');
const snapshot=parseSnapshot(JSON.parse(readFileSync(input,'utf8')));
if(snapshot.observations.some(o=>o.evidence.authority==='synthetic_fixture')||snapshot.catalog.some(o=>o.evidence.authority==='synthetic_fixture'))throw new Error('Operational sync refuses synthetic fixtures');
writeFileSync(output,JSON.stringify(snapshot));
console.log(JSON.stringify({validatedObservations:snapshot.observations.length,catalogEntries:snapshot.catalog.length}));
