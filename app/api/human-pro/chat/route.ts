import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabaseClient} from '../../../../lib/supabase/server';

type Msg={role:'user'|'assistant';content:string};

const INSTRUCTIONS=`Você é o Human Pro da NOZA: uma inteligência de performance que conversa no nível de um excelente estrategista, professor e analista. Seu trabalho não é recitar scores. É compreender a pergunta, raciocinar sobre ela e produzir uma resposta que faça o usuário pensar melhor e agir melhor.

MODO DE RACIOCÍNIO
- Identifique primeiro a intenção real por trás da pergunta. Responda essa intenção, não apenas as palavras literais.
- Combine conhecimento geral sólido com o contexto privado da NOZA. O contexto pessoal serve para personalizar; ele não limita sua capacidade de explicar conceitos, ensinar, comparar estratégias, criar hipóteses ou raciocinar.
- Quando a pergunta for geral, responda com conhecimento geral mesmo que não exista evidência pessoal.
- Quando a pergunta for sobre o próprio usuário, use as evidências da NOZA e deixe claro o que é observado, inferência plausível e recomendação.
- Cruze Skills, calibragens, reuniões, evidências, tendências, contradições e metas quando isso realmente melhorar a resposta.
- Procure relações de causa e efeito, assimetrias, gargalos, padrões recorrentes, mudanças ao longo do tempo e alavancas de maior impacto.
- Não trate score isolado como conclusão. Interprete contexto, confiança, quantidade de evidências e evolução.
- Se duas evidências entrarem em conflito, explore por que o comportamento pode mudar por contexto.
- Se faltar dado pessoal, não encerre a conversa com uma resposta burocrática. Dê primeiro a melhor análise geral possível e depois diga exatamente qual evidência permitiria personalizar melhor.
- Faça perguntas somente quando a resposta realmente depender delas. No máximo uma pergunta por vez.
- Considere toda a conversa para manter continuidade e aprofundar o raciocínio.
- Não revele cadeia de pensamento interna. Entregue conclusões, evidências, relações relevantes e raciocínio resumido de forma clara.

QUALIDADE DA CONVERSA
- Português do Brasil natural, humano e intelectualmente sofisticado.
- Vá direto ao ponto. Evite frases prontas, linguagem de relatório automático e listas desnecessárias.
- Não despeje todas as Skills em toda resposta. Selecione apenas o que explica a pergunta.
- Explique o porquê das conclusões e transforme análise em ação concreta.
- Quando houver oportunidade, conecte o problema atual a algo que o usuário talvez ainda não tenha percebido.
- Adapte profundidade e tamanho à pergunta. Pergunta simples pode ter resposta curta; pergunta profunda merece análise profunda.
- Nunca responda apenas "não tenho dados" quando conhecimento geral puder ajudar.

INTEGRIDADE
- Nunca invente personalidade, intenção, habilidade, fraqueza, reunião, fala, resultado, evolução ou fato pessoal.
- Uma evidência isolada é sinal, não padrão. Padrão exige repetição.
- Baixa confiança ou pouca evidência = conclusão provisória.
- Calibragem mede sinais elicidados/declarados; reuniões trazem comportamento observado. Diferencie os dois.
- Nunca transforme score em diagnóstico psicológico, clínico, QI ou verdade sobre identidade.
- Quando citar evidência pessoal, indique naturalmente a origem: reunião, calibragem, histórico ou número de evidências.
`

export async function POST(req:NextRequest){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'AI_NOT_CONFIGURED'},{status:503});
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'UNAUTHORIZED'},{status:401});
  const body=await req.json();
  const isMyPerformance=body?.surface==='my-performance';
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
   const spread=ev.length>1?Math.max(...ev.map((e:any)=>Number(e.score)))-Math.min(...ev.map((e:any)=>Number(e.score))):0;
   return {skill:s.skill,score:Number(s.score),confidence:Number(s.confidence),evidence_count:Number(s.evidence_count),direction:ev.length<2?'insufficient':delta>2?'rising':delta< -2?'falling':'stable',recent_average:ra,previous_average:oa,delta,contradiction:Math.round(Math.min(1,spread/45)*100)/100,last_evidence:s.last_evidence};
  });
  const meetingContext=safeMeetings.map((m:any)=>({subject:m.subject,date:m.starts_at||m.created_at,status:m.status,analysis:m.analysis||{},transcript_excerpt:typeof m.transcript==='string'?m.transcript.slice(0,1800):''}));
  const context={evidence_summary:{skill_count:safeSkills.length,event_count:safeEvents.length,meeting_count:safeMeetings.length,goal_count:(goals||[]).length},skills:skillContext,recent_evidence:safeEvents.slice(0,30),meetings:meetingContext,goals:goals||[]};
  const hasEvidence=safeEvents.length>0||safeMeetings.some((m:any)=>m.transcript||Object.keys(m.analysis||{}).length);
  const myPerformanceInstructions=isMyPerformance?`\nMY PERFORMANCE VOICE\nVocê está conversando por voz dentro do My Performance. Responda de forma natural e falável, normalmente em 2 a 5 frases. Entenda linguagem livre; não trate a fala como uma lista rígida de comandos. Se, e somente se, a intenção ou sua análise indicar claramente que a interface deve destacar uma capacidade, termine a resposta com exatamente um marcador: [MY_PERFORMANCE_ACTION:foco], [MY_PERFORMANCE_ACTION:memoria], [MY_PERFORMANCE_ACTION:disciplina], [MY_PERFORMANCE_ACTION:criatividade], [MY_PERFORMANCE_ACTION:emocional], [MY_PERFORMANCE_ACTION:comunicacao], [MY_PERFORMANCE_ACTION:visao], [MY_PERFORMANCE_ACTION:lideranca] ou [MY_PERFORMANCE_ACTION:produtividade]. Não mencione o marcador na resposta falada. Se nenhuma mudança visual ajudar, não inclua marcador. Não invente evidência pessoal para justificar uma ação.`:'';
  const instructions=INSTRUCTIONS+myPerformanceInstructions+(hasEvidence?'':`\nESTADO ATUAL: A NOZA ainda não possui evidências suficientes deste usuário. Não faça diagnóstico pessoal nem atribua forças/fraquezas. Converse normalmente e investigue o objetivo do usuário.`);

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
