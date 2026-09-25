'use client';

import {useState} from 'react';
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
 const submit=()=>{if(!message.trim())return;try{const current=JSON.parse(localStorage.getItem('noza-support-tickets')||'[]');const ticket={id:'NOZA-'+Date.now().toString().slice(-6),message:message.trim(),status:'EM ANÁLISE',createdAt:new Date().toISOString(),page:location.pathname,browser:navigator.userAgent};localStorage.setItem('noza-support-tickets',JSON.stringify([ticket,...current].slice(0,30)))}catch{}setSent(true)};
 return <main className="app-shell support-page"><AppSidebar/><section className="content support-content"><AppTopbar/><div className="support-stage">
  <button className="support-back" onClick={()=>router.back()}><ChevronLeft/>Voltar</button>
  <header><span>SUPORTE NOZA</span><h1>Como posso ajudar?</h1><p>Descreva o que aconteceu. A NOZA organiza as informações e direciona seu atendimento.</p></header>
  {!sent?<>{activeTopic?<section className="support-topic-view"><button className="support-topic-back" onClick={()=>setActiveTopic(null)}><ChevronLeft/>Todos os assuntos</button><div className="support-topic-title"><activeTopic.Icon/><span><small>SUPORTE · {activeTopic.title.toUpperCase()}</small><h2>{activeTopic.title}</h2><p>{activeTopic.copy}</p></span></div><div className="support-topic-options">{activeTopic.options.map(option=><button key={option} onClick={()=>{setMessage(activeTopic.title+' — '+option+': ');setActiveTopic(null)}}><span>{option}</span><ArrowRight/></button>)}</div></section>:<><section className="support-compose"><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Conte para a NOZA o que você precisa. Ex.: Minha câmera não aparece quando entro no Space."/><button onClick={submit}><Send/>Enviar para o suporte</button></section>
  <div className="support-topics">{topics.map(({title,copy,Icon})=><button key={title} onClick={()=>setActiveTopic(topics.find(topic=>topic.title===title)??null)}><Icon/><span><strong>{title}</strong><small>{copy}</small></span><ArrowRight/></button>)}</div>
  <section className="support-direct"><div><Headphones/><span><strong>Atendimento por e-mail</strong><small>Envie sua solicitação para a equipe de suporte.</small></span></div><button onClick={()=>setMessage('Atendimento por e-mail: ')}>Escrever mensagem</button></section>
  <section className="support-whatsapp"><div><MessageCircle/><span><strong>WhatsApp</strong><small>Atendimento direto · resposta rápida</small></span></div><button onClick={()=>{try{localStorage.setItem('noza-support-whatsapp-intent','Olá! Preciso de suporte com a NOZA.')}catch{}setMessage('WhatsApp: Olá! Preciso de suporte com a NOZA.')}}>Preparar atendimento<ArrowRight/></button><p>O número oficial poderá ser conectado aqui sem alterar esta tela.</p></section></>}</>:<section className="support-success"><UserRound/><span>CHAMADO RECEBIDO</span><h2>Estamos analisando seu pedido.</h2><p>Seu atendimento ficou salvo em <b>Meus atendimentos</b>. Você poderá acompanhar a resposta por aqui.</p><button onClick={()=>{setSent(false);setMessage('')}}>Novo atendimento</button></section>}
 </div></section></main>
}