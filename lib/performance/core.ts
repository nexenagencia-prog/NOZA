import {createClient} from '../supabase/client';

export const PERFORMANCE_SKILLS=['Percepção','Investigação','Cognição','Raciocínio','Psicologia','Persuasão','Vendas','Objeções','Adaptabilidade','Influência','Repertório','Metacognição'] as const;

export async function recordPerformanceEvidence(input:{source:'calibration'|'meeting'|'human_pro'|'training'|'manual';eventType:string;skill?:string;score?:number;confidence?:number;evidence?:string;metadata?:Record<string,unknown>}){
 const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user)return null;
 const {data,error}=await s.from('performance_events').insert({user_id:user.id,source:input.source,event_type:input.eventType,skill:input.skill||null,score:input.score??null,confidence:input.confidence??null,evidence:input.evidence||null,metadata:input.metadata||{}}).select().single();
 if(error)throw error;
 if(input.skill&&typeof input.score==='number'){
  const {data:current}=await s.from('skill_profiles').select('*').eq('user_id',user.id).eq('skill',input.skill).maybeSingle();
  const count=(current?.evidence_count||0)+1;const old=Number(current?.score??input.score);const confidence=Math.min(1,Number(current?.confidence||0)+.12);
  const score=Math.round((old*(count-1)+input.score)/count*10)/10;
  await s.from('skill_profiles').upsert({user_id:user.id,skill:input.skill,score,confidence,evidence_count:count,trend:Math.round((score-old)*10)/10,last_evidence:input.evidence||current?.last_evidence||null,updated_at:new Date().toISOString()});
 }
 return data;
}

export async function getPerformanceProfile(){
 const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user)return {skills:[],events:[],goals:[]};
 const [{data:skills},{data:events},{data:goals}]=await Promise.all([
  s.from('skill_profiles').select('*').eq('user_id',user.id).order('score',{ascending:false}),
  s.from('performance_events').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(40),
  s.from('development_goals').select('*').eq('user_id',user.id).eq('status','active').order('created_at',{ascending:false})
 ]);
 return {skills:skills||[],events:events||[],goals:goals||[]};
}
