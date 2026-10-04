'use client';

import {ChangeEvent,FormEvent,KeyboardEvent,useEffect,useRef,useState} from 'react';
import {ArrowUp,BrainCircuit,Plus} from 'lucide-react';
import AppSidebar from '../AppSidebar';

import '../app-sidebar.css';
import './human-pro.css';
import {getPerformanceProfile} from '../../lib/performance/core';

type Meeting={id:string;title:string;objective?:string;phrase?:string;summary?:string;transcript?:string};
type ChatMessage={id:string;role:'user'|'assistant';content:string};
const RECORDINGS_KEY='zyvo-recordings';
const defaultMeetings:Meeting[]=[
  {id:'r1',title:'Reunião de planejamento',objective:'gestão',phrase:'Estratégia, proposta e próximos passos.'},
  {id:'r2',title:'Alinhamento comercial',objective:'venda',phrase:'Decisões mais claras para acelerar o fechamento.'},
  {id:'r3',title:'Reunião com cliente',objective:'venda',phrase:'Objeções, escuta e próximos compromissos.'},
  {id:'r5',title:'Revisão semanal',objective:'liderança',phrase:'O que avançou e o que precisa mudar.'},
  {id:'r6',title:'Apresentação de proposta',objective:'negociação',phrase:'Valor percebido, timing e decisão.'},
  {id:'r9',title:'Entrevista estratégica',objective:'comunicação',phrase:'Perguntas melhores, respostas mais úteis.'},
];

function loadMeetings(){
  try{
    const parsed=JSON.parse(localStorage.getItem(RECORDINGS_KEY)||'[]');
    const value=Array.isArray(parsed)?parsed:Array.isArray(parsed?.recordings)?parsed.recordings:[];
    return value.length?value:defaultMeetings;
  }catch{return defaultMeetings}
}

export default function HumanProClient(){
  const[question,setQuestion]=useState('');
  const[messages,setMessages]=useState<ChatMessage[]>([]);
  const[meetings,setMeetings]=useState<Meeting[]>(defaultMeetings);
  const[working,setWorking]=useState(false);
  const[performanceContext,setPerformanceContext]=useState('');
  const fileRef=useRef<HTMLInputElement>(null);
  const questionRef=useRef<HTMLTextAreaElement>(null);
  const threadEndRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    setMeetings(loadMeetings());
    getPerformanceProfile().then(profile=>{const intelligence=(profile.intelligence||[]).slice(0,12).map((s:any)=>`${s.skill}: score ${s.score}, confiança ${Math.round(s.confidence*100)}%, tendência ${s.direction} (${s.trend>0?'+':''}${s.trend}), recorrência ${s.recurrence}, contradição ${Math.round(s.contradiction*100)}%, evidência recente: ${s.latestEvidence||'sem evidência textual'}`).join('\n');const recent=profile.events.slice(0,8).map((e:any)=>`${e.created_at||''} · ${e.source} · ${e.skill||e.event_type}: ${e.evidence||''}`).join('\n');setPerformanceContext([intelligence,recent].filter(Boolean).join('\n'))}).catch(()=>{});
  },[]);

  useEffect(()=>{threadEndRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages,working]);

  const runAnalysis=async(value=question)=>{
    const clean=value.trim();if(!clean||working)return;
    const stamp=Date.now();
    const userMessage:ChatMessage={id:`user-${stamp}`,role:'user',content:clean};
    const next=[...messages,userMessage];
    setMessages(next);setQuestion('');if(questionRef.current)questionRef.current.style.height='auto';setWorking(true);
    try{
      const response=await fetch('/api/human-pro/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next.map(({role,content})=>({role,content}))})});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||'HUMAN_PRO_ERROR');
      setMessages(current=>[...current,{id:`assistant-${stamp}`,role:'assistant',content:data.reply}]);
    }catch{
      setMessages(current=>[...current,{id:`assistant-${stamp}`,role:'assistant',content:'Não consegui acessar sua inteligência de performance agora. Tente novamente em alguns instantes.'}]);
    }finally{setWorking(false)}
  };
  const changeQuestion=(event:ChangeEvent<HTMLTextAreaElement>)=>{setQuestion(event.target.value);event.currentTarget.style.height='auto';event.currentTarget.style.height=Math.min(event.currentTarget.scrollHeight,200)+'px'};
  const submit=(event:FormEvent)=>{event.preventDefault();runAnalysis()};
  const submitOnEnter=(event:KeyboardEvent<HTMLTextAreaElement>)=>{
    if(event.key!=='Enter'||event.shiftKey||event.nativeEvent.isComposing)return;
    event.preventDefault();
    runAnalysis();
  };
  const attach=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setQuestion(current=>`${current}${current?'\n\n':''}Contexto do arquivo ${file.name}:\n${String(reader.result).slice(0,5000)}`);reader.readAsText(file);event.target.value=''};

  return <main className="human-pro-page">
    <AppSidebar/>
    <section className="human-pro-content">
      <header className="human-chat-header">
        <div className="human-chat-product"><BrainCircuit/><span>Human Pro</span></div>
      </header>
      <div className="human-chat-main">
        <div className={`human-chat-thread ${messages.length?'has-messages':'is-empty'}`} aria-live="polite" aria-relevant="additions text">
          {messages.length===0?<section className="human-chat-empty"><h1>Como posso ajudar?</h1><p>Converse sobre suas reuniões, decisões e evolução profissional.</p></section>:messages.map(message=><article className={`human-message ${message.role}`} key={message.id} aria-label={message.role==='assistant'?'Resposta do Human Pro':'Sua mensagem'}>
            {message.role==='assistant'&&<div className="human-message-avatar"><BrainCircuit/></div>}
            <div className="human-message-content">{message.role==='assistant'&&<strong>Human Pro</strong>}<p>{message.content}</p></div>
          </article>)}
          {working&&<article className="human-message assistant thinking" role="status" aria-label="Human Pro está pensando"><div className="human-message-avatar"><BrainCircuit/></div><div className="human-message-content"><strong>Human Pro</strong><span className="human-thinking-dots" aria-hidden="true"><i/><i/><i/></span></div></article>}
          <div ref={threadEndRef}/>
        </div>
        <div className="human-composer-area">
          <form className="human-composer" onSubmit={submit}>
            <textarea ref={questionRef} aria-label="Pergunta para o Human Pro" value={question} onChange={changeQuestion} onKeyDown={submitOnEnter} placeholder="Pergunte ao Human Pro"/>
            <div className="human-composer-toolbar">
              <button type="button" className="human-attach" onClick={()=>fileRef.current?.click()} aria-label="Anexar contexto"><Plus/></button>
              <input ref={fileRef} type="file" hidden accept=".txt,.md,.json,text/plain,application/json" onChange={attach}/>
              <span>{performanceContext?'Perfil de performance conectado':`${meetings.length} reuniões disponíveis`}</span>
              <button className="human-send" disabled={!question.trim()||working} aria-label="Enviar mensagem"><ArrowUp/></button>
            </div>
          </form>
          <p className="human-disclaimer">O Human Pro pode cometer erros. Confira informações importantes.</p>
        </div>
      </div>
    </section>
  </main>;
}
