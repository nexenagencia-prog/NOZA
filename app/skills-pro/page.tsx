'use client';
import AppTopbar from '../AppTopbar';
import {useState} from 'react';
import {ArrowRight,BrainCircuit,Check,ChevronRight,Eye,GitFork,Lightbulb,Play,RotateCcw,ShieldQuestion,Sparkles} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import {createCognitiveSession,revealForecast} from './skills-pro-model.mjs';
import {closeContext,createIntelligenceState,openContext} from './skills-pro-intelligence-model.mjs';
import {createCentralDiagnostic} from './skills-pro-diagnostic-model.mjs';
import {createEntryPoint} from './skills-pro-entry-model.mjs';
import './skills-pro.css';
import './skills-pro-refinement.css';
import './skills-pro-intelligence.css';
import './skills-pro-skills-brand.css';
import './skills-pro-diagnostic.css';
import './skills-pro-entry.css';

const initialSession=createCognitiveSession();
const readings=['Ela teme a adoção pela equipe','Ela está usando preço para negociar','Ela ainda não vê urgência suficiente'];
const branches=[
  {id:'defend',label:'Defender valor',copy:'Explicar retorno, funcionalidades e preço.',result:'A conversa segue racional, mas o risco real continua sem nome.',tone:'muted'},
  {id:'discover',label:'Descobrir o risco',copy:'“O que precisaria estar seguro para isso funcionar com a equipe?”',result:'O cliente nomeia a barreira. A decisão ganha um problema concreto para resolver.',tone:'strong'},
  {id:'commit',label:'Testar decisão',copy:'“Se resolvêssemos a adoção, haveria algo que impediria o próximo passo?”',result:'Você revela se existe uma segunda objeção antes de propor solução.',tone:'clear'},
];
const contexts=[
  {id:'risk',label:'O que o cliente está realmente protegendo?',summary:'Ele não está travado pelo preço. Está tentando evitar uma implantação que comprometa a equipe.',evidence:'Quando você explicou retorno, ele voltou a falar do ritmo de implantação — sinal de que a objeção declarada não era a decisão real.',mistake:'Você entrou em defesa de valor antes de tornar o risco específico e conversável.',move:'“O que precisaria estar seguro para isso não virar um peso para a equipe?”'},
  {id:'timing',label:'Onde a conversa perdeu direção?',summary:'O interesse existia, mas você continuou explicando depois que havia espaço para confirmar a decisão.',evidence:'A frase “faz sentido para mim” veio antes de mais 2 minutos de apresentação.',mistake:'Você trocou uma oportunidade de compromisso por mais informação.',move:'“Se resolvermos esse ponto, existe algo que impediria o próximo passo?”'},
  {id:'pressure',label:'Como você reage quando sente pressão?',summary:'Quando o tema vira preço, sua resposta acelera — e sua escuta diminui.',evidence:'Nas reuniões em que você fez uma pausa e uma pergunta, a conversa avançou para um próximo passo.',mistake:'Responder rápido cria a sensação de que o preço precisa ser defendido.',move:'“Antes de falarmos de valor, me ajuda a entender o que ficou incerto para você?”'},
];
const centralDiagnostic=createCentralDiagnostic();
const entryPoint=createEntryPoint();

export default function SkillsProPage(){
  const [session,setSession]=useState(initialSession);
  const [selectedBranch,setSelectedBranch]=useState('discover');
  const [replaying,setReplaying]=useState(false);
  const [intelligence,setIntelligence]=useState(createIntelligenceState());
  const forecast=session.forecast;
  const chooseReading=(reading:string)=>setSession(revealForecast(session,reading));
  const reset=()=>setSession(createCognitiveSession());
  const activeBranch=branches.find(branch=>branch.id===selectedBranch)||branches[1];
  const activeContext=contexts.find(context=>context.id===intelligence.openContext);

  return <main className="skills-pro-page"><AppSidebar/><AppTopbar/><section className="skills-pro-content">
    <header className="skills-pro-header"><div><span>SKILLS PRO · INTELIGÊNCIA CONVERSACIONAL</span><h1>Entenda o que a reunião<br/>realmente revelou.</h1><p>Primeiro a decisão do cliente. Depois, sua condução. Por fim, o melhor próximo movimento.</p></div><div className="header-signal"><BrainCircuit/><span>1 diagnóstico para evoluir hoje</span></div></header>
    <section className="central-diagnostic"><div><span>COMECE POR AQUI</span><h2>O cliente não travou por preço.<br/>Travou por segurança.</h2><p>{centralDiagnostic.explanation}</p><button onClick={()=>document.querySelector(entryPoint.target)?.scrollIntoView({behavior:'smooth',block:'start'})}>{entryPoint.action}<ArrowRight/></button></div><div className="diagnostic-contrast"><small>O QUE ELE DISSE</small><b>{centralDiagnostic.stated}</b><i>→</i><small>O QUE ELE PRECISAVA DECIDIR</small><b>{centralDiagnostic.realRisk}</b></div></section>
    <section className="forecast-stage"><div className="stage-kicker"><span><Eye/> PREVISÃO HUMANA</span><small>Reunião com Acme · 12:43</small></div><div className="forecast-grid"><div className="meeting-moment"><span>O MOMENTO</span><blockquote>“Preço não é exatamente o problema. Eu preciso ter segurança de que isso não vai travar a equipe.”</blockquote><div className="moment-meta"><button onClick={()=>setReplaying(!replaying)} aria-label="Reproduzir trecho"><Play fill="currentColor"/>{replaying?'Trecho em reprodução':'Ouvir os 38 segundos anteriores'}</button><i>38s antes da decisão mudar</i></div></div><div className="forecast-question"><span>ANTES DE VER O QUE ACONTECEU</span><h2>{forecast.prompt}</h2>{forecast.reveal==='hidden'?<div className="reading-options">{readings.map(reading=><button key={reading} onClick={()=>chooseReading(reading)}><span>{reading}</span><ChevronRight/></button>)}</div>:<div className="forecast-reveal"><div className="your-reading"><small>SUA LEITURA</small><b>{forecast.userReading}</b></div><div className="actual-response"><small>O QUE ELE DISSE EM SEGUIDA</small><p>{forecast.actualResponse}</p><em><Lightbulb/>{forecast.signal}</em></div><button className="try-again" onClick={reset}><RotateCcw/> Fazer outra leitura</button></div>}</div></div><div className="forecast-footer"><ShieldQuestion/><p>Prever antes de receber a resposta treina percepção de contexto — a habilidade que separa uma reação rápida de uma leitura realmente estratégica.</p></div></section>
    <section className="decision-section"><div className="section-intro"><span><GitFork/> PONTO DE BIFURCAÇÃO</span><h2>O mesmo instante. Três formas de conduzir.</h2><p>Não existe frase mágica: cada escolha cria uma condição psicológica diferente para a decisão.</p></div><div className="branch-layout"><div className="branch-list">{branches.map((branch,index)=><button className={`branch-option ${selectedBranch===branch.id?'selected':''}`} onClick={()=>setSelectedBranch(branch.id)} key={branch.id}><small>0{index+1}</small><div><b>{branch.label}</b><span>{branch.copy}</span></div><ChevronRight/></button>)}</div><article className={`branch-result ${activeBranch.tone}`}><span>EFEITO DA ESCOLHA</span><h3>{activeBranch.label}</h3><p>{activeBranch.result}</p><div className="impact-bars"><div><label>Segurança para falar</label><b className="bar safety"><i/></b></div><div><label>Clareza da decisão</label><b className="bar clarity"><i/></b></div><div><label>Direção da conversa</label><b className="bar direction"><i/></b></div></div><div className="branch-insight"><Sparkles/><p>A escolha mais forte não é a que explica melhor. É a que torna a decisão mais clara para o outro.</p></div></article></div></section>
    <section className="intelligence-section"><div className="section-intro"><span><BrainCircuit/> CONTEXTO INTELIGENTE</span><h2>O que estava acontecendo por trás da conversa.</h2><p>Abra uma leitura para ver o contexto, seu ponto de erro e a intervenção que aumenta sua precisão.</p></div><div className="context-list">{contexts.map(context=><button onClick={()=>setIntelligence(openContext(intelligence,context.id))} className={intelligence.openContext===context.id?'open':''} key={context.id}><div><b>{context.label}</b><span>{context.summary}</span></div><ChevronRight/></button>)}</div>{activeContext&&<article className="context-detail"><button className="context-close" onClick={()=>setIntelligence(closeContext(intelligence))}>Fechar leitura ×</button><span>LEITURA DA IA</span><h3>{activeContext.summary}</h3><div><section><small>EVIDÊNCIA DA REUNIÃO</small><p>{activeContext.evidence}</p></section><section><small>ONDE SUA CONDUÇÃO PERDEU FORÇA</small><p>{activeContext.mistake}</p></section><section className="best-move"><small>INTERVENÇÃO DE ALTA PRECISÃO</small><blockquote>{activeContext.move}</blockquote></section></div></article>}</section>
    <section className="next-practice"><div><span>PRÓXIMA REUNIÃO · HOJE, 14:00</span><h2>Um único treino para levar com você.</h2><p>Quando uma objeção surgir, não responda à frase. Encontre a decisão que a frase está protegendo.</p></div><button><Check/> Levar este foco para a reunião</button></section>
  </section></main>;
}