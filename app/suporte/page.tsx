'use client';

import {FormEvent,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowRight,ChevronLeft,CircleHelp,Headphones,MessageCircle,Send,UserRound,WalletCards,Wrench} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import AppTopbar from '../AppTopbar';
import './suporte.css';

const topics=[
  {id:'technical',title:'Problema técnico',copy:'Câmera, microfone, gravação, Space ou acesso.',Icon:Wrench,options:['Câmera ou microfone','Problema no Space','Gravação ou vídeo','Erro ao entrar ou carregar','Outro problema técnico']},
  {id:'account',title:'Conta e assinatura',copy:'Plano, pagamento, perfil e acesso.',Icon:WalletCards,options:['Meu plano NOZA','Pagamento ou cobrança','Alterar dados do perfil','Problema de acesso','Cancelar ou alterar assinatura']},
  {id:'noza',title:'Dúvidas sobre a NOZA',copy:'Skills, Calibragem, Human Pro e funcionamento da IA.',Icon:CircleHelp,options:['Skills e evolução','Calibragem Cognitiva','Human Pro','Análise de reuniões','Como a IA utiliza minhas interações']},
];

export default function SuportePage(){
 const router=useRouter();
 const [message,setMessage]=useState('');
 const [sent,setSent]=useState(false);
 const [activeTopic,setActiveTopic]=useState<(typeof topics)[number]|null>(null);
 const [chatOpen,setChatOpen]=useState(false);
 const [chatText,setChatText]=useState('');
 const [chatThinking,setChatThinking]=useState(false);
 const [mediaWhatsapp,setMediaWhatsapp]=useState(false);
 const [firstName,setFirstName]=useState('');
 const [detail,setDetail]=useState<{topic:string;option:string;body:string}|null>(null);
 const [chat,setChat]=useState<{from:string;text:string}[]>([]);
 const chatEndRef=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[chat,chatOpen]);
 useEffect(()=>{try{const name=(localStorage.getItem('noza-profile-name')||'').trim().split(/\s+/)[0];setFirstName(name)}catch{}},[]);
 const openChat=(seed?:string)=>{setChatOpen(true);const hello=`Oi${firstName?', '+firstName:''}! Tudo bem? Sou o Léo, do suporte NOZA. Como posso te ajudar hoje?`;setChat(items=>items.length?items:[{from:'leo',text:hello}]);if(seed){setChat(items=>[...items,{from:'leo',text:supportReply(seed)+' Me conte exatamente o que está acontecendo para continuarmos.'}])}};
 const explainOption=(topic:string,option:string)=>{const q=(topic+' '+option).toLowerCase();let body='Aqui você encontra orientação específica sobre este assunto. Se algo não estiver funcionando como esperado, descreva o comportamento e o Léo continua o diagnóstico com você.';if(/plano|pagamento|cobran|assinatura/.test(q))body='Nesta área você pode entender seu plano, cobrança, pagamento, alteração ou cancelamento de assinatura. A NOZA orienta o próximo passo sem solicitar senha ou dados completos de cartão.';else if(/perfil/.test(q))body='Aqui você pode tratar nome, foto e informações do perfil. Alterações devem refletir a identidade usada pela NOZA nas demais áreas do aplicativo.';else if(/skill/.test(q))body='Skills acompanha capacidades em desenvolvimento e evidências observadas. Use esta área para entender scores, feedbacks, evolução e histórico por reunião.';else if(/calibr/.test(q))body='A Calibragem Cognitiva cria e atualiza sua referência de performance. Aqui você entende sessão, histórico, resultados, perguntas e evolução entre calibragens.';else if(/human/.test(q))body='Human Pro reúne padrões, evidências e hipóteses construídos ao longo das suas interações. Aqui você entende de onde veio cada percepção e como usá-la no desenvolvimento.';else if(/ia utiliza/.test(q))body='A NOZA usa as interações relevantes para produzir contexto de performance, padrões e evolução. Esta área explica como essas informações participam das análises e dos feedbacks.';setDetail({topic,option,body})};
 const supportReply=(input:string)=>{
   const q=input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   const whatsapp=' Se isso continuar ou exigir acesso à conta/sistema, use o WhatsApp do suporte para atendimento humano.';
   if(/cancel|encerrar.*assin|parar.*plano/.test(q))return 'Entendi: você quer cancelar a assinatura. Abra Conta e assinatura > Cancelar ou alterar assinatura. Antes de confirmar, confira o plano ativo e a próxima data de cobrança. Se a opção de cancelamento não aparecer ou houver cobrança que você não reconhece,'+whatsapp;
   if(/reembols|estorn|cobranca indevida|cobrou|duplicad/.test(q))return 'Para cobrança, preciso separar pagamento pendente, cobrança duplicada ou valor não reconhecido. Confira o plano e a data da cobrança em Conta e assinatura. Não envie número completo do cartão. Se houver divergência financeira que eu não consiga resolver por aqui,'+whatsapp;
   if(/camera/.test(q))return 'Vamos resolver a câmera: 1) permita o uso da câmera no navegador; 2) no Space, desligue e ligue o botão da câmera; 3) confirme se outro aplicativo não está usando a câmera. Se ainda falhar, me diga o navegador e a mensagem exibida.';
   if(/microfone|\bmic\b|audio|som|nao.*ouve|ouvir/.test(q))return 'Para áudio: 1) confirme a permissão do microfone no navegador; 2) selecione o dispositivo correto no sistema; 3) desligue e ligue o microfone no Space. Se o indicador funciona mas ninguém escuta, me diga qual navegador e dispositivo você está usando.';
   if(/gravacao|gravar|video/.test(q))return 'Sobre gravações: verifique primeiro se a reunião foi encerrada corretamente e depois abra Gravações. Ao selecionar o vídeo, você pode abrir a análise e as Skills daquela reunião. Se a gravação não existir, não carregar ou estiver incompleta, me diga qual desses casos aconteceu.';
   if(/space|reuniao|participante|convite/.test(q))return 'No Space eu consigo diagnosticar entrada na reunião, participantes, convites, câmera, microfone, gravação, slides e preferências. Diga qual ação você tentou fazer e o que aconteceu logo depois.';
   if(/calibr/.test(q))return 'Na Calibragem Cognitiva posso ajudar com início da sessão, perguntas, resultado, histórico e evolução. Diga em qual etapa você está e o que não aconteceu como esperado.';
   if(/skill|score|feedback|evolucao/.test(q))return 'Em Skills posso ajudar com score, feedback, histórico e Skills da reunião. Se um resultado parece ausente ou incorreto, diga qual skill e em qual tela/reunião você percebeu isso.';
   if(/human/.test(q))return 'No Human Pro, os padrões devem ser apresentados com evidências das interações. Posso ajudar com diagnóstico, evidência, histórico ou informação que não apareceu. Diga qual seção está vendo.';
   if(/senha|login|entrar|acesso|conta bloqueada/.test(q))return 'Para acesso, me diga se o erro acontece antes ou depois do login e qual mensagem aparece. Não envie sua senha. Se for necessário validar ou alterar dados protegidos da conta,'+whatsapp;
   if(/assin|plano|pagamento|cobranca|cartao/.test(q))return 'Posso ajudar com plano, assinatura, pagamento, cobrança, alteração ou cancelamento. Me diga exatamente o que você quer fazer — por exemplo “quero cancelar”, “fui cobrado duas vezes” ou “quero mudar de plano” — e eu sigo direto pelo procedimento correto.';
   if(/whats|humano|atendente|pessoa/.test(q))return 'Certo. Use o botão WhatsApp desta central para continuar com atendimento humano. Se o botão ainda não estiver conectado ao número oficial, a NOZA precisa configurar esse contato antes de abrir a conversa.';
   if(/nao funciona|erro|bug|trav|carreg|sumiu|nao abre|nao aparece/.test(q))return 'Vou tratar isso como falha técnica. Me diga em qual tela acontece e qual é o último passo que funciona antes do erro. Se puder, informe também a mensagem exibida. Com isso eu separo problema de acesso, carregamento ou função específica.';
   return 'Entendi o que você escreveu, mas preciso de um detalhe para responder com precisão: isso é sobre Space/reunião, câmera ou áudio, gravações, Skills/Calibragem/Human Pro, ou conta/assinatura? Diga também o que você esperava que acontecesse e o que aconteceu de fato. Se for algo que exija intervenção na conta ou eu não conseguir concluir o diagnóstico,'+whatsapp;
 };
 const sendChat=async(event?:FormEvent)=>{event?.preventDefault();const text=chatText.trim();if(!text||chatThinking)return;const next=[...chat,{from:'user',text}] as {from:string;text:string}[];setChat(next);setChatText('');setChatThinking(true);try{const response=await fetch('/api/suporte/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next})});const data=await response.json();if(!response.ok||!data.reply)throw new Error(data.error||'support error');setChat(items=>[...items,{from:'leo',text:data.reply}])}catch{setChat(items=>[...items,{from:'leo',text:supportReply(text)+' Se eu não conseguir concluir por aqui, clique em WhatsApp para continuar com o suporte humano.'}])}finally{setChatThinking(false)}};
 const submit=()=>{if(!message.trim())return;try{const current=JSON.parse(localStorage.getItem('noza-support-tickets')||'[]');const ticket={id:'NOZA-'+Date.now().toString().slice(-6),message:message.trim(),status:'EM ANÁLISE',createdAt:new Date().toISOString(),page:location.pathname,browser:navigator.userAgent};localStorage.setItem('noza-support-tickets',JSON.stringify([ticket,...current].slice(0,30)))}catch{}setSent(true)};
 return (
  <main className="app-shell support-page">
   <AppSidebar/>
   <section className="content support-content">
    <AppTopbar/>
    <div className="support-stage">
     <button className="support-back" onClick={()=>router.back()}><ChevronLeft/>Voltar</button>
     <header><span>SUPORTE NOZA</span><h1>Como posso ajudar?</h1><p>Descreva o que aconteceu. A NOZA organiza as informações e direciona seu atendimento.</p></header>
     {!sent ? (
      activeTopic ? (
       <section className="support-topic-view">
        <button className="support-topic-back" onClick={()=>{setActiveTopic(null);setDetail(null)}}><ChevronLeft/>Todos os assuntos</button>
        <div className="support-topic-title"><activeTopic.Icon/><span><small>SUPORTE · {activeTopic.title.toUpperCase()}</small><h2>{activeTopic.title}</h2><p>{activeTopic.copy}</p></span></div>
        {detail ? <div className="support-detail"><button onClick={()=>setDetail(null)}><ChevronLeft/>Voltar às opções</button><small>{detail.topic.toUpperCase()}</small><h3>{detail.option}</h3><p>{detail.body}</p><button className="support-detail-action" onClick={()=>openChat(detail.topic+' '+detail.option)}><Headphones/>Falar com Léo sobre isso</button></div>
        : <div className="support-topic-options">{activeTopic.options.map(option=><button key={option} onClick={()=>activeTopic.id==='technical'?openChat(activeTopic.title+' '+option):explainOption(activeTopic.title,option)}><span>{option}</span><ArrowRight/></button>)}</div>}
       </section>
      ) : (
       <>
        <section className="support-compose"><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Conte para a NOZA o que você precisa. Ex.: Minha câmera não aparece quando entro no Space."/><button onClick={submit}><Send/>Enviar para o suporte</button></section>
        <div className="support-topics">{topics.map(topic=><button key={topic.id} onClick={()=>setActiveTopic(topic)}><topic.Icon/><span><strong>{topic.title}</strong><small>{topic.copy}</small></span><ArrowRight/></button>)}</div>
        <section className="support-direct"><div><Headphones/><span><strong>Falar com atendimento</strong><small>Léo · suporte inteligente NOZA</small></span></div><button onClick={()=>openChat()}>Iniciar atendimento</button></section>
        <section className="support-whatsapp"><div><MessageCircle/><span><strong>WhatsApp</strong><small>Atendimento direto · resposta rápida</small></span></div><button onClick={()=>{const number=(process.env.NEXT_PUBLIC_NOZA_WHATSAPP||'').replace(/\D/g,'');const text=encodeURIComponent('Olá! Preciso de suporte com a NOZA.');if(number) window.location.href='https://wa.me/'+number+'?text='+text; else setMediaWhatsapp(true)}}>Abrir WhatsApp<ArrowRight/></button></section>
       </>
      )
     ) : <section className="support-success"><UserRound/><span>CHAMADO RECEBIDO</span><h2>Estamos analisando seu pedido.</h2><p>Seu atendimento ficou salvo em <b>Meus atendimentos</b>.</p><button onClick={()=>{setSent(false);setMessage('')}}>Novo atendimento</button></section>}
     {mediaWhatsapp&&<div className="support-whatsapp-notice"><MessageCircle/><span><strong>WhatsApp ainda não conectado</strong><small>O número oficial da NOZA precisa ser configurado para abrir a conversa.</small></span><button onClick={()=>setMediaWhatsapp(false)}>×</button></div>}
     {chatOpen&&<aside className="support-chat" aria-label="Chat de suporte Léo">
      <header><div><span className="support-agent-icon"><Headphones/></span><span><strong>Léo</strong><small><i/>Suporte inteligente NOZA</small></span></div><button onClick={()=>setChatOpen(false)} aria-label="Fechar chat">×</button></header>
      <div className="support-chat-body">{chat.map((item,index)=><div key={index} className={item.from==='user'?'user':'leo'}>{item.from==='leo'&&<b>LÉO</b>}<p>{item.text}</p></div>)}{chatThinking&&<div className="leo"><b>LÉO</b><p className="support-thinking">Analisando…</p></div>}<div ref={chatEndRef}/></div>
      <div className="support-chat-quick">{['Câmera ou microfone','Problema no Space','Gravação ou vídeo','Erro ao entrar','Conta e assinatura','Calibragem Cognitiva','Skills e evolução'].map(value=><button key={value} onClick={()=>setChat(items=>[...items,{from:'user',text:value},{from:'leo',text:supportReply(value)}])}>{value}</button>)}</div>
      <form onSubmit={sendChat}><input autoFocus value={chatText} onChange={e=>setChatText(e.target.value)} placeholder="Pergunte ao Léo..." disabled={chatThinking}/><button aria-label="Enviar" disabled={chatThinking}><Send/></button></form>
      <footer>Suporte NOZA · não envie senhas ou dados financeiros sensíveis</footer>
     </aside>}
    </div>
   </section>
  </main>
 )
}