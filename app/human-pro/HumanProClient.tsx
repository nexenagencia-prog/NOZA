'use client';

import {ChangeEvent,FormEvent,KeyboardEvent,useEffect,useRef,useState} from 'react';
import {ArrowUp,Mic,Check,Clipboard,Plus,RotateCw,ThumbsDown,ThumbsUp,Volume2,VolumeX,ChevronDown,ChevronRight,Square,X} from 'lucide-react';
import AppSidebar from '../AppSidebar';

import '../app-sidebar.css';
import './human-pro.css';

type ChatMessage={id:string;role:'user'|'assistant';content:string};
type Feedback='up'|'down';
export default function HumanProClient(){
  const[question,setQuestion]=useState('');
  const[messages,setMessages]=useState<ChatMessage[]>([]);
  const[working,setWorking]=useState(false);
  const[profileName,setProfileName]=useState('Sandro Bello');
  const[copiedId,setCopiedId]=useState<string|null>(null);
  const[feedback,setFeedback]=useState<Record<string,Feedback>>({});
  const[speakingId,setSpeakingId]=useState<string|null>(null);
  const[voiceInput,setVoiceInput]=useState(false);
  const[voiceNotice,setVoiceNotice]=useState('');
  const[voiceLevel,setVoiceLevel]=useState(0);
  const[planMenuOpen,setPlanMenuOpen]=useState(false);
  const[awaitingPerformanceUpgrade,setAwaitingPerformanceUpgrade]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  const questionRef=useRef<HTMLTextAreaElement>(null);
  const threadEndRef=useRef<HTMLDivElement>(null);
  const audioInputRef=useRef<any>(null);
  const mediaStreamRef=useRef<MediaStream|null>(null);
  const audioContextRef=useRef<AudioContext|null>(null);
  const meterFrameRef=useRef<number|null>(null);
  const voiceBaseTextRef=useRef('');
  const voiceTextRef=useRef('');

  useEffect(()=>{
    try{setProfileName(localStorage.getItem('noza-profile-name')||'Sandro Bello')}catch{}
    const updateName=(event:Event)=>{const value=(event as CustomEvent<string>).detail;if(typeof value==='string'&&value.trim())setProfileName(value.trim())};
    const storageName=(event:StorageEvent)=>{if(event.key==='noza-profile-name'&&event.newValue)setProfileName(event.newValue)};
    window.addEventListener('noza:profile-name',updateName);
    window.addEventListener('storage',storageName);
    return()=>{window.removeEventListener('noza:profile-name',updateName);window.removeEventListener('storage',storageName);window.speechSynthesis?.cancel();audioInputRef.current?.abort?.();if(meterFrameRef.current!==null)cancelAnimationFrame(meterFrameRef.current);mediaStreamRef.current?.getTracks().forEach(track=>track.stop());void audioContextRef.current?.close()};
  },[]);

  useEffect(()=>{threadEndRef.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages,working]);
  useEffect(()=>{const field=questionRef.current;if(field){field.style.height='auto';field.style.height=Math.min(field.scrollHeight,200)+'px'}},[question]);

  const releaseVoiceMeter=()=>{
    if(meterFrameRef.current!==null)cancelAnimationFrame(meterFrameRef.current);
    meterFrameRef.current=null;
    mediaStreamRef.current?.getTracks().forEach(track=>track.stop());
    mediaStreamRef.current=null;
    if(audioContextRef.current)void audioContextRef.current.close();
    audioContextRef.current=null;
    setVoiceLevel(0);
  };
  const stopVoiceInput=()=>{
    const recognition=audioInputRef.current;
    audioInputRef.current=null;
    recognition?.stop?.();
    setVoiceInput(false);
    releaseVoiceMeter();
    setVoiceNotice(voiceTextRef.current.trim()?'Transcrição pronta para enviar.':'Gravação encerrada.');
  };
  const cancelVoiceInput=()=>{
    audioInputRef.current?.abort?.();
    audioInputRef.current=null;
    setQuestion(voiceBaseTextRef.current);
    setVoiceInput(false);
    releaseVoiceMeter();
    setVoiceNotice('');
  };
  const runAnalysis=async(value=question,priorMessages?:ChatMessage[])=>{
    const clean=value.trim();if(!clean||working)return;
    audioInputRef.current?.abort?.();audioInputRef.current=null;setVoiceInput(false);setVoiceNotice('');releaseVoiceMeter();
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
  const choosePerformance=()=>{
    setPlanMenuOpen(false);
    setAwaitingPerformanceUpgrade(true);
    setMessages(current=>[...current,{id:`assistant-upgrade-question-${Date.now()}`,role:'assistant',content:'Você quer fazer upgrade para o plano Performance?'}]);
  };
  const answerPerformanceUpgrade=(value=question)=>{
    const clean=value.trim();
    if(!clean)return;
    const normalized=clean.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const positive=/^(sim|s|quero|pode|claro|vamos|confirmo|isso)(\b|[,.!])/i.test(normalized);
    const negative=/^(nao|n|depois|cancelar|prefiro nao)(\b|[,.!])/i.test(normalized);
    const stamp=Date.now();
    const response=positive
      ?'Perfeito. Vou te encaminhar para a página de planos para você concluir o upgrade para Performance.'
      :negative
        ?'Tudo bem. Você pode continuar a conversa e consultar os planos pelo seletor Pro quando quiser.'
        :'Para seguir com o upgrade, responda “sim”. Se preferir, responda “não” e continuamos a conversa.';
    setMessages(current=>[...current,{id:`user-upgrade-${stamp}`,role:'user',content:clean},{id:`assistant-upgrade-${stamp}`,role:'assistant',content:response}]);
    setQuestion('');
    if(questionRef.current)questionRef.current.style.height='auto';
    if(positive||negative)setAwaitingPerformanceUpgrade(false);
    if(positive)window.setTimeout(()=>window.location.assign('/planos'),1300);
  };
  const sendCurrentMessage=()=>{if(voiceInput&&!question.trim()){setVoiceNotice('Ainda não reconheci fala para enviar.');return}return awaitingPerformanceUpgrade?answerPerformanceUpgrade():runAnalysis()};
  const changeQuestion=(event:ChangeEvent<HTMLTextAreaElement>)=>{setQuestion(event.target.value);event.currentTarget.style.height='auto';event.currentTarget.style.height=Math.min(event.currentTarget.scrollHeight,200)+'px'};
  const submit=(event:FormEvent)=>{event.preventDefault();sendCurrentMessage()};
  const submitOnEnter=(event:KeyboardEvent<HTMLTextAreaElement>)=>{
    if(event.key!=='Enter'||event.shiftKey||event.nativeEvent.isComposing)return;
    event.preventDefault();
    sendCurrentMessage();
  };
  const attach=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setQuestion(current=>`${current}${current?'\n\n':''}Contexto do arquivo ${file.name}:\n${String(reader.result).slice(0,5000)}`);reader.readAsText(file);event.target.value=''};
  const toggleVoiceInput=async()=>{
    if(voiceInput){stopVoiceInput();return}
    const speechApi=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!speechApi){setVoiceNotice('A transcrição por voz não está disponível neste navegador.');return}
    if(!navigator.mediaDevices?.getUserMedia){setVoiceNotice('Este navegador não permite acessar o microfone.');return}
    voiceBaseTextRef.current=question.trim();
    voiceTextRef.current='';
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      mediaStreamRef.current=stream;
      const AudioContextClass=(window as any).AudioContext||(window as any).webkitAudioContext;
      if(AudioContextClass){
        const context:AudioContext=new AudioContextClass();
        audioContextRef.current=context;
        await context.resume();
        const analyser=context.createAnalyser();
        analyser.fftSize=256;
        context.createMediaStreamSource(stream).connect(analyser);
        const samples=new Uint8Array(analyser.fftSize);
        const measure=()=>{
          analyser.getByteTimeDomainData(samples);
          let energy=0;
          for(const sample of samples){const value=(sample-128)/128;energy+=value*value}
          setVoiceLevel(Math.min(1,Math.sqrt(energy/samples.length)*4.5));
          meterFrameRef.current=requestAnimationFrame(measure);
        };
        measure();
      }
      const recognition=new speechApi();
      audioInputRef.current=recognition;
      recognition.lang='pt-BR';recognition.continuous=true;recognition.interimResults=true;
      recognition.onresult=(event:any)=>{
        let finalTranscript='',interimTranscript='';
        for(let index=0;index<event.results.length;index++){
          const result=event.results[index];
          if(result.isFinal)finalTranscript+=result[0].transcript;
          else interimTranscript+=result[0].transcript;
        }
        voiceTextRef.current=finalTranscript;
        const heard=(finalTranscript+' '+interimTranscript).trim();
        const prefix=voiceBaseTextRef.current;
        setQuestion(heard?(prefix+(prefix?' ':'')+heard):prefix);
        setVoiceNotice(heard?'Transcrição ao vivo':'Ouvindo… fale sua pergunta.');
      };
      recognition.onerror=()=>{
        audioInputRef.current=null;setVoiceInput(false);releaseVoiceMeter();
        setVoiceNotice('Não foi possível captar o áudio. Confira a permissão do microfone.');
      };
      recognition.onend=()=>{
        audioInputRef.current=null;setVoiceInput(false);releaseVoiceMeter();
        setVoiceNotice(voiceTextRef.current.trim()?'Transcrição pronta para enviar.':'');
      };
      recognition.start();
      setVoiceInput(true);
      setVoiceNotice('Ouvindo… fale sua pergunta.');
    }catch{
      audioInputRef.current?.abort?.();audioInputRef.current=null;setVoiceInput(false);releaseVoiceMeter();
      setVoiceNotice('Não foi possível iniciar o microfone. Confira a permissão do navegador.');
    }
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
    <form className={voiceInput?'human-composer recording':'human-composer'} onSubmit={submit}>
      {voiceInput?
        <div className="human-voice-capture">
          <button type="button" className="human-record-cancel" onClick={cancelVoiceInput} aria-label="Cancelar gravação" title="Cancelar"><X/></button>
          <div className="human-voice-capture-body">
            <div className="human-voice-live-head"><span>Ouvindo</span><div className="human-voice-bars" role="img" aria-label={"Nível do áudio "+Math.round(voiceLevel*100)+" por cento"}>{Array.from({length:24},(_,index)=>{const pulse=.25+.75*Math.abs(Math.sin(index*.73+voiceLevel*6));const activity=.22+voiceLevel*1.25;const height=Math.max(5,Math.round(4+activity*24*pulse));return <i key={index} style={{height:height+'px',animationDelay:(index*-45)+'ms'}}/>})}</div></div>
            <p className="human-voice-transcript" aria-live="polite">{question.slice(voiceBaseTextRef.current.length).trim()||'Fale agora… sua voz será transcrita aqui.'}</p>
          </div>
          <button type="button" className="human-record-stop" onClick={stopVoiceInput} aria-label="Parar gravação" title="Parar gravação"><Square/></button>
        </div>:
        <textarea ref={questionRef} aria-label="Mensagem para Chat Noza" value={question} onChange={changeQuestion} onKeyDown={submitOnEnter} placeholder="Converse com a Chat Noza"/>
      }
      <div className="human-composer-toolbar">
        {!voiceInput&&<><button type="button" className="human-attach" onClick={()=>fileRef.current?.click()} aria-label="Anexar contexto"><Plus/></button>
        <input ref={fileRef} type="file" hidden accept=".txt,.md,.json,text/plain,application/json" onChange={attach}/>
        <div className="human-plan-selector-wrap">
          <button type="button" className="human-plan-selector" onClick={()=>setPlanMenuOpen(open=>!open)} aria-expanded={planMenuOpen} aria-controls="human-plan-menu" aria-label="Selecionar plano" title="Ver opções de plano"><span>Pro</span><ChevronDown aria-hidden="true"/></button>
          {planMenuOpen&&<div className="human-plan-menu" id="human-plan-menu" role="menu"><button type="button" role="menuitem" onClick={choosePerformance}><span><strong>Performance</strong><small>Ver upgrade e valores</small></span><ChevronRight aria-hidden="true"/></button></div>}
        </div>
        <button type="button" className="human-voice" onClick={()=>void toggleVoiceInput()} aria-label="Fazer pergunta por áudio" aria-pressed={false} title="Perguntar por áudio"><Mic/></button></>}
        {voiceInput&&<span className="human-recording-label" role="status">Gravando áudio</span>}
        <button className="human-send" disabled={(!question.trim()&&!voiceInput)||working} aria-label="Enviar mensagem" title="Enviar transcrição"><ArrowUp/></button>
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
