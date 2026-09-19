import { NextResponse } from 'next/server';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `Você é a NOZA, a inteligência da plataforma NOZA. Responda em português do Brasil por padrão, a menos que o usuário use outro idioma. Você pode responder perguntas gerais e também é especialmente forte em negócios, vendas, persuasão ética, negociação, marketing, posicionamento, gestão, estratégia, produtividade, comunicação, reuniões, criatividade, tecnologia e tomada de decisão. Seja pragmática, inteligente, direta e útil. Evite clichês e respostas genéricas. Quando fizer sentido, organize a resposta em parágrafos curtos e legíveis. Não use Markdown. Não use asteriscos, hashtags, setas, marcadores com hífen, bullets, listas em Markdown, blocos de código ou símbolos de formatação. Não escreva sintaxe como **texto**, *texto*, # título, - item, > texto ou [texto](link). Entregue sempre texto limpo, natural e pronto para ser exibido diretamente no chat. Se precisar enumerar itens, use frases curtas separadas por quebras de linha, sem símbolos no início. Não diga que é ChatGPT e não use branding de terceiros na resposta. Não invente fatos, números ou fontes. Se algo exigir informação atual que você não possa verificar, seja transparente.`;

function extractText(payload: any){
  if(typeof payload?.output_text==='string'&&payload.output_text.trim())return payload.output_text.trim();
  const chunks:string[]=[];
  for(const item of payload?.output||[]){
    for(const part of item?.content||[]){
      if(typeof part?.text==='string'&&part.text.trim())chunks.push(part.text.trim());
    }
  }
  return chunks.join('\n').trim();
}

function cleanChatText(value:string){
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g,'$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1')
    .replace(/\*\*([^*]+)\*\*/g,'$1')
    .replace(/__([^_]+)__/g,'$1')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'$1')
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g,'$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm,'')
    .replace(/^\s*>\s?/gm,'')
    .replace(/^\s*[-*+•→➜➤►]\s+/gm,'')
    .replace(/^\s*\d+[.)]\s+/gm,'')
    .replace(/```[\s\S]*?```/g,match=>match.replace(/```[a-zA-Z0-9_-]*\n?/g,'').replace(/```/g,''))
    .replace(/`([^`]+)`/g,'$1')
    .replace(/\\([*_#>\-])/g,'$1')
    .replace(/[ \t]+\n/g,'\n')
    .replace(/\n{3,}/g,'\n\n')
    .trim();
}

export async function POST(request: Request){
  try{
    const apiKey=process.env.OPENAI_API_KEY;
    if(!apiKey){
      return NextResponse.json({error:'A NOZA ainda não está conectada à inteligência no servidor.'},{status:503});
    }

    const body=await request.json();
    const rawMessages=Array.isArray(body?.messages)?body.messages:[];
    const messages:ChatMessage[]=rawMessages
      .filter((message:any)=>message&&(message.role==='user'||message.role==='assistant')&&typeof message.content==='string')
      .slice(-20)
      .map((message:any)=>({role:message.role,content:message.content.slice(0,7000)}));

    if(!messages.some(message=>message.role==='user')){
      return NextResponse.json({error:'Envie uma mensagem para conversar com a NOZA.'},{status:400});
    }

    const conversation=messages
      .map(message=>`${message.role==='user'?'Usuário':'NOZA'}: ${message.content}`)
      .join('\n\n');

    const response=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{
        'Authorization':`Bearer ${apiKey}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:process.env.NOZA_MODEL||process.env.ZYVO_MODEL||'gpt-5.6-luna',
        instructions:SYSTEM_PROMPT,
        input:conversation,
        max_output_tokens:1800,
        store:false
      })
    });

    const data=await response.json().catch(()=>null);
    if(!response.ok){
      console.error('NOZA provider error',response.status,data?.error?.message||data);
      const providerMessage=typeof data?.error?.message==='string'?data.error.message:'';
      if(response.status===401){
        return NextResponse.json({error:'A conexão de IA da NOZA precisa ser autenticada novamente.'},{status:502});
      }
      if(response.status===429){
        return NextResponse.json({error:'A NOZA atingiu temporariamente o limite de uso da IA. Tente novamente em instantes.'},{status:502});
      }
      return NextResponse.json({error:providerMessage?'A NOZA encontrou uma falha na conexão com a IA.':'A NOZA não conseguiu responder agora.'},{status:502});
    }

    const answer=cleanChatText(extractText(data));
    if(!answer){
      return NextResponse.json({error:'A NOZA não recebeu uma resposta válida da inteligência.'},{status:502});
    }

    return NextResponse.json({answer});
  }catch(error){
    console.error('NOZA route error',error);
    return NextResponse.json({error:'A NOZA encontrou um erro ao processar sua mensagem.'},{status:500});
  }
}
