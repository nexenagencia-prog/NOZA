'use client';
// NOZA production sync

import {ArrowLeft,ArrowRight,BrainCircuit,Crosshair,Focus,Route,TrendingUp} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {CSSProperties,useEffect,useMemo,useState} from 'react';
import type {HomeContent} from '../lib/cms/types';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import FloatingCalculator from './FloatingCalculator';
import FloatingNotes,{type FloatingNotesMode} from './FloatingNotes';
import {homeCardRoute} from './home-card-route.mjs';

const cardIcon=(slug:string)=>slug==='skills'?BrainCircuit:slug==='insights'?Focus:Route;
const cardClass=(index:number)=>index===0?'card-one':index===1?'card-two':'card-three';

export default function HomeClient({content}:{content:HomeContent}){
  const router=useRouter();
  const[expanded,setExpanded]=useState(false);
  const[slide,setSlide]=useState(0);
  const[loaded,setLoaded]=useState(false);
  const[homeName,setHomeName]=useState(content.profile.name);
  const[calculatorOpen,setCalculatorOpen]=useState(false);
  const[notesMode,setNotesMode]=useState<FloatingNotesMode>(null);
  const[focusLabel,setFocusLabel]=useState('Performance estratégica');
  const[hasNozaHistory,setHasNozaHistory]=useState(false);
  const[homeDateTime,setHomeDateTime]=useState('');
  const slides=useMemo(()=>{
    const active=content.carousel.filter(item=>item.isActive);
    return active.length?active:content.carousel;
  },[content.carousel]);

  useEffect(()=>{router.prefetch('/anotacoes');router.prefetch('/skills')},[router]);
  useEffect(()=>{
    const update=()=>{
      const now=new Date();
      const date=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long'}).format(now);
      const time=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(now);
      setHomeDateTime(`${date} · ${time}`);
    };
    update();const timer=setInterval(update,60000);return()=>clearInterval(timer);
  },[]);
  useEffect(()=>{
    requestAnimationFrame(()=>setLoaded(true));
    if(!slides.length)return;
    const timer=setInterval(()=>setSlide(current=>(current+1)%slides.length),content.carouselIntervalMs||4000);
    return()=>clearInterval(timer);
  },[slides.length,content.carouselIntervalMs]);
  useEffect(()=>setSlide(0),[slides]);
  useEffect(()=>{try{const raw=localStorage.getItem('noza-cognitive-selected-topics');if(raw){const topics=JSON.parse(raw) as string[];if(topics.length){const groups=[{label:'Estratégia cognitiva',keys:['Cognição','Raciocínio','Investigação','Percepção','Metacognição']},{label:'Influência estratégica',keys:['Persuasão','Influência','Vendas','Objeções','Psicologia']},{label:'Adaptação estratégica',keys:['Adaptabilidade','Atualização','Repertório']}];const ranked=groups.map(g=>({...g,n:g.keys.filter(k=>topics.includes(k)).length})).sort((a,b)=>b.n-a.n);setFocusLabel(ranked[0].n?ranked[0].label:'Performance estratégica')}}}catch{}},[]);
  useEffect(()=>{try{
    const history=localStorage.getItem('noza-cognitive-history');
    const baseline=localStorage.getItem('noza-cognitive-baseline');
    const selected=localStorage.getItem('noza-cognitive-selected-topics');
    setHasNozaHistory(Boolean((history&&history!=='[]')||baseline||(selected&&selected!=='[]')));
  }catch{}},[]);
  useEffect(()=>{try{const saved=localStorage.getItem('noza-profile-name');if(saved)setHomeName(saved)}catch{};const sync=(e:any)=>setHomeName(e.detail||content.profile.name);window.addEventListener('noza:profile-name',sync);return()=>window.removeEventListener('noza:profile-name',sync)},[content.profile.name]);

  const go=(direction:number)=>setSlide(currentSlide=>slides.length?(currentSlide+direction+slides.length)%slides.length:0);
  const current=slides[slide];
  const nozaCarousel=[
    {imageUrl:'/noza-home-slide-brain.png',title:'Entenda como você pensa.',subtitle:'Transforme isso em performance.'},
    {imageUrl:'/noza-home-slide-human.png',title:'Sua comunicação revela padrões.',subtitle:'Transforme padrões em evolução.'},
    {imageUrl:'/noza-home-slide-focus.png',title:'Desenvolva o que realmente importa.',subtitle:'Evolua com direção.'},
  ];
  const visual=nozaCarousel[slide%nozaCarousel.length];
  const heroStyle=content.hero.imageUrl?{backgroundImage:`url(${content.hero.imageUrl})`}:undefined;
  const adaptiveHero=hasNozaHistory
    ? {title:'Estou trabalhando para fazer você evoluir ainda mais.',subtitle:'A cada interação, entendo melhor seus padrões e encontro novas formas de elevar sua performance.'}
    : {title:'Vamos descobrir como você funciona.',subtitle:'A NOZA começa conhecendo seus padrões, suas capacidades e como você pensa, comunica e decide.'};
  const titleLines=adaptiveHero.title.split('\n');
  const firstName=homeName.trim().split(/\s+/)[0]||'Sandro';
  return <main className={`app-shell ${loaded?'loaded':''}`}>
    {content.hero.imageUrl&&<div className="hero-media" style={heroStyle}/>}
    <AppSidebar name={content.profile.name} planLabel={content.profile.planLabel} avatarUrl={content.profile.avatarUrl} labels={content.navigation.sidebar} onCalculator={()=>setCalculatorOpen(true)} onAnotar={()=>setNotesMode('editor')} onExpandedChange={setExpanded}/>
    <section className={`content ${expanded?'shifted':''}`}>
      <AppTopbar floating={false} nextLabel="AGORA" nextDateTime={homeDateTime} performancePercent={content.hero.performancePercent} showContext/>
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="hero-greeting">Bem-vindo, <strong>{firstName}!</strong></div><div className="eyebrow">{content.hero.eyebrow}</div>
          <h1 className="hero-refined-headline">{titleLines.map((line,index)=><span key={index}>{line}{index<titleLines.length-1&&<br/>}</span>)}</h1>
          <div className="performance-insight"><small>{hasNozaHistory?'SUA EVOLUÇÃO':'PRIMEIRO PASSO'}</small><span>{adaptiveHero.subtitle}</span></div>
          <div className="hero-actions"><div className="calibration-cta-wrap"><button className="primary-btn calibration-cta" onClick={()=>router.push("/calibragem-cognitiva")}><Crosshair size={20}/>{hasNozaHistory?'Fazer Calibragem':'Fazer minha primeira calibragem'}</button><div className="calibration-tooltip">É preciso fazer a primeira calibragem para a NOZA identificar seu nível de performance atual. Depois, você pode refazer a calibragem sempre que preferir.</div></div><button className="secondary-btn" onClick={()=>router.push("/skills")}><TrendingUp size={20}/>Continuar evolução</button></div>
        </div>
        <div className="hero-feature"><div className="feature-card">
          <div className="feature-photo" key={`noza-${slide}`} style={{backgroundImage:`url(${visual.imageUrl})`}}/>
          <div className="feature-text" key={`t${slide}`}>{visual.title}<br/>{visual.subtitle}</div><div className="slider-dashes">{slides.map((_,index)=><i key={index} className={index===slide?'on':''}/>)}</div><div className="feature-arrows"><button onClick={()=>go(-1)}><ArrowLeft/></button><button onClick={()=>go(1)}><ArrowRight/></button></div>
        </div></div>
      </section>
      <section className="cards-grid">
        {content.cards.filter(card=>card.isActive).sort((a,b)=>a.sortOrder-b.sortOrder).map((card,index)=>{
          const Icon=cardIcon(card.slug);
          const route=index===2?'/skills-pro':homeCardRoute(card.slug);
          const style=undefined;
          const homeCopy=index===0?{title:'Skills',description:'Suas habilidades em desenvolvimento.',status:'Comunicação em evolução'}:index===1?{title:'Inteligência de Performance',description:'Entenda seus padrões de decisão, comunicação e comportamento.',status:'Novo padrão identificado'}:{title:'Próximo desenvolvimento',description:'O que mais pode elevar sua performance agora.',status:'Argumentação estratégica'}; const body=<><Icon className={`card-icon ${card.slug==='recordings'?'circled':''}`}/><h2>{homeCopy.title}</h2><p>{homeCopy.description}</p><strong className="card-status">{homeCopy.status}</strong><div className="card-progress"><i style={{'--p':`${card.percentage}%`} as CSSProperties}/></div><span className="round-go" aria-hidden="true"><ArrowRight/></span></>;
          return route?<Link className={`info-card ${cardClass(index)}`} key={card.slug} style={style} href={route} aria-label={`${card.title}: ${card.ctaLabel}`}>{body}</Link>:<article className={`info-card ${cardClass(index)}`} key={card.slug} style={style}>{body}</article>;
        })}
      </section>
    </section>
    <FloatingCalculator open={calculatorOpen} onClose={()=>setCalculatorOpen(false)}/><FloatingNotes mode={notesMode} onClose={()=>setNotesMode(null)}/>
    <style jsx global>{`.hero-copy .hero-refined-headline{font-weight:420!important}.hero-copy .eyebrow{font-size:10px!important;letter-spacing:.12em!important}.performance-insight{max-width:610px;margin:20px 0 18px;display:flex;flex-direction:column;gap:6px}.performance-insight small{font-size:10px;letter-spacing:.13em;opacity:.62}.performance-insight span{font-size:14px;line-height:1.45;opacity:.82}.info-card .card-status{font-size:13px!important;font-weight:500!important;display:block;margin-top:22px}.info-card .card-progress{opacity:.5}.hero-actions .calibration-cta,.hero-actions .secondary-btn{font-weight:300!important}`}</style>
  </main>;
}
