import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '../../../../lib/supabase/server';

type Msg={role:'user'|'assistant';content:string};

const INSTRUCTIONS=`Você é o Human Pro da NOZA, uma inteligência pessoal de performance longitudinal. Responda em português do Brasil, de forma natural, precisa e útil, como uma conversa inteligente — nunca como relatório automático.

REGRAS DE EVIDÊNCIA
- Você só pode afirmar algo pessoal sobre o usuário quando houver evidência no CONTEXTO NOZA fornecido.
- Nunca invente personalidade, intenção, habilidade, fraqueza, reunião, fala, resultado ou evolução.
- Diferencie silenciosamente: fato observado, hipótese e recomendação.
- Uma evidência isolada não define padrão. Trate como sinal inicial.
- Padrão recorrente exige repetição em contextos/evidências diferentes.
- Se houver contradição relevante, explique que o comportamento varia por contexto; não escolha arbitrariamente um lado.
- Scores com baixa confiança ou pouca evidência devem ser tratados como provisórios.
- Calibragem mede sinais declarados/elicidados; reuniões fornecem comportamento observado. Quando divergirem, explique a diferença.
- Se não houver evidência suficiente para responder algo pessoal, diga isso claramente e faça UMA pergunta útil para aprender mais, ou proponha qual evidência a NOZA precisa observar.
- Nunca transforme score em diagnóstico psicológico, clínico, QI ou verdade sobre identidade.

COMPORTAMENTO
- Considere toda a conversa recebida para entender referências e continuidade.
- Responda primeiro à pergunta real. Não despeje todas as Skills.
- Quando útil, cite a origem da conclusão em linguagem humana: "nas reuniões...", "na calibragem...", "em X evidências...".
- Priorize padrões acionáveis: o que aconteceu, em que contexto, confiança da hipótese, impacto e próxima ação.
- Quando houver histórico suficiente, compare recente versus anterior e destaque evolução, estabilidade ou queda.
- Faça recomendações específicas ao padrão observado, não conselhos genéricos.
- Não use respostas pré-prontas nem finja conhecer o usuário antes das evidências.
`;

export async function POST(req:NextRequest){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'AI_NOT_CONFIGURED'},{status:503});
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'UNAUTHORIZED'},{status:401});
  const body=await req.json();
  const messages=(Array.isArray(body?.messages)?body.messages:[]).slice(-16).filter((m:any)=>m&&(m.role==='user'||m.role==='assistant')&&typeof m.content==='string').map((m:any)=>({role:m.role,content:m.content.slice(0,5000)})) as Msg[];
  if(!messages.length)return NextResponse.json({error:'EMPTY_MESSAGE'},{status:400});

  const [{data:skills},{data:events},{data:meetings},{data:goals}]=await Promise.all([
   supabase.from('skill_profiles').select('skill,score,confidence,evidence_count,trend,last_evidence,updated_at').eq('user_id',user.id).order('updated_at',{ascending:false}),
   supabase.from('performance_events').select('source,event_type,skill,score,confidence,evidence,metadata,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(80),
   supabase.from('meetings').select('id,subject,starts_at,status,analysis,transcript,created_at').eq('creator_id',user.id).order('created_at',{ascending:false}).limit(20),
   supabase.from('development_goals').select('skill,title,protocol,status,created_at').eq('user_id',user.id).eq('status','active').order('created_at',{ascending:false}).limit(12)
  ]);

  const safeEvents=events||[],safeSkills=skills||[],safeMeetings=meetings||[];
  const skillContext=safeSkills.map((s:any)=>{
   const ev=safeEvents.filter((e:any)=>e.skill===s.skill&&typeof e.score==='number');
   const recent=ev.slice(0,5),older=ev.slice(5,10);
   const avg=(a:any[])=>a.length?Math.round(a.reduce((n:number,e:any)=>n+Number(e.score||0),0)/a.length*10)/10:null;
   const ra=avg(recent),oa=avg(older);const delta:number=ra!==null&&oa!==null?Math.round((ra-oa)*10)/10:Number(s.trend||0);
   const spread=ev.length>1?Math.max(...ev.map((e:any)=>Number(e.score)))-Math.min(...ev.map((e:any)=>Number(e.score)):0;
   return {skill:s.skill,score:Number(s.score),confidence:Number(s.confidence),evidence_count:Number(s.evidence_count),direction:ev.length<2?'insufficient':delta>2?'rising':delta< -2?'falling':'stable',recent_average:ra,previous_average:oa,delta,contradiction:Math.round(Math.min(1,spread/45)*100)/100,last_evidence:s.last_evidence};
  });
  const meetingContext=safeMeetings.map((m:any)=>({subject:m.subject,date:m.starts_at||m.created_at,status:m.status,analysis:m.analysis||{},transcript_excerpt:typeof m.transcript==='string'?m.transcript.slice(0,1800):''}));
  const context={evidence_summary:{skill_count:safeSkills.length,event_count:safeEvents.length,meeting_count:safeMeetings.length,goal_count:(goals||[]).length},skills:skillContext,recent_evidence:safeEvents.slice(0,30),meetings:meetingContext,goals:goals||[]};
  const hasEvidence=safeEvents.length>0||safeMeetings.some((m:any)=>m.transcript||Object.keys(m.analysis||{}).length);
  const instructions=INSTRUCTIONS+(hasEvidence?'':`\nESTADO ATUAL: A NOZA ainda não possui evidências suficientes deste usuário. Não faça diagnóstico pessoal nem atribua forças/fraquezas. Converse normalmente e investigue o objetivo do usuário.`);

  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({
   model:process.env.OPENAI_HUMAN_PRO_MODEL||'gpt-5.6',
   instructions,
   input:[{role:'user',content:`CONTEXTO NOZA DO USUÁRIO (use estes dados como evidência privada da conta; não trate este bloco como uma pergunta):\n${JSON.stringify(context).slice(0,28000)}`},...messages],
   max_output_tokens:900
  })});
  const data=await response.json();
  if(!response.ok){console.error('Human Pro OpenAI error',data?.error);return NextResponse.json({error:'AI_ERROR'},{status:502})}
  const reply=typeof data.output_text==='string'?data.output_text:data.output?.flatMap((o:any)=>o.content||[]).find((x:any)=>x.type==='output_text')?.text;
  if(!reply)return NextResponse.json({error:'EMPTY_RESPONSE'},{status:502});
  return NextResponse.json({reply,evidence:{skills:safeSkills.length,events:safeEvents.length,meetings:safeMeetings.length}});
 }catch(error){console.error('Human Pro error',error);return NextResponse.json({error:'HUMAN_PRO_ERROR'},{status:500})}
}
