'use client';
import AppTopbar from '../AppTopbar';
import AppSidebar from '../AppSidebar';
import {Check, Sparkles, Crown, Building2, Video} from 'lucide-react';
import {useState} from 'react';
import '../app-topbar.css';
import '../app-sidebar.css';
import '../home-overrides.css';
import './pricing.css';

type Plan={key:string;name:string;caption:string;monthly:number;annual:number;hours:number|null;guests:number;features:string[];Icon:typeof Sparkles;featured?:boolean};
const intelligence=['Reuniões por vídeo na NOZA','IA acompanhando a conversa em tempo real','Análise estratégica após cada reunião','Diagnóstico de comunicação e negociação','Identificação de pontos fortes, fragilidades e oportunidades na conversa','Clareza sobre objeções e decisões pendentes para potencializar sua negociação'];
const plans:Plan[]=[
 {key:'free',name:'Experiência Free',caption:'Conheça a experiência de reuniões da NOZA.',monthly:0,annual:0,hours:null,guests:1,Icon:Video,features:['Reuniões por vídeo em HD','Você e mais 1 participante por reunião','Até 30 minutos por reunião','Sem transcrição, análise por IA ou gravação','Acesso gratuito por 7 dias']},
 {key:'start',name:'NOZA Start',caption:'Mais preparo para cada conversa.',monthly:59.9,annual:47.92,hours:2,guests:1,Icon:Sparkles,featured:true,features:intelligence},
 {key:'pro',name:'NOZA Pro',caption:'Mais espaço para avançar nas negociações.',monthly:99.9,annual:79.92,hours:4,guests:2,Icon:Crown,features:intelligence},
 {key:'business',name:'NOZA Business',caption:'Inteligência para reuniões com mais pessoas.',monthly:199,annual:199,hours:10,guests:5,Icon:Building2,features:intelligence}
];
const money=(n:number)=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export default function PlanosPage(){
 const[billing,setBilling]=useState<'monthly'|'annual'>('monthly');
 const[hours,setHours]=useState(0);
 const[guests,setGuests]=useState(0);
 return <><AppSidebar/><AppTopbar floating/><main className="pricing-page"><section className="pricing-shell">
 <div className="pricing-kicker">PLANOS E PREÇOS</div>
 <div className="billing-toggle" role="group" aria-label="Período de cobrança"><button className={billing==='monthly'?'active':''} onClick={()=>setBilling('monthly')}>Mensal</button><button className={billing==='annual'?'active':''} onClick={()=>setBilling('annual')}>Anual <span>Até −20%</span></button></div>
 <div className="pricing-grid pricing-grid-four">{plans.map(p=>{
 const isBusiness=p.key==='business';const value=(billing==='annual'?p.annual:p.monthly)+(isBusiness?(hours+guests)*15.9:0);
 const totalHours=(p.hours||0)+(isBusiness?hours:0),totalGuests=p.guests+(isBusiness?guests:0);
 return <article key={p.key} className={`price-card ${p.featured?'featured':''}`}>
 <div className="price-card-top"><div className="plan-icon"><p.Icon/></div>{p.featured&&<span className="choice-badge">PARA COMEÇAR</span>}</div>
 <div className="plan-eyebrow">{p.caption}</div><h2>{p.name}</h2><div className="plan-price"><span>R$</span> {value.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
 <div className="monthly-reference">{p.key==='free'?'7 dias grátis · sem cartão':billing==='annual'?'Valor mensal equivalente · plano-base anual':'Por mês · cobrança mensal'}</div>
 <div className="ai-allowance"><div className="ai-allowance-head">{p.key==='free'?<Video/>:<Sparkles/>}<span>{p.key==='free'?'VIDEOCONFERÊNCIA':'NOZA IA'}</span></div>
 <strong className="pricing-hours-emphasis">{p.hours===null?'Até 30 minutos por reunião':`${totalHours} horas de análise por mês`}</strong><div className="pricing-guests-emphasis">Até {totalGuests} {totalGuests===1?'participante adicional':'participantes adicionais'} por reunião</div></div>
 <div className="plan-divider"/><ul>{p.features.map(feature=><li key={feature}><span className="check"><Check/></span>{feature}</li>)}</ul>
 {isBusiness&&<div className="pricing-business-customizer"><strong>Personalize seu Business</strong><div className="pricing-addon-row"><span>Horas adicionais<small>+R$ 15,90 por hora/mês</small></span><div className="pricing-stepper"><button aria-label="Remover hora" disabled={!hours} onClick={()=>setHours(Math.max(0,hours-1))}>−</button><output>{hours}h</output><button aria-label="Adicionar hora" onClick={()=>setHours(hours+1)}>+</button></div></div><div className="pricing-addon-row"><span>Participantes adicionais<small>+R$ 15,90 por participante/mês</small></span><div className="pricing-stepper"><button aria-label="Remover participante" disabled={!guests} onClick={()=>setGuests(Math.max(0,guests-1))}>−</button><output>{guests}</output><button aria-label="Adicionar participante" onClick={()=>setGuests(guests+1)}>+</button></div></div><div className="pricing-custom-summary" aria-live="polite"><strong>{totalHours}h/mês · até {totalGuests} participantes adicionais por reunião</strong><span>{money(value)}/mês</span></div></div>}
 <div className="plan-card-footer"><button className="plan-cta" onClick={()=>location.href=p.key==='free'?'/space':'/suporte'}>{p.key==='free'?'COMEÇAR GRÁTIS':`ADQUIRIR ${p.name.toUpperCase()}`}</button><p className="plan-note">{p.key==='free'?'Experiência gratuita sujeita à ativação e aos limites do aplicativo.':isBusiness?'Personalização demonstrativa; a contratação e a aplicação dos limites ainda dependem da integração comercial.':'Consulte a contratação. Os limites e a cobrança dependem da integração do sistema de assinaturas.'}</p></div>
 </article>})}</div>
 <div className="pricing-footnote"><strong>HORAS E PARTICIPANTES</strong><span>As horas de análise são mensais e compartilhadas entre as reuniões. O limite de participantes adicionais é por reunião, além do titular, e não um total acumulado no mês. Os valores exibidos representam os planos comerciais; a cobrança e os limites técnicos ainda precisam ser sincronizados com o backend.</span></div>
 </section></main></>
}
