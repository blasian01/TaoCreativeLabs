import test from 'node:test';import assert from 'node:assert/strict';
import {deliveryPlan} from '../../src/lib/admin/planning';import type{Publication}from '../../src/lib/admin/types';
const p:Publication={app:'aura',platform:'facebook',date:'2026-10-31',slot:'12',status:'published',permalink:'https://facebook.com/posts/123',caption:'Synthetic fixture',concept:'Test',observedAt:'2026-10-31T16:00:00Z',source:'Synthetic fixture'};
test('portfolio plan separates105total80active25paused without treating pause as failure',()=>{const x=deliveryPlan([],'2026-10-31');assert.deepEqual([x.target,x.activeTarget,x.pausedTarget,x.verifiedPublications],[105,80,25,0]);});
test('app and platform targets select exact denominators; X has zero active target',()=>{assert.equal(deliveryPlan([],'2026-10-31','aura').target,21);const x=deliveryPlan([],'2026-10-31',undefined,'x');assert.equal(x.target,25);assert.equal(x.activeTarget,0);assert.equal(deliveryPlan([],'2026-10-31','aura','linkedin').activeTarget,1);});
test('actuals dedupe verified permalinks on exact date; drafts and other dates do not count',()=>{const x=deliveryPlan([p,p,{...p,status:'draft',permalink:null,slot:'15'},{...p,date:'2026-10-30'}],'2026-10-31');assert.equal(x.verifiedPublications,1);assert.equal(x.verifiedActivePlatformPublications,1);});
test('historical X publication stays actual without reclassifying pause or execution',()=>{const x=deliveryPlan([{...p,platform:'x',permalink:'https://x.com/example/status/123'}],'2026-10-31');assert.equal(x.verifiedPausedPlatformPublications,1);assert.equal(x.activeTarget,80);});

test('November3 Aura-only X resume updates current denominators, preserves other apps and earlier dates',()=>{
 const current=deliveryPlan([],'2026-11-03');assert.deepEqual([current.target,current.activeTarget,current.pausedTarget],[105,85,20]);
 assert.deepEqual([deliveryPlan([],'2026-11-03','aura','x').activeTarget,deliveryPlan([],'2026-11-03','aura','x').pausedTarget],[5,0]);
 for(const app of ['reelchef','agentic-media','glyph','notare'] as const)assert.equal(deliveryPlan([],'2026-11-03',app,'x').pausedTarget,5);
 assert.equal(deliveryPlan([],'2026-11-02','aura','x').pausedTarget,5);assert.equal(deliveryPlan([],'2026-11-03',undefined,'x').activeTarget,5);
});
test('dated policy classifies actuals without rewriting blocked publication history',()=>{
 const blocked:Publication={...p,platform:'x',status:'blocked',permalink:null};const rows:Publication[]=[blocked,{...p,date:'2026-11-03',platform:'x',permalink:'https://x.com/wearaura_/status/123'},{...p,date:'2026-11-03',app:'glyph',platform:'x',permalink:'https://x.com/example/status/456'}];
 const before=JSON.stringify(rows),current=deliveryPlan(rows,'2026-11-03');assert.equal(current.verifiedActivePlatformPublications,1);assert.equal(current.verifiedPausedPlatformPublications,1);assert.equal(JSON.stringify(rows),before);assert.equal(blocked.status,'blocked');
});
