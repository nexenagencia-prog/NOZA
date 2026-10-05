'use client';

import {ChangeEvent,FormEvent,KeyboardEvent,useEffect,useRef,useState} from 'react';
import {ArrowUp,Mic,Check,Clipboard,Plus,RotateCw,ThumbsDown,ThumbsUp,Volume2,VolumeX} from 'lucide-react';
import AppSidebar from '../AppSidebar';

import '../app-sidebar.css';
import './human-pro.css';
import {getPerformanceProfile} from '../../lib/performance/core';

type Meeting={id:string;title:string;objective?:string;phrase?:string;summary?:string;transcript?:string};
type ChatMessage={id:string;role:'user'|'assistant';content:string};
type Feedback='up'|'down';
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
  const[profileName,setProfileName]=useState('Sandro Bello');
  const[copiedId,setCopiedId]=useState<string|null>(null);
  const[feedback,setFeedback]=useState<Record<string,Feedback>>({});
  const[speakingId,setSpeakingId]=useState<string|null>(null);
  const[voiceInput,setVoiceInput]=useState(false);
  const[voiceNotice,setVoiceNotice]=useState('');
  const fileRef=useRef<HTMLInputElement>(null);
  const questionRef=useRef<HTMLTextAreaElement>(null);
  const threadEndRef=useRef<HTMLDivElement>(null);
  const audioInputRef=useRef<any>(null);

  useEffect(()=>{
    setMeetings(loadMeetings());
    try{setProfileName(localStorage.getItem('noza-profile-name')||'Sandro Bello')}catch{}
    const updateName=(event:Event)=>{const value=(event as CustomEvent<string>).detail;if(typeof value==='string'&&value.trim())setProfileName(value.trim())};
    const storageName=(event:StorageEvent)=>{if(event.key==='noza-profile-name'&&event.newValue)setProfileName(event.newValue)};
    window.addEventListener('noza:profile-name',updateName);
    window.addEventListener('storage',storageName);
    getPerformanceProfile().then(profile=>{const intelligence=(profile.intelligence||[]).slice(0,12).map((s:any)=>`${s.skill}: score ${s.score}, confiança ${Math.round(s.confidence*100)}%, tendência ${s.direction} (${s.trend>0?'+':''}${s.trend}), recorrência ${s.recurrence}, contradição ${Math.round(s.contradiction*100)}%, evidência recente: ${s.latestEvidence||'sem evidência textual'}`).join('\n');const recent=profile.events.slice(0,8).map((e:any)=>`${e.created_at||''} · ${e.source} · ${e.skill||e.event_type}: ${e.evidence||''}`).join('\n');setPerformanceContext([intelligence,recent].filter(Boolean).join('\n'))}).catch(()=>{});
    return()=>{window.removeEventListener('noza:profile-name',updateName);window.removeEventListener('storage',storageName);window.speechSynthesis?.cancel();audioInputRef.current?.abort?.()};
  },[]);

  useEffect(()=>{threadEndRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages,working]);
  useEffect(()=>{const field=questionRef.current;if(field){field.style.height='auto';field.style.height=Math.min(field.scrollHeight,200)+'px'}},[question]);

  const runAnalysis=async(value=question,priorMessages?:ChatMessage[])=>{
    const clean=value.trim();if(!clean||working)return;
    audioInputRef.current?.stop?.();setVoiceInput(false);setVoiceNotice('');
    const stamp=Date.now();
    const next=priorMessages?[...priorMessages]:[...messages,{id:`user-${stamp}`,role:'user' as const,content:clean}];
    if(priorMessages)setMessages(priorMessages);
    else setMessages(next);
    setQuestion('');if(questionRef.current)questionRef.current.style.height='auto';setWorking(true);
    try{
      const response=await fetch('/api/human-pro/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next.map(({role,content})=>({role,content}))})});
      const data=await response.json();
      if(!response.ok)throw new Error(data?.error||'CHATNOSA_ERROR');
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
  const toggleVoiceInput=()=>{
    if(voiceInput){audioInputRef.current?.stop?.();setVoiceInput(false);setVoiceNotice('');return}
    const speechApi=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!speechApi){setVoiceNotice('O ditado por áudio não está disponível neste navegador.');return}
    const recognition=new speechApi();
    recognition.lang='pt-BR';recognition.continuous=true;recognition.interimResults=false;
    recognition.onresult=(event:any)=>{let transcript='';for(let index=event.resultIndex;index<event.results.length;index++)if(event.results[index].isFinal)transcript+=event.results[index][0].transcript;if(transcript.trim()){setQuestion(current=>current+(current.trim()?' ':'')+transcript.trim());setVoiceNotice('Ouvindo… fale sua pergunta.')}};
    recognition.onerror=()=>{setVoiceInput(false);setVoiceNotice('Não foi possível captar o áudio. Verifique a permissão do microfone.');audioInputRef.current=null};
    recognition.onend=()=>{setVoiceInput(false);audioInputRef.current=null};
    try{recognition.start();audioInputRef.current=recognition;setVoiceInput(true);setVoiceNotice('Ouvindo… fale sua pergunta.')}catch{setVoiceInput(false);setVoiceNotice('Não foi possível iniciar o microfone.')}
  };
  const copyMessage=async(message:ChatMessage)=>{
    try{await navigator.clipboard.writeText(message.content);setCopiedId(message.id);window.setTimeout(()=>setCopiedId(current=>current===message.id?null:current),1800)}catch{}
  };
  const speakMessage=(message:ChatMessage)=>{
    if(!('speechSynthesis'in window))return;
    if(speakingId===message.id){window.speechSynthesis.cancel();setSpeakingId(null);return}
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(message.content);utterance.lang='pt-BR';
    utterance.onend=()=>setSpeakingId(null);utterance.onerror=()=>setSpeakingId(null);
    setSpeakingId(message.id);window.speechSynthesis.speak(utterance);
  };
  const regenerate=(index:number)=>{
    const prior=messages.slice(0,index);
    const lastUser=[...prior].reverse().find(message=>message.role==='user');
    if(lastUser)runAnalysis(lastUser.content,prior);
  };
  const toggleFeedback=(id:string,value:Feedback)=>setFeedback(current=>({...current,[id]:current[id]===value?undefined:value} as Record<string,Feedback>));
  const firstName=profileName.trim().split(/\s+/)[0]||'';

  const composer=<div className="human-composer-area">
    <form className="human-composer" onSubmit={submit}>
      <textarea ref={questionRef} aria-label="Mensagem para Chat Noza" value={question} onChange={changeQuestion} onKeyDown={submitOnEnter} placeholder="Converse com a Chat Noza"/>
      <div className="human-composer-toolbar">
        <button type="button" className="human-attach" onClick={()=>fileRef.current?.click()} aria-label="Anexar contexto"><Plus/></button>
        <input ref={fileRef} type="file" hidden accept=".txt,.md,.json,text/plain,application/json" onChange={attach}/>
        <span>{performanceContext?'Perfil de performance conectado':`${meetings.length} reuniões disponíveis`}</span>
        <button type="button" className={`human-voice ${voiceInput?'active':''}`} onClick={toggleVoiceInput} aria-label={voiceInput?'Parar ditado por áudio':'Fazer pergunta por áudio'} aria-pressed={voiceInput} title={voiceInput?'Parar ditado':'Perguntar por áudio'}><Mic/></button>
        <button className="human-send" disabled={!question.trim()||working} aria-label="Enviar mensagem"><ArrowUp/></button>
      </div>
    </form>
    {voiceNotice&&<p className="human-audio-notice" role="status">{voiceNotice}</p>}
    <p className="human-disclaimer">A Chat Noza pode cometer erros. Confira informações importantes.</p>
  </div>;

  return <main className="human-pro-page">
    <AppSidebar/>
    <section className="human-pro-content">
      <header className="human-chat-header">
        <div className="human-chat-product"><span className="chat-noza-mark" aria-hidden="true">N</span><span>Chat Noza</span></div>
      </header>
      <div className="human-chat-main">
        {messages.length===0?
          <div className="human-chat-landing">
            <section className="human-chat-empty"><h1>Oi {firstName}, em que posso te ajudar?</h1><p>Converse sobre suas reuniões, decisões e evolução profissional.</p></section>
            {composer}
          </div>:
          <>
            <div className="human-chat-thread has-messages" aria-live="polite" aria-relevant="additions text">
              {messages.map((message,index)=><article className={`human-message ${message.role}`} key={message.id} aria-label={message.role==='assistant'?'Resposta da Chat Noza':'Sua mensagem'}>
                {message.role==='assistant'&&<div className="human-message-avatar"><span className="chat-noza-mark" aria-hidden="true">N</span></div>}
                <div className="human-message-content">{message.role==='assistant'&&<strong>Chat Noza</strong>}<p>{message.content}</p>
                  {message.role==='assistant'&&<div className="human-message-tools" aria-label="Ações da resposta">
                    <button type="button" onClick={()=>copyMessage(message)} aria-label={copiedId===message.id?'Copiado':'Copiar resposta'} title={copiedId===message.id?'Copiado':'Copiar'}>{copiedId===message.id?<Check/>:<Clipboard/>}</button>
                    <button type="button" className={feedback[message.id]==='up'?'selected':''} onClick={()=>toggleFeedback(message.id,'up')} aria-label="Gostei da resposta" aria-pressed={feedback[message.id]==='up'} title="Gostei"><ThumbsUp/></button>
                    <button type="button" className={feedback[message.id]==='down'?'selected':''} onClick={()=>toggleFeedback(message.id,'down')} aria-label="Não gostei da resposta" aria-pressed={feedback[message.id]==='down'} title="Não gostei"><ThumbsDown/></button>
                    <button type="button" className={speakingId===message.id?'selected':''} onClick={()=>speakMessage(message)} aria-label={speakingId===message.id?'Parar áudio':'Ouvir resposta'} title={speakingId===message.id?'Parar áudio':'Ouvir em áudio'}>{speakingId===message.id?<VolumeX/>:<Volume2/>}</button>
                    <button type="button" onClick={()=>regenerate(index)} disabled={working} aria-label="Gerar novamente" title="Gerar novamente"><RotateCw/></button>
                  </div>}
                </div>
              </article>)}
              {working&&<article className="human-message assistant thinking" role="status" aria-label="Chat Noza está pensando"><div className="human-message-avatar"><span className="chat-noza-mark" aria-hidden="true">N</span></div><div className="human-message-content"><strong>Chat Noza</strong><span className="human-thinking-dots" aria-hidden="true"><i/><i/><i/></span></div></article>}
              <div ref={threadEndRef}/>
            </div>
            {composer}
          </>
        }
      </div>
    </section>
  </main>;
}
