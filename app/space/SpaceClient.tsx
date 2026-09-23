'use client';

import {ChangeEvent,FormEvent,useEffect,useMemo,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Bell,BrainCircuit,CalendarDays,Camera,CameraOff,Check,ChevronDown,ChevronLeft,ChevronRight,ChevronUp,Calculator,ContactRound,Copy,Download,Ellipsis,FileUp,Filter,Grid2X2,Heart,LayoutList,Maximize2,MessageCircle,Mic,MicOff,MonitorUp,NotebookPen,PanelBottomClose,Plus,Presentation,Save,Send,Share2,SlidersHorizontal,Smile,StickyNote,Users,Video as VideoIcon,X,Trash2} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import FloatingNotes,{type FloatingNotesMode} from '../FloatingNotes';
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
const SPACE_IMPORTED_SLIDES_KEY='noza-space-imported-slides-v1';

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
const initialSlides:Slide[]=[];

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
  const [slideViewerOpen,setSlideViewerOpen]=useState(false);
  const [slideVisibleToParticipants,setSlideVisibleToParticipants]=useState(false);
  const [slides,setSlides]=useState<Slide[]>(initialSlides);
  const [selectedParticipantId,setSelectedParticipantId]=useState<string|null>(null);
  const [meetingMenuOpen,setMeetingMenuOpen]=useState(false);
  const [reactionCounts,setReactionCounts]=useState({likes:12,messages:8,shares:3});
  const [transcript,setTranscript]=useState('');
  const [transcribing,setTranscribing]=useState(false);
  const [videoFilter,setVideoFilter]=useState<'none'|'contrast'|'soft'|'mono'>('none');
  const recognitionRef=useRef<any>(null);
  const [collapsed,setCollapsed]=useState({slides:false,agenda:false,notes:false});
  const [supportCardsCollapsed,setSupportCardsCollapsed]=useState(false);
  const [notesMode,setNotesMode]=useState<FloatingNotesMode>(null);
  const [contactsOpen,setContactsOpen]=useState(false);
  const [calculatorOpen,setCalculatorOpen]=useState(false);
  const [controlsCollapsed,setControlsCollapsed]=useState(false);
  const [meetingSkillsOpen,setMeetingSkillsOpen]=useState(false);
  const [calcExpression,setCalcExpression]=useState('');
  const [calcResult,setCalcResult]=useState('0');
  const [contactSelection,setContactSelection]=useState<string[]>([]);
  const togglePanel=(key:'slides'|'agenda'|'notes')=>setCollapsed(value=>({...value,[key]:!value[key]}));
  const toggleSupportCards=()=>{setSupportCardsCollapsed(value=>{const next=!value;setCollapsed({slides:next,agenda:next,notes:next});return next})};
  const toggleContact=(id:string)=>setContactSelection(list=>list.includes(id)?list.filter(item=>item!==id):[...list,id]);
  const addContactsNow=()=>{if(!contactSelection.length){setMediaError('Selecione pelo menos um contato.');return}const selected=participants.filter(person=>contactSelection.includes(person.id));let preparation:any={};try{preparation=JSON.parse(localStorage.getItem('noza-meeting-preparation')||'{}')}catch{}const invite={meetingId:preparation.id||'meeting-'+Date.now(),date:preparation.date||'',time:preparation.time||'',subject:preparation.subject||preparation.goal||'Reunião NOZA',participants:selected.map(person=>({id:person.id,name:person.name,image:person.image})),status:'pending',sharedFields:['date','time','subject','participants']};try{const queue=JSON.parse(localStorage.getItem('noza-meeting-invites')||'[]');localStorage.setItem('noza-meeting-invites',JSON.stringify([invite,...queue].slice(0,50)));localStorage.setItem('noza-last-meeting-invite',JSON.stringify(invite))}catch{}setMediaError(`Convite preparado para ${selected.length} participante(s): data, horário, assunto e participantes.`);setContactsOpen(false)};
  const deleteCurrentSlide=()=>{if(!currentSlide)return;const id=currentSlide.id;const next=slides.filter(item=>item.id!==id);setSlides(next);setSlide(index=>Math.max(0,Math.min(index,next.length-1)));setSlideVisibleToParticipants(false);try{const imported=readStored<Slide[]>(SPACE_IMPORTED_SLIDES_KEY,[]).filter(item=>item.id!==id);localStorage.setItem(SPACE_IMPORTED_SLIDES_KEY,JSON.stringify(imported));const creator=readStored<Slide[]>(CREATOR_SLIDES_KEY,[]).filter(item=>item.id!==id);localStorage.setItem(CREATOR_SLIDES_KEY,JSON.stringify(creator))}catch{}if(next.length===0)setSlideViewerOpen(false)};
  const pressCalc=(value:string)=>{if(value==='C'){setCalcExpression('');setCalcResult('0');return}if(value==='⌫'){setCalcExpression(text=>text.slice(0,-1));return}if(value==='='){try{const safe=calcExpression.replace(/×/g,'*').replace(/÷/g,'/').replace(/,/g,'.');if(!/^[0-9+\-*/().% ]+$/.test(safe))throw new Error();const result=Function('"use strict";return ('+safe+')')();setCalcResult(Number.isFinite(result)?String(result).replace('.',','):'0')}catch{setCalcResult('Erro')}return}setCalcExpression(text=>text+value)};
  const scheduleContacts=()=>{const names=participants.filter(person=>contactSelection.includes(person.id)).map(person=>person.name).join(', ');setAgendaTitle(names?`Reunião com ${names}`:'Próxima reunião');setAgendaForm(true);setContactsOpen(false);setTimeout(()=>document.querySelector<HTMLInputElement>('.space-agenda-form input[type="time"]')?.focus(),0)};

  useEffect(()=>{
    setMessages(readStored(MESSAGES_KEY,initialMessages));
    setAgenda(readStored(AGENDA_KEY,initialAgenda));
    setNotes(readStored(NOTES_KEY,initialNotes));
    const creator=readStored<Slide[]>(CREATOR_SLIDES_KEY,[]);
    const imported=readStored<Slide[]>(SPACE_IMPORTED_SLIDES_KEY,[]);
    setSlides(mergeSlides(mergeSlides(initialSlides,creator) as Slide[],imported) as Slide[]);
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
  const currentSlide=slides[slide]||null;
  const slideOverlay=currentSlide?getSlideOverlay(currentSlide) as {title:string;copy?:string;sourceLabel:string}|null:null;
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
    try{const fresh=await navigator.mediaDevices.getUserMedia(isCamera?{video:{width:{ideal:720},height:{ideal:1280},aspectRatio:{ideal:9/16},facingMode:'user'},audio:false}:{video:false,audio:true});const combined=new MediaStream([...(streamRef.current?.getTracks().filter(track=>track.readyState==='live')||[]),...fresh.getTracks()]);attachStream(combined);isCamera?setCameraOn(true):setMicOn(true)}catch{setMediaError(`Permissão de ${isCamera?'câmera':'microfone'} não concedida.`)}
  };
  const toggleTranscription=()=>{const SpeechRecognition=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;if(!SpeechRecognition){setMediaError('Transcrição em tempo real não é suportada neste navegador.');return}if(transcribing){recognitionRef.current?.stop();setTranscribing(false);return}const recognition=new SpeechRecognition();recognition.lang='pt-BR';recognition.continuous=true;recognition.interimResults=true;recognition.onresult=(event:any)=>{let finalText='';let interim='';for(let i=event.resultIndex;i<event.results.length;i++){const text=event.results[i][0].transcript;if(event.results[i].isFinal)finalText+=text+' ';else interim+=text}if(finalText)setTranscript(value=>(value+' '+finalText).trim());if(interim)setMediaError('Transcrevendo: '+interim.slice(-80))};recognition.onerror=()=>{setTranscribing(false);setMediaError('A transcrição foi interrompida. Verifique a permissão do microfone.')};recognition.onend=()=>setTranscribing(false);recognition.start();recognitionRef.current=recognition;setTranscribing(true);setMediaError('Transcrição e análise de performance iniciadas.')};
  const finishMeeting=()=>{recognitionRef.current?.stop();setTranscribing(false);const preparation=readStored<any>('noza-meeting-preparation',{});const words=transcript.trim()?transcript.trim().split(/\s+/).length:0;const questions=(transcript.match(/\?/g)||[]).length;const report={endedAt:new Date().toISOString(),preparation,transcript,signals:{words,questions},summary:transcript?'Transcrição registrada para análise de padrões, comunicação e Skills da reunião.':'Reunião finalizada sem transcrição disponível.'};try{localStorage.setItem('noza-last-meeting-report',JSON.stringify(report));const history=readStored<any[]>('noza-meeting-performance-history',[]);localStorage.setItem('noza-meeting-performance-history',JSON.stringify([...history,report].slice(-30)))}catch{}setExitOpen(false);router.push('/skills')};
  const shareSpace=async()=>{setShared(false);try{if(navigator.share)await navigator.share({title:'NOZA Space',text:'Entre no meu Space da NOZA',url:location.href});else await navigator.clipboard.writeText(location.href);setShared(true);setTimeout(()=>setShared(false),2200)}catch{setMediaError('Não foi possível compartilhar o link agora.')}};
  const importSlides=(event:ChangeEvent<HTMLInputElement>)=>{const files=[...(event.target.files||[])];Promise.all(files.map((file,index)=>new Promise<Slide|null>(resolve=>{if(!file.type.startsWith('image/')){resolve(null);return}const reader=new FileReader();reader.onload=()=>resolve(createLocalSlide(file,String(reader.result),Date.now()+index) as Slide|null);reader.onerror=()=>resolve(null);reader.readAsDataURL(file)}))).then(importedRaw=>{const imported=importedRaw.filter(Boolean) as Slide[];if(imported.length){setSlides(items=>{const next=mergeSlides(items,imported) as Slide[];setSlide(Math.max(0,next.length-imported.length));return next});try{const saved=readStored<Slide[]>(SPACE_IMPORTED_SLIDES_KEY,[]);localStorage.setItem(SPACE_IMPORTED_SLIDES_KEY,JSON.stringify(mergeSlides(saved,imported)))}catch{setMediaError('As imagens abriram, mas o navegador não permitiu salvá-las localmente.');return}setMediaError(`${imported.length} ${imported.length===1?'imagem salva':'imagens salvas'} no Space.`)}else if(files.length)setMediaError('Use arquivos de imagem.');event.target.value=''})};
  const copyCurrentSlide=async()=>{try{await navigator.clipboard.writeText([currentSlide.title,currentSlide.copy].filter(Boolean).join('\n'));setMediaError('Conteúdo do slide copiado.')}catch{setMediaError('Não foi possível copiar este slide.')}};
  const saveCurrentSlide=()=>{if(!currentSlide)return;let url=currentSlide.url;let revoke=false;if(currentSlide.kind==='insight'){url=URL.createObjectURL(new Blob([[currentSlide.title,currentSlide.copy].filter(Boolean).join('\n\n')],{type:'text/plain'}));revoke=true}const anchor=document.createElement('a');anchor.href=url;anchor.download=`${currentSlide.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.${currentSlide.kind==='pdf'?'pdf':currentSlide.kind==='image'?'png':'txt'}`;anchor.click();if(revoke)setTimeout(()=>URL.revokeObjectURL(url),0);setMediaError('Slide salvo no computador.')};

  return <main className="app-shell space-page">
    <AppSidebar/>
    <section className="content space-content">
      <header className="space-icon-topbar" aria-label="NOZA Space"><button className="notification-button" onClick={()=>setMediaError('Nenhuma nova notificação.')} aria-label="Notificações"><Bell/></button></header>
      <div className={`space-workspace ${supportCardsCollapsed?'support-cards-collapsed ':''}${collapsed.slides?'slides-collapsed ':''}${collapsed.agenda?'agenda-collapsed ':''}${collapsed.notes?'notes-collapsed':''}`}>
        <button className="space-support-toggle" onClick={toggleSupportCards} aria-label={supportCardsCollapsed?'Expandir cards auxiliares':'Encolher cards auxiliares'}>{supportCardsCollapsed?<><ChevronDown/><span>Expandir painéis</span></>:<><ChevronUp/><span>Encolher painéis</span></>}</button>
        <section className="space-live-card" aria-label="Reunião ao vivo">
          <div className="space-host"><span className="space-live-dot"/><strong>Sandro</strong><time>00:24</time><button aria-label="Mais opções da reunião" aria-expanded={meetingMenuOpen} onClick={()=>setMeetingMenuOpen(value=>!value)}><Ellipsis/></button>{meetingMenuOpen&&<div className="space-host-menu"><button onClick={()=>setChatOpen(value=>!value)}>{chatOpen?'Ocultar':'Mostrar'} chat</button><button onClick={()=>setMediaError('Qualidade automática ativada.')}>Qualidade automática</button></div>}</div>
          <div className="space-host-media"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1100&q=88" alt="Sandro na reunião"/><video ref={videoRef} autoPlay muted playsInline className={cameraOn?'is-visible':''} style={{filter:videoFilter==='contrast'?'contrast(1.15) saturate(.9)':videoFilter==='soft'?'brightness(1.06) contrast(.92)':videoFilter==='mono'?'grayscale(1) contrast(1.05)':'none'}}/><div className="space-reactions"><button onClick={()=>setReactionCounts(value=>({...value,likes:value.likes+1}))} aria-label="Curtir reunião"><Heart fill="currentColor"/>{reactionCounts.likes}</button><button onClick={()=>setChatOpen(true)} aria-label="Abrir chat"><MessageCircle/>{reactionCounts.messages}</button><button onClick={()=>{setReactionCounts(value=>({...value,shares:value.shares+1}));shareSpace()}} aria-label="Compartilhar reunião"><Send/>{reactionCounts.shares}</button></div></div>
          {chatOpen&&<div className="space-chat-panel"><div className="space-chat-list">{messages.slice(-4).map(item=><div className={item.mine?'mine':''} key={item.id}><b>{item.author}</b><time>{item.time}</time><p>{item.body}</p></div>)}</div><form onSubmit={submitMessage}><input value={message} onChange={e=>setMessage(e.target.value)} aria-label="Mensagem" placeholder="Enviar uma mensagem..."/><Smile/><button aria-label="Enviar mensagem"><Send/></button></form></div>}
        </section>

        <section className={`space-participants-panel space-glass ${participantView.mode==='focus'?'is-focused':''}`} aria-label="Participantes">
          <header><div>{participantView.participant&&<button className="space-participant-back" onClick={()=>setSelectedParticipantId(null)} aria-label="Voltar ao mosaico"><ChevronLeft/></button>}<strong>{participantView.participant?.name||'Participantes'}</strong>{!participantView.participant&&<span>{visibleParticipants.length}</span>}</div>{!participantView.participant&&<div className="space-view-switch"><button className={layout==='mosaic'?'active':''} onClick={()=>setLayout('mosaic')} aria-label="Visualização em mosaico" aria-pressed={layout==='mosaic'}><Grid2X2/>Mosaico</button><button className={layout==='list'?'active':''} onClick={()=>setLayout('list')} aria-label="Visualização em lista" aria-pressed={layout==='list'}><LayoutList/></button></div>}</header>
          {participantView.participant?<div className="space-participant-stage" aria-label={`Câmera ampliada de ${participantView.participant.name}`}><img src={participantView.participant.image} alt=""/><div className="space-participant-stage-gradient"/><div className="space-participant-stage-copy"><small>{participantView.participant.activity}</small><strong>{participantView.participant.name}</strong><span>{participantView.participant.muted?<><MicOff/>Microfone silenciado</>:<><Mic/>Participando agora</>}</span></div></div>:<div className={`space-participants ${layout}`}>{visibleParticipants.map(person=><button className="space-participant-card" key={person.id} onClick={()=>setSelectedParticipantId(person.id)} aria-label={`Expandir câmera de ${person.name}`}><img src={person.image} alt=""/><div><small>{person.activity}</small><strong>{person.name}</strong></div><span className={person.muted?'muted':'active'}>{person.muted?<MicOff/>:<Mic/>}</span><Maximize2 className="space-participant-expand"/></button>)}</div>}
        </section>

        <section className={`space-evolution space-glass ${collapsed.slides?'is-collapsed ':''}${currentSlide?.tone||'file'}`} aria-label="Slides da reunião"><input ref={slideFileRef} className="space-slide-input" type="file" accept="image/*,application/pdf,.pdf" multiple onChange={importSlides}/>{currentSlide?<>{currentSlide.kind==='image'&&<img className="space-slide-media" src={currentSlide.url} alt="Slide aberto do computador"/>}<div className="space-evolution-copy file-copy"><div className="space-slide-actions"><button onClick={()=>slideFileRef.current?.click()} aria-label="Adicionar apresentação"><FileUp/></button><button onClick={saveCurrentSlide} aria-label="Salvar slide no computador"><Download/></button><button onClick={()=>setSlideViewerOpen(true)} aria-label="Visualizar slide em tela grande"><Maximize2/></button><button className="space-slide-delete" onClick={deleteCurrentSlide} aria-label="Excluir imagem"><Trash2/></button></div><div className="space-dots">{slides.map((item,index)=><button key={item.id} className={index===slide?'active':''} onClick={()=>setSlide(index)} aria-label={`Slide ${index+1}: ${item.title}`}/>)}</div></div><button className="space-previous-slide" onClick={()=>setSlide(index=>previousSlideIndex(index,slides.length))} aria-label="Slide anterior"><ChevronLeft/></button><button className="space-next-slide" onClick={()=>setSlide(index=>(index+1)%slides.length)} aria-label="Próximo slide"><ChevronRight/></button></>:<button className="space-slide-empty" onClick={()=>slideFileRef.current?.click()}><FileUp/><span>Suba aqui seu PDF de apresentação ou as fotos</span></button>}</section>
        {slideViewerOpen&&currentSlide&&<div className="space-slide-viewer-layer" role="dialog" aria-modal="true" aria-label="Apresentação de slides"><div className="space-slide-viewer"><header><div><strong>Apresentação</strong><small>{slideVisibleToParticipants?'Visível aos participantes':'Somente você está vendo'}</small></div><div className="space-slide-viewer-actions"><button className="space-slide-viewer-delete" onClick={deleteCurrentSlide} aria-label="Excluir imagem"><Trash2/><span>Excluir</span></button><button className={slideVisibleToParticipants?'is-live':''} onClick={()=>setSlideVisibleToParticipants(value=>!value)}>{slideVisibleToParticipants?'Ocultar dos participantes':'Mostrar aos participantes'}</button><button onClick={()=>setSlideViewerOpen(false)} aria-label="Fechar apresentação">×</button></div></header><div className="space-slide-viewer-stage">{currentSlide.kind==='image'?<img src={currentSlide.url} alt={currentSlide.title}/>:<div className="space-slide-viewer-insight"><h2>{currentSlide.title}</h2>{currentSlide.copy&&<p>{currentSlide.copy}</p>}</div>}</div><div className="space-slide-viewer-strip"><button className="space-slide-viewer-upload" onClick={()=>slideFileRef.current?.click()}><FileUp/><span>Escolher foto</span></button>{slides.filter(item=>item.kind==='image').map(item=>{const index=slides.findIndex(candidate=>candidate.id===item.id);return <button key={item.id} className={index===slide?'active':''} onClick={()=>setSlide(index)} aria-label={'Selecionar '+item.title}><img src={item.url} alt=""/></button>})}</div></div></div>}
        <div className="space-meeting-skills-below-slides"><button className="space-meeting-skills-btn" onClick={()=>setMeetingSkillsOpen(value=>!value)}><BrainCircuit/><span>Skills da reunião</span><ChevronDown/></button></div>{meetingSkillsOpen&&<section className="space-meeting-skills-embedded"><iframe src="/skills-pro?embedded=1" title="Skills Pro da reunião"/></section>}

        <section className={`space-agenda space-glass ${collapsed.agenda?'is-collapsed':''}`} aria-label="Agenda do Space"><header><div><CalendarDays/><span><strong>Agenda</strong><small>Suas próximas reuniões</small></span></div><button onClick={()=>setAgendaForm(value=>!value)} aria-label="Adicionar à agenda"><Plus/></button></header>{agendaForm&&<form onSubmit={submitAgenda} className="space-agenda-form"><input aria-label="Horário da reunião" type="time" value={agendaTime} onChange={e=>setAgendaTime(e.target.value)}/><input aria-label="Nome da reunião" autoFocus value={agendaTitle} onChange={e=>setAgendaTitle(e.target.value)} placeholder="Nome da reunião"/><button aria-label="Salvar reunião"><Check/></button></form>}<div className="space-agenda-list">{agenda.map(item=><div className={'space-agenda-entry '+(item.done?'done':'')} key={item.id}><button className="space-agenda-main" onClick={()=>setAgenda(items=>toggleAgendaItem(items,item.id))}><time>{item.time}</time><span>{item.title}</span>{item.done?<Check/>:<ChevronRight/>}</button><button className="space-agenda-enter" onClick={()=>{try{localStorage.setItem('noza-space-active-meeting',JSON.stringify(item))}catch{};setMediaError('Entrando em '+item.title+'...')}}>Entrar</button></div>)}</div></section>

        <section className={`space-notes space-glass ${collapsed.notes?'is-collapsed':''}`} aria-label="Anotações do Space"><header><div><NotebookPen/><span><strong>Anotações</strong><small>Ideias, insights e decisões</small></span></div><button className="space-notes-library-link" onClick={()=>setNotesMode('library')}>Ver anotações</button><button onClick={()=>noteTitleRef.current?.focus()} aria-label="Nova anotação"><Plus/></button></header><form onSubmit={saveNote} className="space-note-form"><input ref={noteTitleRef} value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Título da anotação" aria-label="Título da anotação"/><textarea value={noteBody} onChange={e=>setNoteBody(e.target.value)} placeholder="Escreva uma decisão ou insight..." aria-label="Conteúdo da anotação"/><button><Save/>{noteId?'Atualizar':'Salvar'}</button></form><div className="space-note-list">{notes.slice(0,4).map(note=><article key={note.id}><button onClick={()=>editNote(note)}><StickyNote/><span><strong>{note.subject}</strong><small>{new Date(note.updated_at).toLocaleString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></span></button><button onClick={()=>removeNote(note.id)} aria-label={`Excluir ${note.subject}`}><X/></button></article>)}</div></section>
      </div>

      <nav className={`space-controls ${controlsCollapsed?'is-collapsed':''}`} aria-label="Controles da reunião">
        <button className="space-controls-collapse" onClick={()=>setControlsCollapsed(value=>!value)} aria-label={controlsCollapsed?'Expandir controles':'Encolher controles'}>{controlsCollapsed?<ChevronUp/>:<ChevronDown/>}</button>
        <button className={micOn?'active':''} onClick={()=>toggleDevice('microphone')} aria-pressed={micOn}>{micOn?<Mic/>:<MicOff/>}<span>Microfone</span></button>
        <button className={cameraOn?'active':''} onClick={()=>toggleDevice('camera')} aria-pressed={cameraOn}>{cameraOn?<Camera/>:<CameraOff/>}<span>Câmera</span></button>
        <button className={chatOpen?'active':''} onClick={()=>setChatOpen(value=>!value)} aria-pressed={chatOpen}><MessageCircle/><span>Chat</span></button>
        <button onClick={()=>setNotesMode('editor')}><NotebookPen/><span>Anotar</span></button>
        <button onClick={()=>setLayout(value=>value==='mosaic'?'list':'mosaic')}><Users/><span>Participantes</span></button>
        <button className={transcribing?'active':''} onClick={toggleTranscription}><StickyNote/><span>{transcribing?'Transcrevendo':'Transcrever'}</span></button>
        <div className="space-control-menu"><button onClick={()=>setFilterOpen(value=>!value)} aria-expanded={filterOpen}><Filter/><span>Filtros</span></button>{filterOpen&&<div>{(['none','contrast','soft','mono'] as const).map(value=><button key={value} className={videoFilter===value?'active':''} onClick={()=>{setVideoFilter(value);setFilterOpen(false)}}>{value==='none'?'Sem filtro':value==='contrast'?'Definição':value==='soft'?'Suave':'P&B'}</button>)}</div>}</div>
        <button onClick={shareSpace}><MonitorUp/><span>{shared?'Link copiado':'Compartilhar'}</span></button>
        <div className="space-control-menu space-contacts-control"><button className={contactsOpen?'active':''} onClick={()=>setContactsOpen(value=>!value)} aria-expanded={contactsOpen}><ContactRound/><span>Contatos</span></button>{contactsOpen&&<div className="space-contacts-popover"><header><strong>Adicionar à reunião</strong><small>Deslize para escolher</small></header><div className="space-contact-strip">{participants.map(person=><button key={person.id} className={contactSelection.includes(person.id)?'selected':''} onClick={()=>toggleContact(person.id)}><span><img src={person.image} alt=""/>{contactSelection.includes(person.id)&&<Check/>}</span><small>{person.name.split(' ')[0]}</small></button>)}</div><footer><button onClick={addContactsNow}><Users/>Adicionar agora</button><button onClick={scheduleContacts}><CalendarDays/>Agendar próxima</button></footer></div>}</div>
        <button onClick={()=>router.push('/gravacoes')}><VideoIcon/><span>Gravações</span></button>
        <button onClick={()=>setCalculatorOpen(true)}><Calculator/><span>Calculadora</span></button>
        <button onClick={()=>router.push('/slides')}><Presentation/><span>Criar slides</span></button>
        <div className="space-control-menu"><button onClick={()=>setMoreOpen(value=>!value)} aria-expanded={moreOpen}><Ellipsis/><span>Mais</span></button>{moreOpen&&<div><button onClick={()=>setChatOpen(value=>!value)}><PanelBottomClose/>{chatOpen?'Ocultar chat':'Mostrar chat'}</button><button onClick={()=>setMediaError('Preferências da reunião atualizadas.')}><SlidersHorizontal/>Preferências</button></div>}</div>
        <button className="space-leave" onClick={()=>setExitOpen(true)}><Share2/><span>Sair</span></button>
      </nav>
      {calculatorOpen&&<div className="space-calculator-layer" onMouseDown={event=>{if(event.target===event.currentTarget)setCalculatorOpen(false)}}><section className="space-calculator" role="dialog" aria-modal="true" aria-label="Calculadora"><header><div><Calculator/><span><strong>Calculadora</strong><small>NOZA SPACE</small></span></div><button onClick={()=>setCalculatorOpen(false)} aria-label="Fechar calculadora"><X/></button></header><div className="space-calculator-display"><small>{calcExpression||'0'}</small><strong>{calcResult}</strong></div><div className="space-calculator-grid">{['C','(',')','÷','7','8','9','×','4','5','6','-','1','2','3','+','0',',','⌫','='].map(key=><button key={key} className={key==='='?'equals':/[÷×+\-]/.test(key)?'operator':''} onClick={()=>pressCalc(key)}>{key}</button>)}</div></section></div>}
      <FloatingNotes mode={notesMode} onClose={()=>setNotesMode(null)}/>
      {mediaError&&<div className="space-toast" role="status"><Bell/>{mediaError}<button onClick={()=>setMediaError('')} aria-label="Fechar aviso"><X/></button></div>}
      {exitOpen&&<div className="space-dialog-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setExitOpen(false)}}><div className="space-dialog" role="dialog" aria-modal="true" aria-labelledby="space-exit-title"><button className="space-dialog-close" onClick={()=>setExitOpen(false)} aria-label="Fechar"><X/></button><h2 id="space-exit-title">Sair do Space?</h2><p>A câmera e o microfone serão desligados. Suas mensagens, agenda e anotações permanecerão salvas.</p><div><button onClick={()=>setExitOpen(false)}>Continuar na reunião</button><button className="danger" onClick={finishMeeting}>Finalizar e gerar relatório</button></div></div></div>}
    {(transcribing||transcript)&&<aside className="space-live-transcript"><header><span className={transcribing?'live':''}/><strong>TRANSCRIÇÃO + ANÁLISE</strong><small>{transcribing?'AO VIVO':'REGISTRADA'}</small></header><p>{transcript||'Aguardando fala para iniciar a leitura da reunião...'}</p><footer>A NOZA usa esta transcrição como evidência para o relatório de performance ao finalizar.</footer></aside>}
    </section>
  </main>;
}
