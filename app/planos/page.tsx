'use client';
import AppTopbar from '../AppTopbar';

import { Check, Crown, Gem, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AppSidebar from '../AppSidebar';
import '../app-topbar.css';
import '../app-sidebar.css';
import '../home-overrides.css';
import './pricing.css';

type Plan = { key:string; name:string; eyebrow:string; monthly:number; description:string; aiLabel:string; aiLimit:string; features:string[]; cta:string; note:string; Icon:typeof Sparkles; featured?:boolean };

const plans:Plan[]=[

{key:'pro',name:'Pro',eyebrow:'TRANSFORME SUA PERFORMANCE EM EVOLUÇÃO CONTÍNUA.',monthly:79.9,description:'A NOZA identifica padrões na forma como você pensa, comunica e conduz situações para mostrar exatamente o que desenvolver.',aiLabel:'NOZA IA',aiLimit:'Inteligência de performance contínua',features:['Skills de Performance','Inteligência Cognitiva','Comunicação e Persuasão','Padrões de Comportamento','Mapa de Competências','Plano de Desenvolvimento','Evolução Contínua','Insights Pós-Reunião','Gravações e Histórico','Reuniões em Full HD','Até 100 participantes','Suporte 24h'],cta:'TESTAR PRO POR 7 DIAS',note:'R$ 0 hoje. Após 7 dias, R$ 79,90/mês. Cancele durante o período gratuito e não será cobrado.',Icon:Crown,featured:true},
{key:'premium',name:'Premium',eyebrow:'A INTELIGÊNCIA MAIS AVANÇADA DA NOZA PARA ACELERAR SEU DESENVOLVIMENTO.',monthly:197,description:'Aprofunde a leitura da sua performance para descobrir padrões, lacunas e capacidades que ainda podem ser desenvolvidas.',aiLabel:'TUDO DO PRO, MAIS:',aiLimit:'Inteligência avançada de desenvolvimento',features:['Inteligência Cognitiva Avançada','Skills Avançadas','Mapa Cognitivo de Performance','Inteligência de Comunicação','Padrões e Tendências Pessoais','Identificação de Lacunas','Desenvolvimento Personalizado','Diagnósticos de Performance','Memória Longitudinal de Evolução','Recomendações Estratégicas da IA','Histórico Completo de Desenvolvimento','Suporte Prioritário 24h'],cta:'ASSINAR PREMIUM',note:'',Icon:Gem}
];
const money=(value:number)=>value.toLocaleString('pt-BR',{minimumFractionDigits:value===0?0:2,maximumFractionDigits:2});
export default function PlanosPage(){const[billing,setBilling]=useState<'monthly'|'annual'>('monthly');const[busy,setBusy]=useState('');const subscribe=async(plan:string)=>{if(plan==='trial')plan='pro';setBusy(plan);try{const r=await fetch('/api/billing/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Não foi possível iniciar a assinatura.');if(d.url)location.href=d.url}catch(e:any){alert(e.message)}finally{setBusy('')}};return <><AppSidebar/><AppTopbar floating/><main className="pricing-page"><section className="pricing-shell"><div className="pricing-kicker">PLANOS E PREÇOS</div><div className="billing-toggle" role="group" aria-label="Período de cobrança"><button className={billing==='monthly'?'active':''} onClick={()=>setBilling('monthly')}>Mensal</button><button className={billing==='annual'?'active':''} onClick={()=>setBilling('annual')}>Anual <span>-20%</span></button></div><div className="pricing-grid">{plans.map(({key,name,eyebrow,monthly,description,aiLabel,aiLimit,features,cta,note,Icon,featured})=>{const value=billing==='annual'?monthly*.8:monthly;return <article key={key} className={`price-card ${featured?'featured':''}`}><div className="price-card-top"><div className="plan-icon"><Icon/></div>{featured&&<span className="choice-badge">MAIS ESCOLHIDO</span>}</div><div className="plan-eyebrow">{eyebrow}</div><h2>{name}</h2><div className="plan-price"><span>R$</span> {money(value)}</div><div className="ai-allowance"><div className="ai-allowance-head"><Sparkles/><span>{aiLabel}</span></div><strong>{aiLimit}</strong></div><div className="plan-divider"/><ul>{features.map(feature=><li key={feature}><span className="check"><Check/></span>{feature}</li>)}</ul><button className="plan-cta" disabled={!!busy} onClick={()=>subscribe(key)}>{busy===(key==='trial'?'pro':key)?'ABRINDO MERCADO PAGO...':cta}</button><p className="plan-note">{note}</p></article>})}</div><div className="pricing-footnote"><strong>NOZA IA</strong><span>Inteligência integrada aos planos para apoiar suas reuniões, análises e decisões.</span></div></section></main></>}

/* production deployment */
