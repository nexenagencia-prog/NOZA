'use client';

import {ChangeEvent,FormEvent,useEffect,useMemo,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Bell,BrainCircuit,CalendarDays,Camera,CameraOff,Check,ChevronLeft,ChevronRight,Calculator,ContactRound,Copy,Download,Ellipsis,FileUp,Filter,Grid2X2,Heart,LayoutList,Maximize2,MessageCircle,Mic,MicOff,MonitorUp,NotebookPen,PanelBottomClose,Plus,Presentation,Save,Send,Share2,SlidersHorizontal,Smile,StickyNote,Users,Video as VideoIcon,X} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import AppTopbar from '../AppTopbar';
import {appendMessage,createLocalSlide,filterParticipants,getParticipantPanelView,getSlideOverlay,mergeSlides,previousSlideIndex,toggleAgendaItem,upsertNote} from './space-model.mjs';
import './space.css';

type Message={id:string;author:string;body:string;time:string;mine:boolean};
type AgendaItem={id:string;time:string;title:string;done:boolean};
type Note={id:string;subject:string;body:string;created_at:string;updated_at:string};
type Participant={id:string;name:string;activity:string;image:string;active:boolean;muted:boolean};
type ParticipantFilter='all'|'active'|'muted';
type Slide={id:string;title:string;copy?:string;source:'space'|'computer'|'creator';kind:'insight'|'image'|'pdf';url:string;tone?:string};

const MESSAGES_KEY='zyvo-space-messages';
const AGENDA_KEY='zyvo-space-agenda';
const NOTES_KEY='zyvo:guest-notes';
const CREATOR_SLIDES_KEY='zyvo-created-slides';

const initialMessages:Message[]=[
  {id:'message-1',author:'Amanda',body:'Ótima apresentação!',time:'14:21',mine:false},
  {id:'message-2',author:'Marcus',body:'Concordo, faz todo sentido.',time:'14:22',mine:false},
  {id:'message-3',author:'Julia',body:'Podemos alinhar isso na próxima?',time:'14:22',mine:false},
];
const initialAgenda:AgendaItem[]=[
  {id:'agenda-1',time:'14:00',title:'Reunião de planejamento',done:false},
  {id:'agenda-2',time:'16:30',title:'Alinhamento com time',done:false},
  {id:'agenda-3',time:'10:00',title:'Apresentação do projeto',done:false},
];
const initialNotes:Note[]=[
  {id:'space-note-1',subject:'Plano de marketing',body:'Prioridades, responsáveis e próximos passos.',created_at:'2026-09-11T14:22:00.000Z',updated_at:'2026-09-11T14:22:00.000Z'},
  {id:'space-note-2',subject:'Feedback da reunião',body:'Revisar perguntas estratégicas antes do próximo encontro.',created_at:'2026-09-11T12:10:00.000Z',updated_at:'2026-09-11T12:10:00.000Z'},
];
const participants:Participant[]=[
  {id:'p1',name:'Theresa Webb',activity:'Cantando',image:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=520&q=82',active:true,muted:false},
  {id:'p2',name:'Jane Cooper',activity:'Apresentando',image:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=520&q=82',active:true,muted:false},
  {id:'p3',name:'Arlene McCoy',activity:'Ouvindo',image:'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=520&q=82',active:false,muted:true},
  {id:'p4',name:'Darrell Steward',activity:'Ouvindo',image:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=520&q=82',active:true,muted:true},
  {id:'p5',name:'Dianne Russell',activity:'Fotografando',image:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=520&q=82',active:true,muted:false},
  {id:'p6',name:'Ronald Richards',activity:'Falando',image:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=520&q=82',active:true,muted:false},
  {id:'p7',name:'Albert Flores',activity:'Ouvindo',image:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=520&q=82',active:false,muted:true},
  {id:'p8',name:'Devon Lane',activity:'Ouvindo',image:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=520&q=82',active:true,muted:false},
];
const initialSlides:Slide[]=[
  {id:'space-slide-1',title:'Ótima evolução!',copy:'Você foi mais objetivo e fez perguntas mais estratégicas nesta reunião.',source:'space',kind:'insight',url:'space://evolution',tone:'coral'},
  {id:'space-slide-2',title:'Escuta em alta',copy:'O tempo dedicado às respostas do time cresceu 18% desde a última reunião.',source:'space',kind:'insight',url:'space://listening',tone:'blue'},
  {id:'space-slide-3',title:'Próximo foco',copy:'Transforme os combinados finais em responsáveis e prazos ainda durante a conversa.',source:'space',kind:'insight',url:'space://focus',tone:'green'},
];

function readStored<T>(key:string,fallback:T):T{try{const value=localStorage.getItem(key);return value?JSON.parse(value) as T:fallback}catch{return fallback}}
function currentTime(){return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(new Date())}

export default function SpaceClient(){
  const router=useRouter();
  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const noteTitleRef=useRef<HTMLInputElement>(null);
  const slideFileRef=useRef<HTMLInputElement>(null);
  const slideUrlsRef=useRef<string[]>([]);
  const [hydrated,setHydrated]=useState(false);
  const [messages,setMessages]=useState<Message[]>(initialMessages);
  const [message,setMessage]=useState('');
  const [agenda,setAgenda]=useState<AgendaItem[]>(initialAgenda);
  const [agendaForm,setAgendaForm]=useState(false);
  const [agendaTitle,setAgendaTitle]=useState('');
  const [agendaTime,setAgendaTime]=useState('09:00');
  const [notes,setNotes]=useState<Note[]>(initialNotes);
  const [noteId,setNoteId]=useState<string|null>(null);
  const [noteTitle,setNoteTitle]=useState('');
  const [noteBody,setNoteBody]=useState('');
  const [chatOpen,setChatOpen]=useState(true);
  const [layout,setLayout]=useState<'mosaic'|'list'>('mosaic');
  const [filter,setFilter]=useState<ParticipantFilter>('all');
  const [filterOpen,setFilterOpen]=useState(false);
  const [moreOpen,setMoreOpen]=useState(false);
  const [exitOpen,setExitOpen]=useState(false);
  const [cameraOn,setCameraOn]=useState(false);
  const [micOn,setMicOn]=useState(false);
  const [mediaError,setMediaError]=useState('');
  const [shared,setShared]=useState(false);
  const [slide,setSlide]=useState(0);
  const [slides,setSlides]=useState<Slide[]>(initialSlides);
  const [selectedParticipantId,setSelectedParticipantId]=useState<string|null>(null);
  const [meetingMenuOpen,setMeetingMenuOpen]=useState(false);
  const [reactionCounts,setReactionCounts]=useState({likes:12,messages:8,shares:3});

  useEffect(()=>{
    setMessages(readStored(MESSAGES_KEY,initialMessages));
    setAgenda(readStored(AGENDA_KEY,initialAgenda));
    setNotes(readStored(NOTES_KEY,initialNotes));
    const creator=readStored<Slide[]>(CREATOR_SLIDES_KEY,[]);
    setSlides(mergeSlides(initialSlides,creator) as Slide[]);
    const syncCreatorSlides=()=>setSlides(current=>mergeSlides(current,readStored<Slide[]>(CREATOR_SLIDES_KEY,[])) as Slide[]);
    window.addEventListener('storage',syncCreatorSlides);
    window.addEventListener('zyvo:slides-updated',syncCreatorSlides);
    setHydrated(true);
    return()=>{streamRef.current?.getTracks().forEach(track=>track.stop());slideUrlsRef.current.forEach(url=>URL.revokeObjectURL(url));window.removeEventListener('storage',syncCreatorSlides);window.removeEventListener('zyvo:slides-updated',syncCreatorSlides)};
  },[]);
  useEffect(()=>{if(hydrated)try{localStorage.setItem(MESSAGES_KEY,JSON.stringify(messages))}catch{}},[messages,hydrated]);
  useEffect(()=>{if(hydrated)try{localStorage.setItem(AGENDA_KEY,JSON.stringify(agenda))}catch{}},[agenda,hydrated]);
  useEffect(()=>{if(hydrated)try{localStorage.setItem(NOTES_KEY,JSON.stringify(notes))}catch{}},[notes,hydrated]);

  const visibleParticipants=useMemo(()=>filterParticipants(participants,filter) as Participant[],[filter]);
  const participantView=useMemo(()=>getParticipantPanelView(participants,selectedParticipantId) as {mode:'mosaic'|'focus';participant:Participant|null},[selectedParticipantId]);
  const currentSlide=slides[slide]||initialSlides[0];
  const slideOverlay=getSlideOverlay(currentSlide) as {title:string;copy?:string;sourceLabel:string}|null;
  const submitMessage=(event:FormEvent)=>{event.preventDefault();setMessages(items=>appendMessage(items,message,currentTime()));setMessage('')};
  const submitAgenda=(event:FormEvent)=>{event.preventDefault();const title=agendaTitle.trim();if(!title)return;setAgenda(items=>[...items,{id:`agenda-${Date.now()}`,time:agendaTime,title,done:false}]);setAgendaTitle('');setAgendaForm(false)};
  const editNote=(note:Note)=>{setNoteId(note.id);setNoteTitle(note.subject);setNoteBody(note.body);noteTitleRef.current?.focus()};
  const saveNote=(event:FormEvent)=>{event.preventDefault();const subject=noteTitle.trim();if(!subject)return;const stamp=new Date().toISOString();const existing=notes.find(item=>item.id===noteId);const saved:Note={id:noteId||`space-note-${Date.now()}`,subject,body:noteBody.trim(),created_at:existing?.created_at||stamp,updated_at:stamp};setNotes(items=>upsertNote(items,saved));try{localStorage.setItem('zyvo:last-saved-note',JSON.stringify(saved));window.dispatchEvent(new CustomEvent('zyvo:note-saved',{detail:saved}))}catch{}setNoteId(null);setNoteTitle('');setNoteBody('')};
  const removeNote=(id:string)=>setNotes(items=>items.filter(item=>item.id!==id));

  const attachStream=(stream:MediaStream)=>{streamRef.current=stream;if(videoRef.current)videoRef.current.srcObject=stream};
  const toggleDevice=async(kind:'camera'|'microphone')=>{
    const isCamera=kind==='camera';const enabled=isCamera?cameraOn:micOn;const trackKind=isCamera?'video':'audio';setMediaError('');
    if(enabled){streamRef.current?.getTracks().filter(track=>track.kind===trackKind).forEach(track=>{track.stop();streamRef.current?.removeTrack(track)});isCamera?setCameraOn(false):setMicOn(false);return}
    if(!navigator.mediaDevices?.getUserMedia){setMediaError('Câmera e microfone não estão disponíveis neste navegador.');return}
    try{const fresh=await navigator.mediaDevices.getUserMedia(isCamera?{video:true,audio:false}:{video:false,audio:true});const combined=new MediaStream([...(streamRef.current?.getTracks().filter(track=>track.readyState==='live')||[]),...fresh.getTracks()]);attachStream(combined);isCamera?setCameraOn(true):setMicOn(true)}catch{setMediaError(`Permissão de ${isCamera?'câmera':'microfone'} não concedida.`)}
  };
  const shareSpace=async()=>{setShared(false);try{if(navigator.share)await navigator.share({title:'NOZA Space',text:'Entre no meu Space da NOZA',url:location.href});else await navigator.clipboard.writeText(location.href);setShared(true);setTimeout(()=>setShared(false),2200)}catch{setMediaError('Não foi possível compartilhar o link agora.')}};
  const importSlides=(event:ChangeEvent<HTMLInputElement>)=>{const files=[...(event.target.files||[])];const imported=files.map((file,index)=>{const url=URL.createObjectURL(file);slideUrlsRef.current.push(url);return createLocalSlide(file,url,Date.now()+index) as Slide|null}).filter(Boolean) as Slide[];if(imported.length){setSlides(items=>{const next=mergeSlides(items,imported) as Slide[];setSlide(Math.max(0,next.length-imported.length));return next});setMediaError(`${imported.length} ${imported.length===1?'slide aberto':'slides abertos'} no Space.`)}else if(files.length)setMediaError('Use arquivos de imagem ou PDF.');event.target.value=''};
  const copyCurrentSlide=async()=>{try{await navigator.clipboard.writeText([currentSlide.title,currentSlide.copy].filter(Boolean).join('\n'));setMediaError('Conteúdo do slide copiado.')}catch{setMediaError('Não foi possível copiar este slide.')}};
  const saveCurrentSlide=()=>{let url=currentSlide.url;let revoke=false;if(currentSlide.kind==='insight'){url=URL.createObjectURL(new Blob([[currentSlide.title,currentSlide.copy].filter(Boolean).join('\n\n')],{type:'text/plain'}));revoke=true}const anchor=document.createElement('a');anchor.href=url;anchor.download=`${currentSlide.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.${currentSlide.kind==='pdf'?'pdf':currentSlide.kind==='image'?'png':'txt'}`;anchor.click();if(revoke)setTimeout(()=>URL.revokeObjectURL(url),0);setMediaError('Slide salvo no computador.')};

  return <main className="app-shell space-page">
    <AppSidebar/>
    <section className="content space-content">
      <AppTopbar/>
      <div className="space-workspace">
        <section className="space-live-card" aria-label="Reunião ao vivo">
          <div className="space-host"><span className="space-live-dot"/><strong>Sandro</strong><time>00:24</time><button aria-label="Mais opções da reunião" aria-expanded={meetingMenuOpen} onClick={()=>setMeetingMenuOpen(value=>!value)}><Ellipsis/></button>{meetingMenuOpen&&<div className="space-host-menu"><button onClick={()=>setChatOpen(value=>!value)}>{chatOpen?'Ocultar':'Mostrar'} chat</button><button onClick={()=>setMediaError('Qualidade automática ativada.')}>Qualidade automática</button></div>}</div>
          <div className="space-host-media"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1100&q=88" alt="Sandro na reunião"/><video ref={videoRef} autoPlay muted playsInline className={cameraOn?'is-visible':''}/><div className="space-reactions"><button onClick={()=>setReactionCounts(value=>({...value,likes:value.likes+1}))} aria-label="Curtir reunião"><Heart fill="currentColor"/>{reactionCounts.likes}</button><button onClick={()=>setChatOpen(true)} aria-label="Abrir chat"><MessageCircle/>{reactionCounts.messages}</button><button onClick={()=>{setReactionCounts(value=>({...value,shares:value.shares+1}));shareSpace()}} aria-label="Compartilhar reunião"><Send/>{reactionCounts.shares}</button></div></div>
          {chatOpen&&<div className="space-chat-panel"><div className="space-chat-list">{messages.slice(-4).map(item=><div className={item.mine?'mine':''} key={item.id}><b>{item.author}</b><time>{item.time}</time><p>{item.body}</p></div>)}</div><form onSubmit={submitMessage}><input value={message} onChange={e=>setMessage(e.target.value)} aria-label="Mensagem" placeholder="Enviar uma mensagem..."/><Smile/><button aria-label="Enviar mensagem"><Send/></button></form></div>}
        </section>

        <section className={`space-participants-panel space-glass ${participantView.mode==='focus'?'is-focused':''}`} aria-label="Participantes">
          <header><div>{participantView.participant&&<button className="space-participant-back" onClick={()=>setSelectedParticipantId(null)} aria-label="Voltar ao mosaico"><ChevronLeft/></button>}<strong>{participantView.participant?.name||'Participantes'}</strong>{!participantView.participant&&<span>{visibleParticipants.length}</span>}</div>{!participantView.participant&&<div className="space-view-switch"><button className={layout==='mosaic'?'active':''} onClick={()=>setLayout('mosaic')} aria-label="Visualização em mosaico" aria-pressed={layout==='mosaic'}><Grid2X2/>Mosaico</button><button className={layout==='list'?'active':''} onClick={()=>setLayout('list')} aria-label="Visualização em lista" aria-pressed={layout==='list'}><LayoutList/></button></div>}</header>
          {participantView.participant?<div className="space-participant-stage" aria-label={`Câmera ampliada de ${participantView.participant.name}`}><img src={participantView.participant.image} alt=""/><div className="space-participant-stage-gradient"/><div className="space-participant-stage-copy"><small>{participantView.participant.activity}</small><strong>{participantView.participant.name}</strong><span>{participantView.participant.muted?<><MicOff/>Microfone silenciado</>:<><Mic/>Participando agora</>}</span></div></div>:<div className={`space-participants ${layout}`}>{visibleParticipants.map(person=><button className="space-participant-card" key={person.id} onClick={()=>setSelectedParticipantId(person.id)} aria-label={`Expandir câmera de ${person.name}`}><img src={person.image} alt=""/><div><small>{person.activity}</small><strong>{person.name}</strong></div><span className={person.muted?'muted':'active'}>{person.muted?<MicOff/>:<Mic/>}</span><Maximize2 className="space-participant-expand"/></button>)}</div>}
        </section>

        <section className={`space-evolution space-glass ${currentSlide.tone||'file'}`} aria-label="Slides da reunião"><input ref={slideFileRef} className="space-slide-input" type="file" accept="image/*,application/pdf,.pdf" multiple onChange={importSlides}/>{currentSlide.kind==='image'&&<img className="space-slide-media" src={currentSlide.url} alt="Slide aberto do computador"/>} {currentSlide.kind==='pdf'&&<iframe className="space-slide-media" src={currentSlide.url} title="Slide PDF aberto do computador"/>}<div className={`space-evolution-copy ${slideOverlay?'':'file-copy'}`}><div className="space-slide-actions"><button onClick={()=>slideFileRef.current?.click()} aria-label="Abrir slides do computador"><FileUp/></button><button onClick={copyCurrentSlide} aria-label="Copiar conteúdo do slide"><Copy/></button><button onClick={saveCurrentSlide} aria-label="Salvar slide no computador"><Download/></button></div>{slideOverlay&&<><h1>{slideOverlay.title}</h1>{slideOverlay.copy&&<p>{slideOverlay.copy}</p>}<small>{slideOverlay.sourceLabel}</small></>}<div className="space-dots">{slides.map((item,index)=><button key={item.id} className={index===slide?'active':''} onClick={()=>setSlide(index)} aria-label={`Slide ${index+1}: ${item.title}`}/>)}</div></div>{currentSlide.kind==='insight'&&<div className="space-wave"/>}<button className="space-previous-slide" onClick={()=>setSlide(index=>previousSlideIndex(index,slides.length))} aria-label="Slide anterior"><ChevronLeft/></button><button className="space-next-slide" onClick={()=>setSlide(index=>(index+1)%slides.length)} aria-label="Próximo slide"><ChevronRight/></button></section>
        <div className="space-meeting-skills-below-slides"><button className="space-meeting-skills-btn" onClick={()=>router.push('/skills')}><BrainCircuit/><span>Skills da reunião</span></button></div>

        <section className="space-agenda space-glass" aria-label="Agenda do Space"><header><div><CalendarDays/><span><strong>Agenda</strong><small>Suas próximas reuniões</small></span></div><button onClick={()=>setAgendaForm(value=>!value)} aria-label="Adicionar à agenda"><Plus/></button></header>{agendaForm&&<form onSubmit={submitAgenda} className="space-agenda-form"><input aria-label="Horário da reunião" type="time" value={agendaTime} onChange={e=>setAgendaTime(e.target.value)}/><input aria-label="Nome da reunião" autoFocus value={agendaTitle} onChange={e=>setAgendaTitle(e.target.value)} placeholder="Nome da reunião"/><button aria-label="Salvar reunião"><Check/></button></form>}<div className="space-agenda-list">{agenda.map(item=><div className={'space-agenda-entry '+(item.done?'done':'')} key={item.id}><button className="space-agenda-main" onClick={()=>setAgenda(items=>toggleAgendaItem(items,item.id))}><time>{item.time}</time><span>{item.title}</span>{item.done?<Check/>:<ChevronRight/>}</button><button className="space-agenda-enter" onClick={()=>{try{localStorage.setItem('noza-space-active-meeting',JSON.stringify(item))}catch{};setMediaError('Entrando em '+item.title+'...')}}>Entrar</button></div>)}</div></section>

        <section className="space-notes space-glass" aria-label="Anotações do Space"><header><div><NotebookPen/><span><strong>Anotações</strong><small>Ideias, insights e decisões</small></span></div><button onClick={()=>noteTitleRef.current?.focus()} aria-label="Nova anotação"><Plus/></button></header><form onSubmit={saveNote} className="space-note-form"><input ref={noteTitleRef} value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Título da anotação" aria-label="Título da anotação"/><textarea value={noteBody} onChange={e=>setNoteBody(e.target.value)} placeholder="Escreva uma decisão ou insight..." aria-label="Conteúdo da anotação"/><button><Save/>{noteId?'Atualizar':'Salvar'}</button></form><div className="space-note-list">{notes.slice(0,4).map(note=><article key={note.id}><button onClick={()=>editNote(note)}><StickyNote/><span><strong>{note.subject}</strong><small>{new Date(note.updated_at).toLocaleString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></span></button><button onClick={()=>removeNote(note.id)} aria-label={`Excluir ${note.subject}`}><X/></button></article>)}</div></section>
      </div>

      <nav className="space-controls" aria-label="Controles da reunião">
        <button className={micOn?'active':''} onClick={()=>toggleDevice('microphone')} aria-pressed={micOn}>{micOn?<Mic/>:<MicOff/>}<span>Microfone</span></button>
        <button className={cameraOn?'active':''} onClick={()=>toggleDevice('camera')} aria-pressed={cameraOn}>{cameraOn?<Camera/>:<CameraOff/>}<span>Câmera</span></button>
        <button className={chatOpen?'active':''} onClick={()=>setChatOpen(value=>!value)} aria-pressed={chatOpen}><MessageCircle/><span>Chat</span></button>
        <button onClick={()=>noteTitleRef.current?.focus()}><NotebookPen/><span>Anotar</span></button>
        <button onClick={()=>setLayout(value=>value==='mosaic'?'list':'mosaic')}><Users/><span>Participantes</span></button>
        <div className="space-control-menu"><button onClick={()=>setFilterOpen(value=>!value)} aria-expanded={filterOpen}><Filter/><span>Filtros</span></button>{filterOpen&&<div>{(['all','active','muted'] as ParticipantFilter[]).map(value=><button key={value} className={filter===value?'active':''} onClick={()=>{setFilter(value);setFilterOpen(false)}}>{value==='all'?'Todos':value==='active'?'Ativos':'Silenciados'}</button>)}</div>}</div>
        <button onClick={shareSpace}><MonitorUp/><span>{shared?'Link copiado':'Compartilhar'}</span></button>
        <button onClick={()=>router.push('/contatos')}><ContactRound/><span>Contatos</span></button>
        <button onClick={()=>router.push('/gravacoes')}><VideoIcon/><span>Gravações</span></button>
        <button onClick={()=>window.dispatchEvent(new Event('zyvo:open-calculator'))}><Calculator/><span>Calculadora</span></button>
        <button onClick={()=>router.push('/slides')}><Presentation/><span>Criar slides</span></button>
        <div className="space-control-menu"><button onClick={()=>setMoreOpen(value=>!value)} aria-expanded={moreOpen}><Ellipsis/><span>Mais</span></button>{moreOpen&&<div><button onClick={()=>setChatOpen(false)}><PanelBottomClose/>Ocultar chat</button><button onClick={()=>setMediaError('Preferências da reunião atualizadas.')}><SlidersHorizontal/>Preferências</button></div>}</div>
        <button className="space-leave" onClick={()=>setExitOpen(true)}><Share2/><span>Sair</span></button>
      </nav>
      {mediaError&&<div className="space-toast" role="status"><Bell/>{mediaError}<button onClick={()=>setMediaError('')} aria-label="Fechar aviso"><X/></button></div>}
      {exitOpen&&<div className="space-dialog-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setExitOpen(false)}}><div className="space-dialog" role="dialog" aria-modal="true" aria-labelledby="space-exit-title"><button className="space-dialog-close" onClick={()=>setExitOpen(false)} aria-label="Fechar"><X/></button><h2 id="space-exit-title">Sair do Space?</h2><p>A câmera e o microfone serão desligados. Suas mensagens, agenda e anotações permanecerão salvas.</p><div><button onClick={()=>setExitOpen(false)}>Continuar na reunião</button><button className="danger" onClick={()=>router.push('/')}>Sair agora</button></div></div></div>}
    </section>
  </main>;
}
