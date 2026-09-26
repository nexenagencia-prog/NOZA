import {NextRequest,NextResponse} from 'next/server';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

const SKILLS=['Percepção','Investigação','Cognição','Raciocínio','Psicologia','Persuasão','Vendas','Objeções','Adaptabilidade','Influência','Repertório','Metacognição'];

export async function POST(req:NextRequest){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'AI_NOT_CONFIGURED'},{status:503});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return NextResponse.json({error:'AUTH_NOT_CONFIGURED'},{status:503});
  const jar=await cookies();const s=createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll(){}}});
  const {data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'UNAUTHORIZED'},{status:401});
  const body=await req.json();const transcript=String(body?.transcript||'').trim().slice(0,30000);
  if(transcript.length<40)return NextResponse.json({error:'INSUFFICIENT_EVIDENCE'},{status:422});
  const focus=Array.isArray(body?.skills)?body.skills.filter((x:any)=>SKILLS.includes(x)).slice(0,12):[];
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({
   model:process.env.OPENAI_PERFORMANCE_MODEL||'gpt-5.6',
   instructions:`Você é o motor de evidências da NOZA. Analise somente comportamentos observáveis na transcrição. Não diagnostique personalidade, saúde ou intenção. Para cada skill com evidência suficiente, dê score 0-100, confidence 0-1, uma evidência curta parafraseada, leitura e uma ação prática. Não invente falas nem fatos. Skills permitidas: ${SKILLS.join(', ')}. Retorne SOMENTE JSON válido no formato {"summary":"...","skills":[{"skill":"...","score":0,"confidence":0,"evidence":"...","reading":"...","action":"..."}],"patterns":["..."],"next_action":"..."}. Se não houver evidência suficiente para uma skill, omita-a.`,
   input:`Contexto: ${JSON.stringify({subject:body?.subject||'',goal:body?.goal||'',focus})}\nTRANSCRIÇÃO:\n${transcript}`,max_output_tokens:1800
  })});
  const data=await response.json();if(!response.ok)return NextResponse.json({error:'AI_ERROR'},{status:502});
  const out=typeof data.output_text==='string'?data.output_text:data.output?.flatMap((o:any)=>o.content||[]).find((x:any)=>x.type==='output_text')?.text;
  if(!out)return NextResponse.json({error:'EMPTY_ANALYSIS'},{status:502});
  let parsed:any;try{parsed=JSON.parse(out.replace(/^\`\`\`json\s*|\`\`\`$/g,''))}catch{return NextResponse.json({error:'INVALID_ANALYSIS'},{status:502})}
  parsed.skills=Array.isArray(parsed.skills)?parsed.skills.filter((x:any)=>SKILLS.includes(x.skill)&&Number.isFinite(Number(x.score))).map((x:any)=>({...x,score:Math.max(0,Math.min(100,Number(x.score))),confidence:Math.max(0,Math.min(1,Number(x.confidence)||0))})).slice(0,12):[];
  return NextResponse.json(parsed);
 }catch(e){console.error('Performance analysis error',e);return NextResponse.json({error:'PERFORMANCE_ANALYSIS_ERROR'},{status:500})}
}