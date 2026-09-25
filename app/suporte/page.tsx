'use client';

import {FormEvent,useState} from 'react';
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
 const [chat,setChat]=useState([{from:'leo',text:'Olá, sou o Léo, assistente de suporte da NOZA. Posso ajudar com Space, câmera, microfone, gravações, Skills, Calibragem, Human Pro, conta, assinatura e navegação. O que aconteceu?'}]);
 const supportReply=(input:string)=>{
   const q=input.toLowerCase();
   if(/câmera|camera/.test(q))return 'Vamos verificar a câmera. No Space, confirme a permissão do navegador para usar a câmera. Se ela estiver permitida e a imagem não aparecer, desligue e ligue a câmera no controle inferior. Se continuar, me diga qual navegador você está usando e se aparece alguma mensagem de erro.';
   if(/microfone|mic|áudio|audio/.test(q))return 'Para o microfone, primeiro confirme a permissão de áudio do navegador e depois teste o botão Microfone no Space. Se o indicador mudar mas ninguém ouvir você, verifique se o dispositivo correto está selecionado no sistema. Me diga o que acontece ao clicar no botão para eu seguir pelo diagnóstico.';
   if(/grava|vídeo|video|analis/.test(q))return 'As gravações ficam no histórico de Gravações. Ao abrir uma delas, o botão Analisar leva ao histórico de performance daquela reunião, incluindo Score Geral e Skills. Se um vídeo não abrir ou uma análise não carregar, diga qual etapa falhou e o que aparece na tela.';
   if(/space|reuni/.test(q))return 'No Space você pode controlar câmera, microfone, chat, participantes, transcrição, contatos, gravações, slides e preferências. Se algo específico não estiver funcionando, diga qual controle ou etapa e eu faço o diagnóstico com você.';
   if(/calibr/.test(q))return 'A Calibragem Cognitiva cria uma referência de performance a partir das suas respostas e mantém histórico das sessões. Se o problema for resultado, histórico, botão ou carregamento, diga exatamente onde parou.';
   if(/skill/.test(q))return 'As Skills mostram capacidades em desenvolvimento. As Skills de cada reunião também ficam registradas na análise daquela gravação, para você voltar depois e comparar a evolução. Posso ajudar se alguma skill, score ou feedback não estiver aparecendo.';
   if(/human/.test(q))return 'O Human Pro reúne padrões e evidências observados ao longo das interações e reuniões. Se a dúvida for sobre um diagnóstico, feedback ou informação que não apareceu, me diga qual seção você está vendo.';
   if(/pag|cobran|assin|plano/.test(q))return 'Posso orientar sobre plano, assinatura e cobrança. Diga se você quer consultar seu plano, alterar assinatura, entender uma cobrança ou resolver um pagamento. Para dados financeiros sensíveis, não envie número completo de cartão ou senha.';
   if(/entrar|login|acesso|senha/.test(q))return 'Se o problema é acesso, diga se ocorre antes ou depois de entrar na NOZA e qual mensagem aparece. Não envie sua senha. Com isso eu consigo separar problema de autenticação de problema de carregamento.';
   if(/whats/.test(q))return 'O atendimento por WhatsApp está preparado na central, mas o número oficial ainda precisa ser conectado. Enquanto isso, consigo continuar o diagnóstico por aqui.';
   return 'Entendi. Para eu chegar na causa, me diga em qual área da NOZA isso acontece, o que você tentou fazer e o que apareceu na tela. Se houver uma mensagem de erro, pode copiar o texto dela aqui.';
 };
 const sendChat=(event?:FormEvent)=>{event?.preventDefault();const text=chatText.trim();if(!text)return;setChat(items=>[...items,{from:'user',text},{from:'leo',text:supportReply(text)}]);setChatText('')};
 const submit=()=>{if(!message.trim())return;try{const current=JSON.parse(localStorage.getItem('noza-support-tickets')||'[]');const ticket={id:'NOZA-'+Date.now().toString().slice(-6),message:message.trim(),status:'EM ANÁLISE',createdAt:new Date().toISOString(),page:location.pathname,browser:navigator.userAgent};localStorage.setItem('noza-support-tickets',JSON.stringify([ticket,...current].slice(0,30)))}catch{}setSent(true)};
 return <main className="app-shell support-page"><AppSidebar/><section className="content support-content"><AppTopbar/><div className="support-stage">
  <button className="support-back" onClick={()=>router.back()}><ChevronLeft/>Voltar</button>
  <header><span>SUPORTE NOZA</span><h1>Como posso ajudar?</h1><p>Descreva o que aconteceu. A NOZA organiza as informações e direciona seu atendimento.</p></header>
  {!sent?<>{activeTopic?<section className="support-topic-view"><button className="support-topic-back" onClick={()=>setActiveTopic(null)}><ChevronLeft/>Todos os assuntos</button><div className="support-topic-title"><activeTopic.Icon/><span><small>SUPORTE · {activeTopic.title.toUpperCase()}</small><h2>{activeTopic.title}</h2><p>{activeTopic.copy}</p></span></div><div className="support-topic-options">{activeTopic.options.map(option=><button key={option} onClick={()=>{setMessage(activeTopic.title+' — '+option+': ');setActiveTopic(null)}}><span>{option}</span><ArrowRight/></button>)}</div></section>:<><section className="support-compose"><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Conte para a NOZA o que você precisa. Ex.: Minha câmera não aparece quando entro no Space."/><button onClick={submit}><Send/>Enviar para o suporte</button></section>
  <div className="support-topics">{topics.map(({title,copy,Icon})=><button key={title} onClick={()=>setActiveTopic(topics.find(topic=>topic.title===title)??null)}><Icon/><span><strong>{title}</strong><small>{copy}</small></span><ArrowRight/></button>)}</div>
  <section className="support-direct"><div><Headphones/><span><strong>Léo · Atendimento NOZA</strong><small>Assistente inteligente para diagnóstico e suporte imediato.</small></span></div><button onClick={()=>setChatOpen(true)}>Abrir atendimento</button></section>
  <section className="support-whatsapp"><div><MessageCircle/><span><strong>WhatsApp</strong><small>Atendimento direto · resposta rápida</small></span></div><button onClick={()=>{try{localStorage.setItem('noza-support-whatsapp-intent','Olá! Preciso de suporte com a NOZA.')}catch{}setMessage('WhatsApp: Olá! Preciso de suporte com a NOZA.')}}>Preparar atendimento<ArrowRight/></button><p>O número oficial poderá ser conectado aqui sem alterar esta tela.</p></section></>}</>:<section className="support-success"><UserRound/><span>CHAMADO RECEBIDO</span><h2>Estamos analisando seu pedido.</h2><p>Seu atendimento ficou salvo em <b>Meus atendimentos</b>. Você poderá acompanhar a resposta por aqui.</p><button onClick={()=>{setSent(false);setMessage('')}}>Novo atendimento</button></section>}
 </div></section></main>
}