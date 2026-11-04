import {APPS,PLATFORMS,type Publication,type AppId,type Platform} from './types';
import {dedupePublications} from './domain';
export const POLICY={effectiveDate:'2026-10-31',timezone:'America/New_York',source:'Approved organic growth plan · October 31, 2026',dailyByPlatform:{tiktok:5,instagram:5,facebook:5,x:5,linkedin:1},pausedPlatforms:['x'] as Platform[],windows:['09','12','15','18','20'],offsetMinutes:{reelchef:0,aura:10,'agentic-media':20,glyph:30,notare:40},pilotVerifiedDays:14} as const;
export const AURA_X_RESUME={effectiveDate:'2026-11-03',source:'Founder instruction: unblock Aura X · November 3, 2026'} as const;
export function isPlatformPaused(app:AppId,platform:Platform,date:string){
 return POLICY.pausedPlatforms.includes(platform)&&!(app==='aura'&&platform==='x'&&date>=AURA_X_RESUME.effectiveDate);
}
export function xPolicyNotice(date:string){return date>=AURA_X_RESUME.effectiveDate?'Aura X pause lifted by founder on November 3. X remains paused for the other four apps. This plan display does not start publishing, paid actions or campaigns. Historical blocked records remain unchanged.':'Historical policy: X paused for all five apps. Aura’s November 3 exception does not rewrite earlier records.';}
export function deliveryPlan(rows:Publication[],date:string,brand?:AppId,platform?:Platform){
 const apps:readonly AppId[]=brand?[brand]:APPS;
 const platforms:readonly Platform[]=platform?[platform]:PLATFORMS;
 const target=apps.length*platforms.reduce((n,p)=>n+POLICY.dailyByPlatform[p],0);
 const paused=apps.reduce((sum,app)=>sum+platforms.filter(p=>isPlatformPaused(app,p,date)).reduce((n,p)=>n+POLICY.dailyByPlatform[p],0),0);
 const published=dedupePublications(rows).filter(p=>p.date===date&&apps.includes(p.app)&&platforms.includes(p.platform)&&p.status==='published'&&p.permalink);
 return {date,target,activeTarget:target-paused,pausedTarget:paused,verifiedPublications:published.length,verifiedPausedPlatformPublications:published.filter(p=>isPlatformPaused(p.app,p.platform,date)).length,verifiedActivePlatformPublications:published.filter(p=>!isPlatformPaused(p.app,p.platform,date)).length};
}
