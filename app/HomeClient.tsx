'use client';

import {ArrowLeft,ArrowRight,BarChart3,Lightbulb,Play,Star,Video} from 'lucide-react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {CSSProperties,useEffect,useMemo,useState} from 'react';
import type {HomeContent} from '../lib/cms/types';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import FloatingCalculator from './FloatingCalculator';
import FloatingNotes,{type FloatingNotesMode} from './FloatingNotes';
import {homeCardRoute} from './home-card-route.mjs';

const cardIcon=(slug:string)=>slug==='recordings'?Play:slug==='insights'?Lightbulb:BarChart3;
const cardClass=(index:number)=>index===0?'card-one':index===1?'card-two':'card-three';
const heroWords=['evolua','conecte','cresça'];

export default function HomeClient({content}:{content:HomeContent}){
  const router=useRouter();
  const[expanded,setExpanded]=useState(false);
  const[slide,setSlide]=useState(0);
  const[loaded,setLoaded]=useState(false);
  const[calculatorOpen,setCalculatorOpen]=useState(false);
  const[notesMode,setNotesMode]=useState<FloatingNotesMode>(null);
  const[heroWord,setHeroWord]=useState(0);
  const slides=useMemo(()=>{
    const active=content.carousel.filter(item=>item.isActive);
    return active.length?active:content.carousel;
  },[content.carousel]);

  useEffect(()=>{router.prefetch('/anotacoes');router.prefetch('/skills')},[router]);
  useEffect(()=>{
    requestAnimationFrame(()=>setLoaded(true));
    if(!slides.length)return;
    const timer=setInterval(()=>setSlide(current=>(current+1)%slides.length),content.carouselIntervalMs||4000);
    return()=>clearInterval(timer);
  },[slides.length,content.carouselIntervalMs]);
  useEffect(()=>setSlide(0),[slides]);
  useEffect(()=>{
    const timer=setInterval(()=>setHeroWord(word=>(word+1)%heroWords.length),2400);
    return()=>clearInterval(timer);
  },[]);

  const go=(direction:number)=>setSlide(currentSlide=>slides.length?(currentSlide+direction+slides.length)%slides.length:0);
  const current=slides[slide];
  const nozaCarousel=[
    {imageUrl:'/noza-home-slide-brain.png',title:'Mais do que reuniões.',subtitle:'Entenda como você decide.'},
    {imageUrl:'/noza-home-slide-human.png',title:'Mais do que comunicação.',subtitle:'Entenda como você se comporta.'},
    {imageUrl:'/noza-home-slide-focus.png',title:'Mais do que foco.',subtitle:'Transforme padrões em performance.'},
  ];
  const visual=nozaCarousel[slide%nozaCarousel.length];
  const heroStyle=content.hero.imageUrl?{backgroundImage:`url(${content.hero.imageUrl})`}:undefined;
  const titleLines=content.hero.title.split('\n');
  const firstName=content.profile.name.trim().split(/\s+/)[0]||'Sandro';
  const renderHeroLine=(line:string)=>{
    const match=line.match(/evolua/i);
    if(!match)return line;
    const index=match.index||0;
    return <>{line.slice(0,index)}<em className="hero-dynamic-word" key={heroWords[heroWord]}>{heroWords[heroWord]}</em>{line.slice(index+match[0].length)}</>;
  };

  return <main className={`app-shell ${loaded?'loaded':''}`}>
    {content.hero.imageUrl&&<div className="hero-media" style={heroStyle}/>}
    <AppSidebar name={content.profile.name} planLabel={content.profile.planLabel} avatarUrl={content.profile.avatarUrl} labels={content.navigation.sidebar} onCalculator={()=>setCalculatorOpen(true)} onAnotar={()=>setNotesMode('editor')} onExpandedChange={setExpanded}/>
    <section className={`content ${expanded?'shifted':''}`}>
      <AppTopbar floating={false} searchPlaceholder={content.navigation.searchPlaceholder} nextLabel={content.nextMeeting.label} nextDateTime={content.nextMeeting.dateTime} performancePercent={content.hero.performancePercent}/>
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="hero-greeting">Bem-vindo, <strong>{firstName}!</strong></div><div className="eyebrow">{content.hero.eyebrow}</div>
          <h1 className="hero-refined-headline">{titleLines.map((line,index)=><span key={index}>{renderHeroLine(line)}{index<titleLines.length-1&&<br/>}</span>)}</h1>
          <div className="rating-line"><div className="stars">{[0,1,2,3,4].map(number=><Star key={number} size={20} fill="currentColor"/>)}</div><span>{content.hero.ratingText}</span></div>
          <div className="hero-score"><b>{content.hero.performancePercent}%</b> {content.hero.performanceLabel}</div><div className="progress"><i style={{'--p':`${content.hero.performancePercent}%`} as CSSProperties}/></div><div className="ticks"/>
          <div className="hero-actions"><button className="primary-btn"><Video size={22}/>{content.hero.primaryButton}</button><button className="secondary-btn"><Play size={25}/>{content.hero.secondaryButton}</button></div>
        </div>
        <div className="hero-feature"><div className="feature-card">
          <div className="feature-photo" key={`noza-${slide}`} style={{backgroundImage:`url(${visual.imageUrl})`}}/>
          <div className="feature-text" key={`t${slide}`}>{visual.title}<br/>{visual.subtitle}</div><div className="slider-dashes">{slides.map((_,index)=><i key={index} className={index===slide?'on':''}/>)}</div><div className="feature-arrows"><button onClick={()=>go(-1)}><ArrowLeft/></button><button onClick={()=>go(1)}><ArrowRight/></button></div>
        </div></div>
      </section>
      <section className="cards-grid">
        {content.cards.filter(card=>card.isActive).sort((a,b)=>a.sortOrder-b.sortOrder).map((card,index)=>{
          const Icon=cardIcon(card.slug);
          const overlay=index===1?'linear-gradient(90deg,rgba(238,244,247,.88),rgba(238,244,247,.05))':'linear-gradient(90deg,rgba(238,244,247,.9),rgba(238,244,247,.18))';
          const route=homeCardRoute(card.slug);
          const style=card.imageUrl?{backgroundImage:`${overlay},url(${card.imageUrl})`}:undefined;
          const body=<><Icon className={`card-icon ${card.slug==='recordings'?'circled':''}`}/><h2>{card.title}</h2><p>{card.description}</p><strong>{card.percentage}%</strong><div className="card-progress"><i style={{'--p':`${card.percentage}%`} as CSSProperties}/></div><span className="round-go" aria-hidden="true"><ArrowRight/></span></>;
          return route?<Link className={`info-card ${cardClass(index)}`} key={card.slug} style={style} href={route} aria-label={`${card.title}: ${card.ctaLabel}`}>{body}</Link>:<article className={`info-card ${cardClass(index)}`} key={card.slug} style={style}>{body}</article>;
        })}
      </section>
    </section>
    <FloatingCalculator open={calculatorOpen} onClose={()=>setCalculatorOpen(false)}/><FloatingNotes mode={notesMode} onClose={()=>setNotesMode(null)}/>
    <style jsx global>{`.hero-copy .hero-refined-headline{font-weight:420!important}.hero-dynamic-word{display:inline-block;font-style:italic;font-weight:360;min-width:3.9em;animation:heroWordIn .55s cubic-bezier(.22,.72,.18,1) both}@keyframes heroWordIn{from{opacity:0;transform:translateY(10px);filter:blur(5px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}@media(prefers-reduced-motion:reduce){.hero-dynamic-word{animation:none}}`}</style>
  </main>;
}
