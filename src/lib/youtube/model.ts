import {z} from 'zod';
import {APPS} from '../admin/types';
export const statuses=['draft','needs-facts','ready-to-record','recorded','editing','ready-for-review','ready-to-upload','published'] as const;
export const draftSchema=z.object({id:z.string().regex(/^[a-z0-9][a-z0-9_-]{2,99}$/),app:z.enum(APPS),date:z.string().regex(/^\d{4}-\d\d-\d\d$/).refine(s=>Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s),title:z.string().trim().min(1).max(300),body:z.string().min(1).max(120000),notes:z.string().max(20000).default(''),status:z.enum(statuses).default('draft'),businessProcess:z.boolean().default(false),recordingRef:z.string().regex(/^(?:recording:[a-zA-Z0-9_-]{1,100})?$/).default(''),publishedUrl:z.string().max(500).default('')}).strict().superRefine((s,c)=>{if(s.status==='published'&&!/^https:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(s.publishedUrl))c.addIssue({code:'custom',message:'Published status needs an actual YouTube permalink'});});
export type Draft=z.infer<typeof draftSchema>;
export type Script=Draft&{version:number;updatedAt:string;sourceDigest:string};
export const writeSchema=z.object({mode:z.enum(['import','save']),baseVersion:z.number().int().min(0),script:draftSchema}).strict();
// CAS + immutable version insertion share one database statement/transaction.
export const WRITE_SQL=`WITH changed AS (
 INSERT INTO tao_admin_items(kind,item_key,payload) SELECT 'youtube_scripts',$1,$2::jsonb WHERE $3::int=0
 ON CONFLICT(kind,item_key) DO NOTHING RETURNING payload
), updated AS (
 UPDATE tao_admin_items SET payload=$2::jsonb,updated_at=now()
 WHERE kind='youtube_scripts' AND item_key=$1 AND $3::int>0 AND (payload->>'version')::int=$3::int
 RETURNING payload
), accepted AS (SELECT payload FROM changed UNION ALL SELECT payload FROM updated), history AS (
 INSERT INTO tao_admin_items(kind,item_key,payload) SELECT 'youtube_versions',$1||':v'||(payload->>'version'),payload FROM accepted RETURNING payload
) SELECT payload FROM history`;
