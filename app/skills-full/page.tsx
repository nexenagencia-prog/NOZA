'use client';
import {useEffect,useState} from 'react';
import Brain3D from './Brain3D';
import AppSidebar from '../AppSidebar';
import {BrainCircuit,ChevronRight,Search,Target,Database,Layers3,Stars,HeartPulse,MessageCircleMore,Telescope,UsersRound,Zap,Activity,ScanLine,ChartNoAxesColumnIncreasing,Volume2,VolumeX} from 'lucide-react';
import './skills-full.css';
import {getPerformanceProfile,resetLegacyPerformanceCacheOnce} from '../../lib/performance/core';

const icons:any={foco:Target,memoria:Database,disciplina:Layers3,criatividade:Stars,emocional:HeartPulse,comunicacao:MessageCircleMore,visao:Telescope,lideranca:UsersRound,produtividade:Zap};
const skills=[
{id:'foco',name:'Foco',tag:'Atenção profunda',region:'Córtex Pré-Frontal',desc:'Planejamento, foco e tomada de decisão',color:'#ff5a00'},
{id:'memoria',name:'Memória',tag:'Retenção e recall',region:'Hipocampo',desc:'Memória e aprendizado',color:'#ff5a00'},
{id:'disciplina',name:'Disciplina',tag:'Constância e hábitos',region:'Córtex Pré-Frontal',desc:'Controle executivo e decisão',color:'#ff5a00'},
{id:'criatividade',name:'Criatividade',tag:'Novas conexões',region:'Rede Associativa',desc:'Associação e novas conexões',color:'#ff5a00'},
{id:'emocional',name:'Inteligência Emocional',tag:'Autocontrole',region:'Sistema Límbico',desc:'Emoções e motivação',color:'#ff5a00'},
{id:'comunicacao',name:'Comunicação',tag:'Clareza e influência',region:'Córtex Temporal',desc:'Linguagem e compreensão',color:'#ff5a00'},
{id:'visao',name:'Visão de Futuro',tag:'Planejamento estratégico',region:'Córtex Pré-Frontal',desc:'Simulação e planejamento',color:'#ff5a00'},
{id:'lideranca',name:'Liderança',tag:'Pessoas e projetos',region:'Rede Executiva',desc:'Decisão social e direção',color:'#ff5a00'},
{id:'produtividade',name:'Produtividade',tag:'Resultados consistentes',region:'Rede de Atenção',desc:'Prioridade e execução',color:'#ff5a00'},
];

export default function Page(){
 const [profileAvatar,setProfileAvatar]=useState('');
 const [profileName,setProfileName]=useState('Sandro');
 const [performanceScore,setPerformanceScore]=useState(0);
 const [evidenceCount,setEvidenceCount]=useState(0);
 const [voiceOn,setVoiceOn]=useState(false);
 const [speaking,setSpeaking]=useState(false);
 useEffect(()=>{
   const readAvatar=()=>{
     try{setProfileAvatar(localStorage.getItem('zyvo-profile-avatar')||'');setProfileName((localStorage.getItem('noza-profile-name')||'Sandro').trim().split(/\s+/)[0]||'Sandro')}catch{setProfileAvatar('');setProfileName('Sandro')}
   };
   readAvatar();
   window.addEventListener('storage',readAvatar);
   window.addEventListener('focus',readAvatar);
   return()=>{window.removeEventListener('storage',readAvatar);window.removeEventListener('focus',readAvatar)}
 },[]);
 useEffect(()=>{resetLegacyPerformanceCacheOnce();void getPerformanceProfile().then(profile=>{const scores=profile.skills.map((item:any)=>Number(item.score||0)).filter((score:number)=>score>0);setEvidenceCount(profile.events.length);setPerformanceScore(scores.length?Math.round(scores.reduce((sum:number,score:number)=>sum+score,0)/scores.length*10)/10:0)}).catch(()=>{setEvidenceCount(0);setPerformanceScore(0)})},[]);

 const speak=(text:string)=>{
   if(typeof window==='undefined'||!('speechSynthesis' in window))return;
   window.speechSynthesis.cancel();
   const utterance=new SpeechSynthesisUtterance(text);
   utterance.lang='pt-BR';utterance.rate=.92;utterance.pitch=.92;utterance.volume=1;
   const voices=window.speechSynthesis.getVoices();
   const pt=voices.filter(v=>/^pt(-|_)/i.test(v.lang));
   const preferred=pt.find(v=>/Daniel|Luciana|Felipe|premium|natural/i.test(v.name))||pt[0]||voices[0];
   if(preferred)utterance.voice=preferred;
   utterance.onstart=()=>setSpeaking(true);utterance.onend=()=>setSpeaking(false);utterance.onerror=()=>setSpeaking(false);
   window.speechSynthesis.speak(utterance);
 };
 const toggleVoice=()=>{
   const next=!voiceOn;setVoiceOn(next);
   try{localStorage.setItem('noza-performance-voice',next?'on':'off')}catch{}
   if(!next&&typeof window!=='undefined'&&'speechSynthesis' in window){window.speechSynthesis.cancel();setSpeaking(false);return}
   if(next)speak(performanceScore>0?'Bom dia, '+profileName+'. Seu índice de performance atual é '+performanceScore+'.':'Bom dia, '+profileName+'. Sua performance está zerada porque ainda não há evidências de reuniões ou calibragem.');
 };
 useEffect(()=>{try{setVoiceOn(localStorage.getItem('noza-performance-voice')==='on')}catch{};return()=>{if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel()}},[]);

 const[active,setActive]=useState(skills[0]);
 const insight={impact:'0',lead:'Ainda não há evidências desta skill.',read:'O score começa em zero e permanece assim até uma reunião analisada ou uma calibragem registrada.',change:'Participe de uma reunião ou conclua a calibragem para começar a formar um perfil baseado em dados reais.',path:'Sem evidências → reunião ou calibragem → primeira leitura.'};
 return <main className="sp-shell"><AppSidebar/><div className="sp-page">
  <header className="sp-header">
   <div><div className="sci-class">NOZA / HUMAN PERFORMANCE / MY PERFORMANCE</div><h1>My Performance</h1><p>Leitura comportamental aplicada à evolução de performance.</p></div>
   <label><Search/><input placeholder="Buscar habilidade"/><kbd>⌘ K</kbd></label>
   <div className="sp-header-actions"><button className={"sp-voice "+(voiceOn?"on":"")} onClick={toggleVoice} aria-pressed={voiceOn}>{voiceOn?<Volume2/>:<VolumeX/>}<span>{speaking?"FALANDO...":voiceOn?"VOICE ON":"VOICE OFF"}</span></button><div className="sp-status"><Activity/><span>AGUARDANDO DADOS</span><b>{evidenceCount}</b></div></div>
  </header>
  <div className="sp-grid">
   <nav className="sp-skills">{skills.map((s)=>{const Icon=icons[s.id];return <button key={s.id} className={active.id===s.id?'active':''} onClick={()=>setActive(s)}>
    <span className="sp-icon"><Icon/></span><span className="sp-skillcopy"><b>{s.name}</b><small>{s.tag}</small></span><span className="sp-skillstate">{active.id===s.id?'ACTIVE':'VIEW'}</span>
   </button>})}</nav>
   <section className="sp-brain">
    <Brain3D active={active.id} color={active.color}/>
    <div className="sci-hud" aria-hidden="true">
      <span className="sci-corner tl">NOZA // COGNITIVE MAP</span><span className="sci-corner tr">AGUARDANDO EVIDÊNCIAS</span>
      <div className="sci-axis axis-x"/><div className="sci-axis axis-y"/><div className="sci-reticle"><ScanLine/></div>
      <div className="sci-meter meter-a"><small>NEURAL SIGNAL</small><b>0.000</b><em><i style={{width:'0%'}}/></em></div>
      <div className="sci-meter meter-b"><small>BEHAVIOR INDEX</small><b>0.0</b><em><i style={{width:'0%'}}/></em></div>
      <div className="sci-coord">PERFORMANCE INDEX · {performanceScore.toFixed(1)}</div>
      
    </div>
    <div className="sp-label l1"><b>{active.region}</b><span>{active.desc}</span></div>
    <div className="sp-label l2"><b>Sistema Límbico</b><span>Emoções e motivação</span></div>
    <div className="sp-label l3"><b>Cerebelo</b><span>Coordenação e aprendizado</span></div>
    <div className="sp-view">ARRASTE PARA EXPLORAR / 360°</div>
    <div className="sp-switch"><button className="selected">Visão lateral</button><button>Visão frontal</button><button>Visão superior</button></div>
   </section>
   <aside className="sp-panel sp-panel-intelligence">
    <div className="panel-head"><span className="sp-pill">SKILL EM DESTAQUE</span><span>NOZA INTELLIGENCE</span><b>•••</b></div>
    <h2>{active.name}</h2>{voiceOn&&<button className="sp-listen" onClick={()=>speak(active.name+". "+insight.lead+" "+insight.change)}><Volume2/> OUVIR ANÁLISE</button>}<p className="sp-sub">{active.tag}</p>
    <div className="sp-impact"><span>Score desta skill</span><b>0</b></div>
    <section className="intel-block intel-primary"><span className="intel-label">STATUS DA SKILL</span><p>{insight.lead} Seu score atual é 0.</p></section>
    <section className="intel-block"><span className="intel-label">COMO O SCORE É FORMADO</span><p>{insight.read}</p></section>
    <section className="intel-block intel-change"><span className="intel-label">PRÓXIMO PASSO</span><p>{insight.change}</p></section>
    <div className="intel-path"><BrainCircuit/><div><span>INÍCIO DA EVOLUÇÃO</span><b>{insight.path}</b></div></div>
    <button className="sp-cta sp-cta-scientific">INICIAR TREINAMENTO <ChevronRight/></button>
    <div className="sp-science"><BrainCircuit/><div><b>Base de referência</b><p>Sinais observáveis das reuniões. A visualização cerebral é educativa e não representa diagnóstico neurológico.</p></div></div>
   </aside>
  </div>
  <footer><div className="foot-stat"><div className="foot-profile">{profileAvatar?<img src={profileAvatar} alt="Foto do perfil"/>:<span/>}</div><ChartNoAxesColumnIncreasing/><span>PERFORMANCE INDEX</span><b>{performanceScore.toFixed(1)}</b></div><div className="foot-bars">{Array.from({length:34},(_,i)=><i key={i} style={{height:`${performanceScore?Math.max(2,Math.round(performanceScore/100*34)):0}px`}}/> )}</div><p>{evidenceCount?`Dados de ${evidenceCount} evidência(s) registradas.`:'Índice em zero até a primeira reunião analisada ou calibragem.'}<small>NOZA INTELLIGENCE / AGUARDANDO DADOS</small></p></footer>
 </div></main>
}