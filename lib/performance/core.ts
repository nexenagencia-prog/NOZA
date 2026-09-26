import {createClient} from '../supabase/client';

export const PERFORMANCE_SKILLS=['Percepção','Investigação','Cognição','Raciocínio','Psicologia','Persuasão','Vendas','Objeções','Adaptabilidade','Influência','Repertório','Metacognição'] as const;
export type PerformanceSkill=typeof PERFORMANCE_SKILLS[number];

const ALIASES:Record<string,PerformanceSkill>={
 'percepção':'Percepção','percepcao':'Percepção','leitura de contexto':'Percepção','escuta':'Percepção',
 'investigação':'Investigação','investigacao':'Investigação','perguntas':'Investigação',
 'cognição':'Cognição','cognicao':'Cognição','regulação':'Cognição','regulacao':'Cognição',
 'raciocínio':'Raciocínio','raciocinio':'Raciocínio','decisão':'Raciocínio','decisao':'Raciocínio','objetividade':'Raciocínio',
 'psicologia':'Psicologia','autopercepção':'Psicologia','autopercepcao':'Psicologia',
 'persuasão':'Persuasão','persuasao':'Persuasão','argumentação':'Persuasão','argumentacao':'Persuasão',
 'vendas':'Vendas','condução':'Vendas','conducao':'Vendas',
 'objeções':'Objeções','objecoes':'Objeções',
 'adaptabilidade':'Adaptabilidade','flexibilidade':'Adaptabilidade',
 'influência':'Influência','influencia':'Influência','comunicação':'Influência','comunicacao':'Influência','clareza':'Influência',
 'repertório':'Repertório','repertorio':'Repertório','atualização':'Repertório','atualizacao':'Repertório',
 'metacognição':'Metacognição','metacognicao':'Metacognição'
};
export function normalizePerformanceSkill(skill?:string|null):PerformanceSkill|null{
 if(!skill)return null;
 const key=skill.trim().toLocaleLowerCase('pt-BR');
 return ALIASES[key]||PERFORMANCE_SKILLS.find(x=>x.toLocaleLowerCase('pt-BR')===key)||null;
}

export async function recordPerformanceEvidence(input:{source:'calibration'|'meeting'|'human_pro'|'training'|'manual';eventType:string;skill?:string;score?:number;confidence?:number;evidence?:string;metadata?:Record<string,unknown>}){
 const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user)return null;
 const canonicalSkill=normalizePerformanceSkill(input.skill);
 const metadata={...(input.metadata||{}),...(input.skill&&canonicalSkill&&input.skill!==canonicalSkill?{observed_skill:input.skill}: {})};
 const {data,error}=await s.from('performance_events').insert({user_id:user.id,source:input.source,event_type:input.eventType,skill:canonicalSkill||input.skill||null,score:input.score??null,confidence:input.confidence??null,evidence:input.evidence||null,metadata}).select().single();
 if(error)throw error;
 if(canonicalSkill&&typeof input.score==='number'){
  const incoming=Math.max(0,Math.min(100,Number(input.score)));
  const incomingConfidence=Math.max(.05,Math.min(1,Number(input.confidence??.35)));
  const {data:current}=await s.from('skill_profiles').select('*').eq('user_id',user.id).eq('skill',canonicalSkill).maybeSingle();
  const count=Number(current?.evidence_count||0)+1;
  const oldScore=Number(current?.score??0),oldConfidence=Math.max(0,Math.min(1,Number(current?.confidence||0)));
  const oldWeight=current?Math.max(.15,oldConfidence)*Math.min(Number(current.evidence_count||1),6):0;
  const sourceWeight=input.source==='meeting'?1.15:input.source==='calibration'?.8:input.source==='training'?.7:.65;
  const newWeight=incomingConfidence*sourceWeight;
  const score=Math.round((oldWeight?((oldScore*oldWeight)+(incoming*newWeight))/(oldWeight+newWeight):incoming)*10)/10;
  const confidence=Math.round(Math.min(.98,1-(1-oldConfidence)*(1-Math.min(.32,incomingConfidence*.22)))*100)/100;
  await s.from('skill_profiles').upsert({user_id:user.id,skill:canonicalSkill,score,confidence,evidence_count:count,trend:Math.round((score-oldScore)*10)/10,last_evidence:input.evidence||current?.last_evidence||null,updated_at:new Date().toISOString()});
 }
 return data;
}

export type SkillIntelligence={skill:string;score:number;confidence:number;evidenceCount:number;trend:number;direction:'rising'|'falling'|'stable'|'insufficient';recurrence:number;contradiction:number;recentAverage:number|null;previousAverage:number|null;latestEvidence:string|null};

function buildSkillIntelligence(skills:any[],events:any[]):SkillIntelligence[]{
 const now=Date.now(),day=86400000;
 return skills.map((profile:any)=>{
  const canonical=normalizePerformanceSkill(profile.skill)||profile.skill;
  const evidence=events.filter((e:any)=>(normalizePerformanceSkill(e.skill)||e.skill)===canonical&&typeof e.score==='number').sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  const weighted=(items:any[])=>{let total=0,weight=0;items.forEach((e:any)=>{const age=Math.max(0,(now-new Date(e.created_at).getTime())/day);const recency=Math.exp(-age/90);const confidence=Math.max(.1,Math.min(1,Number(e.confidence??.35)));const source=e.source==='meeting'?1.15:e.source==='calibration'?.8:e.source==='training'?.7:.65;const w=recency*confidence*source;total+=Number(e.score)*w;weight+=w});return weight?Math.round(total/weight*10)/10:null};
  const recent=evidence.slice(0,Math.min(5,evidence.length)),previous=evidence.slice(5,10);
  const recentAverage=weighted(recent),previousAverage=weighted(previous);
  const trend=recentAverage!==null&&previousAverage!==null?Math.round((recentAverage-previousAverage)*10)/10:Number(profile.trend||0);
  const direction:SkillIntelligence['direction']=evidence.length<2?'insufficient':trend>2?'rising':trend< -2?'falling':'stable';
  const recurrence=evidence.length;
  const scores=evidence.map((e:any)=>Number(e.score));const spread=scores.length>1?Math.max(...scores)-Math.min(...scores):0;
  const contradiction=Math.round(Math.min(1,spread/45)*100)/100;
  return {skill:canonical,score:Number(profile.score||0),confidence:Number(profile.confidence||0),evidenceCount:Number(profile.evidence_count||0),trend,direction,recurrence,contradiction,recentAverage,previousAverage,latestEvidence:profile.last_evidence||evidence[0]?.evidence||null};
 });
}

export async function getPerformanceProfile(){
 const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user)return {skills:[],events:[],goals:[],intelligence:[]};
 const [{data:skills},{data:events},{data:goals}]=await Promise.all([
  s.from('skill_profiles').select('*').eq('user_id',user.id).order('score',{ascending:false}),
  s.from('performance_events').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(40),
  s.from('development_goals').select('*').eq('user_id',user.id).eq('status','active').order('created_at',{ascending:false})
 ]);
 const safeSkills=skills||[],safeEvents=events||[];return {skills:safeSkills,events:safeEvents,goals:goals||[],intelligence:buildSkillIntelligence(safeSkills,safeEvents)};
}
