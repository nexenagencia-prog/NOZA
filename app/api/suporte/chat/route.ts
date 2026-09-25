import {NextRequest,NextResponse} from 'next/server';

type ChatMessage={from:'user'|'leo';text:string};

const KNOWLEDGE=`
Você é Léo, agente de suporte oficial da NOZA, uma plataforma de Performance Intelligence.
A NOZA é focada em evolução de performance. Reuniões são evidências para diagnóstico e desenvolvimento, não o produto central.

Áreas do produto:
- Space: reuniões, participantes, convites, câmera, microfone, gravação, slides e preferências.
- Gravações: histórico das reuniões gravadas e acesso à análise.
- Análise de reuniões: Comunicação, Clareza, Escuta, Objetividade, Perguntas, Argumentação e Condução.
- Skills: capacidades, scores, feedbacks e evolução.
- Skills da reunião: leitura específica das capacidades observadas em uma reunião.
- Calibragem Cognitiva: sessão de referência cognitiva, histórico, perguntas, resultados e evolução.
- Human Pro: padrões longitudinais, hipóteses, evidências e desenvolvimento.
- Conta e assinatura: plano, pagamento, perfil, acesso, alteração e cancelamento.

Regras de suporte:
1. Responda em português do Brasil, de forma profissional, direta, humana e curta.
2. Entenda a intenção pelo significado, não por palavras-chave.
3. Use o histórico da conversa para não repetir perguntas já respondidas.
4. Quando possível, dê passos numerados e específicos.
5. Nunca invente que consultou conta, cobrança, reunião, gravação ou banco de dados. Você ainda não possui ferramentas para consultar dados reais.
6. Nunca peça senha, número completo de cartão, CVV ou outros dados financeiros sensíveis.
7. Se faltar uma informação essencial, faça apenas a pergunta necessária para continuar o diagnóstico.
8. Se o problema exigir intervenção humana, acesso administrativo, cobrança contestada, reembolso, alteração protegida de conta, ou se após o diagnóstico você não puder resolver com segurança, diga claramente que precisa de atendimento humano e oriente: "Clique em WhatsApp para continuar com o suporte humano."
9. Não mande o usuário procurar documentação externa se puder explicar o procedimento.
10. Não use linguagem genérica como "em qual área isso acontece?" quando a conversa já deixa a área clara.
11. Para cancelamento, explique o caminho disponível na NOZA; se a ação não estiver disponível ou exigir intervenção, encaminhe ao WhatsApp.
12. Se houver erro técnico, identifique tela, ação imediatamente anterior, resultado esperado e resultado obtido; peça mensagem de erro apenas se necessária.
`;

export async function POST(req:NextRequest){
 try{
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'AI_NOT_CONFIGURED'},{status:503});
  const body=await req.json();
  const messages=(Array.isArray(body?.messages)?body.messages:[]).slice(-14) as ChatMessage[];
  const input=messages.filter(m=>m&&typeof m.text==='string').map(m=>({role:m.from==='leo'?'assistant':'user',content:m.text.slice(0,4000)}));
  if(!input.length)return NextResponse.json({error:'EMPTY_MESSAGE'},{status:400});
  const response=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',
   headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
   body:JSON.stringify({model:process.env.OPENAI_SUPPORT_MODEL||'gpt-5-mini',instructions:KNOWLEDGE,input,max_output_tokens:500})
  });
  const data=await response.json();
  if(!response.ok)throw new Error(data?.error?.message||'OpenAI request failed');
  const text=typeof data.output_text==='string'?data.output_text:data.output?.flatMap((o:any)=>o.content||[]).find((x:any)=>x.type==='output_text')?.text;
  if(!text)throw new Error('Empty AI response');
  return NextResponse.json({reply:text});
 }catch(error){
  console.error('Leo support error',error);
  return NextResponse.json({error:'SUPPORT_AI_ERROR'},{status:500});
 }
}
