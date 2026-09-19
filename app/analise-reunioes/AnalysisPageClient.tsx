'use client';

import {useEffect,useMemo,useState} from 'react';
import type {CSSProperties} from 'react';
import {useRouter} from 'next/navigation';
import {CalendarDays,ChevronLeft,ChevronRight,CircleHelp,Headphones,Maximize2,MessageCircle,Mic2,Play,Sparkles,Target,Users} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import AppTopbar from '../AppTopbar';
import {analysisThemeClass,analysisThemeVars} from '../analysis-theme.mjs';
import './analysis.css';
import '../analysis-theme.css';

type Recording={id:string;title:string;phrase?:string;thumbnail?:string;performance?:number;src?:string};
type Metric={label:string;value:number;copy:string;Icon:typeof MessageCircle};

const SELECTED_KEY='zyvo-selected-analysis';
const RECORDINGS_KEY='zyvo-recordings';
const labels=[
  ['Comunicação','Impacto da mensagem, reação e mudança de atenção.',MessageCircle],
  ['Clareza','Onde sua ideia foi entendida — e onde exigiu reconstrução.',Mic2],
  ['Escuta','Quanto sua resposta realmente usou o que o outro revelou.',Headphones],
  ['Objetividade','Momentos em que você continuou após o ponto já estar claro.',Target],
  ['Perguntas','Perguntas que revelaram motivação, risco, urgência e decisão.',CircleHelp],
  ['Argumentação','Se seus argumentos responderam à motivação real do outro.',MessageCircle],
  ['Condução','Janelas de decisão abertas, aproveitadas ou perdidas.',Users],
] as const;

const participantPhotos=[
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=85',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=85',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=85',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=85',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=80&q=85',
];

function clamp(value:number,min=55,max=98){return Math.max(min,Math.min(max,value))}
function seedFrom(recording:Recording){return [...String(recording.id||recording.title||'zyvo')].reduce((sum,char)=>sum+char.charCodeAt(0),0)}
function buildMetrics(recording:Recording):Metric[]{
  const seed=seedFrom(recording);
  const stars=clamp(Number(recording.performance||4),1,5);
  const base=66+stars*5;
  const offsets=[6,9,2,-5,7,0,4];
  return labels.map(([label,copy,Icon],index)=>({label,copy,Icon,value:clamp(base+offsets[index]+((seed*(index+3))%9)-4)}));
}
function readRecordings():Recording[]{
  try{
    const raw=window.localStorage.getItem(RECORDINGS_KEY);
    if(!raw)return[];
    const parsed=JSON.parse(raw);
    return (Array.isArray(parsed)?parsed:Array.isArray(parsed?.recordings)?parsed.recordings:[]).filter(Boolean);
  }catch{return[]}
}
function readSelected():Recording|null{
  try{
    const params=new URLSearchParams(window.location.search);
    const id=params.get('analysis');
    const saved=window.localStorage.getItem(SELECTED_KEY);
    if(saved){
      const parsed=JSON.parse(saved) as Recording;
      if(!id||parsed.id===id)return parsed;
    }
    return readRecordings().find(item=>item.id===id)??null;
  }catch{return null}
}

export default function AnalysisPageClient(){
  const router=useRouter();
  const [recording,setRecording]=useState<Recording|null>(null);
  const [recordings,setRecordings]=useState<Recording[]>([]);

  useEffect(()=>{
    const list=readRecordings();
    setRecordings(list);
    setRecording(readSelected()??list[0]??{id:'default',title:'Reunião de planejamento',phrase:'Estratégia, proposta e próximos passos.',thumbnail:'/skills-card.png',performance:4});
  },[]);

  const metrics=useMemo(()=>buildMetrics(recording??{id:'default',title:'Reunião de planejamento',performance:4}),[recording]);
  const score=Math.round(metrics.reduce((sum,item)=>sum+item.value,0)/metrics.length);
  const sorted=[...metrics].sort((a,b)=>b.value-a.value);
  const strongest=sorted[0];
  const weakest=sorted.at(-1)!;
  const currentIndex=recording?recordings.findIndex(item=>item.id===recording.id):-1;
  const canNavigate=recordings.length>1&&currentIndex>=0;
  const selectIndex=(index:number)=>{
    if(!recordings.length)return;
    const next=recordings[(index+recordings.length)%recordings.length];
    setRecording(next);
    try{window.localStorage.setItem(SELECTED_KEY,JSON.stringify(next))}catch{}
    window.history.replaceState(null,'',`/analise-reunioes?analysis=${encodeURIComponent(next.id)}`);
  };

  const thumb=recording?.thumbnail||'/skills-card.png';
  return <main className="app-shell analysis-page">
    <AppSidebar/>
    <section className="content">
      <AppTopbar/>
      <section className={analysisThemeClass('analysis-stage')} style={analysisThemeVars as CSSProperties}>
        <div className="analysis-heading"><button onClick={()=>router.push('/gravacoes')} aria-label="Voltar para gravações"><ChevronLeft/></button><div><span>ANÁLISE DE REUNIÕES</span><h1>Desempenho que<br/>gera resultados.</h1><p>IA conversacional baseada em evidências,<br/>momentos e decisões da reunião.</p></div></div>

        <div className="analysis-video">
          {recording?.src?<video src={recording.src} poster={thumb} controls preload="metadata"/>:<div className="analysis-video-image" style={{backgroundImage:`url(${thumb})`}}/>}
          {!recording?.src&&<button className="analysis-video-play" aria-label="Reproduzir"><Play fill="currentColor"/></button>}
          <time>48:12</time><Maximize2 className="analysis-expand"/>
          <button className="analysis-video-nav left" disabled={!canNavigate} onClick={()=>selectIndex(currentIndex-1)} aria-label="Vídeo anterior"><ChevronLeft/></button>
          <button className="analysis-video-nav right" disabled={!canNavigate} onClick={()=>selectIndex(currentIndex+1)} aria-label="Próximo vídeo"><ChevronRight/></button>
        </div>

        <article className="analysis-meeting analysis-panel"><div className="analysis-date"><CalendarDays/>10 de setembro de 2026 • 14:00</div><h2>{recording?.title||'Reunião de planejamento'}</h2><p>{recording?.phrase||'Estratégia, proposta e próximos passos.'}</p><div className="analysis-people"><div className="analysis-avatars">{participantPhotos.map((photo,index)=><img src={photo} alt={`Participante ${index+1}`} key={photo}/>)}<b>+1</b></div><span>6 participantes • 48 min</span></div></article>

        <article className="analysis-score analysis-panel"><div className="analysis-score-ring" style={{'--analysis-score':`${score}%`} as CSSProperties}><div><strong>{score}</strong><span>/100</span><b>Score geral</b><em>↑ +6,4%</em><small>vs. última análise</small></div></div></article>

        <div className="analysis-metrics">{metrics.map(({label,value,copy,Icon})=><article className="analysis-metric analysis-panel" key={label}><div className="analysis-mini-ring" style={{'--score':`${value*3.6}deg`} as CSSProperties}><strong>{value}%</strong></div><Icon/><h3>{label}</h3><p>{copy}</p><div className="analysis-bar"><i style={{width:`${value}%`}}/></div></article>)}</div>

        <aside className="analysis-insights analysis-panel"><h3><Sparkles/> Principais insights</h3><div><b>↑</b><p><strong>{strongest.label} é o principal ponto forte · {strongest.value}%</strong><span>Maior evidência de performance nesta gravação.</span></p></div><div><b>!</b><p><strong>{weakest.label} pede mais atenção · {weakest.value}%</strong><span>É a skill com maior margem de evolução nesta reunião.</span></p></div><div><b>◎</b><p><strong>Score individual desta reunião: {score}/100</strong><span>Os indicadores exibidos pertencem somente a esta gravação.</span></p></div><div><b>→</b><p><strong>Próximo passo</strong><span>Use os pontos fortes como base e ataque a menor nota na próxima reunião.</span></p></div></aside>

        <div className="analysis-stats"><article><strong>8</strong><span>Reuniões<br/>analisadas</span></article><article><strong>6</strong><span>Alta evidência<br/>de performance</span></article><article><strong>91%</strong><span>Meta de evolução<br/>(82/90)</span></article><article><strong>12h</strong><span>Tempo total<br/>analisado</span></article></div>
      </section>
    </section>
  </main>;
}
