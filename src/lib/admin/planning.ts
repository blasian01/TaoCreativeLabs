import {APPS,PLATFORMS,type Publication,type AppId,type Platform} from './types';
import {dedupePublications} from './domain';
export const POLICY={effectiveDate:'2026-10-31',timezone:'America/New_York',source:'Approved organic growth plan · October 31, 2026',dailyByPlatform:{tiktok:5,instagram:5,facebook:5,x:5,linkedin:1},pausedPlatforms:['x'] as Platform[],windows:['09','12','15','18','20'],offsetMinutes:{reelchef:0,aura:10,'agentic-media':20,glyph:30,notare:40},pilotVerifiedDays:14} as const;
export function deliveryPlan(rows:Publication[],date:string,brand?:AppId,platform?:Platform){
 const apps:readonly AppId[]=brand?[brand]:APPS;
 const platforms:readonly Platform[]=platform?[platform]:PLATFORMS;
 const target=apps.length*platforms.reduce((n,p)=>n+POLICY.dailyByPlatform[p],0);
 const paused=apps.length*platforms.filter(p=>POLICY.pausedPlatforms.includes(p)).reduce((n,p)=>n+POLICY.dailyByPlatform[p],0);
 const published=dedupePublications(rows).filter(p=>p.date===date&&apps.includes(p.app)&&platforms.includes(p.platform)&&p.status==='published'&&p.permalink);
 return {date,target,activeTarget:target-paused,pausedTarget:paused,verifiedPublications:published.length,verifiedPausedPlatformPublications:published.filter(p=>POLICY.pausedPlatforms.includes(p.platform)).length,verifiedActivePlatformPublications:published.filter(p=>!POLICY.pausedPlatforms.includes(p.platform)).length};
}
