'use client';
import {useEffect,useMemo,useState} from 'react';
import AppSidebar from '../AppSidebar';
import '../calibragem/calibragem.css';

type Dim='Percepção'|'Investigação'|'Regulação'|'Flexibilidade'|'Influência'|'Decisão'|'Autopercepção';
type Option={text:string,v:Partial<Record<Dim,number>>,pattern:string};
type Scenario={tag:string,q:string,options?:Option[],open?:boolean,focus:Dim[]};
const dims:Dim[]=['Percepção','Investigação','Regulação','Flexibilidade','Influência','Decisão','Autopercepção'];
const scenarios:Scenario[]=[
{tag:'PRESSÃO',q:'Você preparou uma ideia importante durante dias. Nos primeiros segundos alguém interrompe: “Isso não vai funcionar.” O que você faz primeiro?',focus:['Regulação','Investigação'],options:[
{text:'Começo a organizar argumentos para defender a ideia.',v:{Influência:3,Regulação:1},pattern:'defesa rápida'},
{text:'Pergunto o que exatamente fez a pessoa chegar a essa conclusão.',v:{Investigação:4,Regulação:3},pattern:'investigação sob pressão'},
{text:'Observo a reação do grupo antes de responder.',v:{Percepção:4,Regulação:3},pattern:'leitura contextual'},
{text:'Mudo a forma de apresentar para recuperar a atenção.',v:{Flexibilidade:4,Influência:3},pattern:'adaptação tática'}]},
{tag:'ARGUMENTO',q:'Uma pessoa importante discorda de você e diz que sua proposta cria mais risco do que valor. Escreva exatamente como você responderia.',open:true,focus:['Influência','Investigação']},
{tag:'LEITURA',q:'Alguém concorda com quase tudo, mas você sente que a conversa não vai avançar. Qual é seu primeiro movimento?',focus:['Percepção','Investigação'],options:[
{text:'Confio no que foi verbalizado até aparecer evidência contrária.',v:{Regulação:3,Percepção:1},pattern:'literalidade'},
{text:'Procuro identificar qual sinal concreto gerou minha impressão.',v:{Percepção:4,Autopercepção:3},pattern:'checagem perceptiva'},
{text:'Faço uma pergunta que teste intenção real.',v:{Investigação:4,Decisão:3},pattern:'teste de intenção'},
{text:'Provoco uma mudança de contexto para observar uma reação menos preparada.',v:{Flexibilidade:4,Percepção:3},pattern:'teste comportamental'}]},
{tag:'CONFLITO',q:'Duas pessoas que você respeita contam versões incompatíveis do mesmo fato e ambas parecem sinceras. Como sua mente organiza isso?',focus:['Percepção','Flexibilidade'],options:[
{text:'Comparo detalhes para encontrar inconsistências.',v:{Percepção:3,Decisão:3},pattern:'consistência factual'},
{text:'Considero que ambas podem estar descrevendo percepções honestas diferentes.',v:{Flexibilidade:4,Percepção:3},pattern:'multiperspectiva'},
{text:'Observo interesses, incentivos e o que cada uma pode estar deixando de fora.',v:{Investigação:4,Percepção:4},pattern:'leitura de incentivos'},
{text:'Adio qualquer conclusão até obter uma terceira fonte.',v:{Regulação:4,Decisão:2},pattern:'suspensão de julgamento'}]},
{tag:'REJEIÇÃO',q:'Você apresenta algo em que acredita e recebe apenas: “Não tenho interesse.” Escreva sua próxima frase.',open:true,focus:['Influência','Regulação']},
{tag:'ERRO',q:'Você toma uma decisão com convicção e depois descobre que estava errado. O que aparece primeiro?',focus:['Autopercepção','Flexibilidade'],options:[
{text:'Quero localizar exatamente onde meu raciocínio quebrou.',v:{Autopercepção:4,Investigação:3},pattern:'auditoria mental'},
{text:'Penso nas informações que eu não tinha naquele momento.',v:{Flexibilidade:3,Regulação:3},pattern:'contextualização'},
{text:'Fico incomodado por não ter percebido antes.',v:{Autopercepção:2,Regulação:1},pattern:'impacto autorreferente'},
{text:'Reconstruo a decisão imaginando o que faria agora.',v:{Flexibilidade:4,Autopercepção:3},pattern:'reconstrução'}]},
{tag:'SILÊNCIO',q:'Você faz uma pergunta delicada. A pessoa fica em silêncio olhando para você. O que tende a acontecer?',focus:['Regulação','Percepção'],options:[
{text:'Tenho vontade de explicar melhor a pergunta.',v:{Regulação:1,Influência:2},pattern:'preenchimento'},
{text:'Sustento o silêncio e observo.',v:{Regulação:4,Percepção:4},pattern:'tolerância ao silêncio'},
{text:'Começo a formular hipóteses sobre o que ela evita dizer.',v:{Percepção:3,Investigação:2},pattern:'inferência rápida'},
{text:'Busco outra forma de chegar ao mesmo assunto.',v:{Flexibilidade:4,Influência:3},pattern:'reformulação'}]},
{tag:'AMBIGUIDADE',q:'Seu líder envia: “Precisamos conversar amanhã.” Sem outro contexto. O que você faz mentalmente?',focus:['Regulação','Autopercepção'],options:[
{text:'Repasso acontecimentos recentes procurando o motivo.',v:{Autopercepção:2,Regulação:1},pattern:'antecipação'},
{text:'Levanto hipóteses, mas não trato nenhuma como fato.',v:{Regulação:4,Flexibilidade:4},pattern:'hipóteses abertas'},
{text:'Assumo que provavelmente existe um problema.',v:{Decisão:2,Regulação:1},pattern:'fechamento precoce'},
{text:'Pergunto sobre o assunto para reduzir a incerteza.',v:{Decisão:4,Investigação:3},pattern:'redução ativa de incerteza'}]},
{tag:'CRÍTICA',q:'Alguém faz uma crítica que parece injusta, mas toca em um ponto sensível seu. Escreva o que você responderia na hora.',open:true,focus:['Autopercepção','Regulação']},
{tag:'PESSOAS',q:'Você conhece alguém extremamente carismático e seguro. Em minutos todos gostam dessa pessoa. O que mais orienta sua leitura?',focus:['Percepção','Autopercepção'],options:[
{text:'A facilidade social pesa positivamente na minha avaliação.',v:{Influência:2,Percepção:1},pattern:'efeito de carisma'},
{text:'Percebo o efeito em mim e separo carisma de competência e intenção.',v:{Autopercepção:4,Percepção:4},pattern:'separação de sinais'},
{text:'Fico mais atento porque sei que persuasão pode alterar minha leitura.',v:{Autopercepção:4,Regulação:3},pattern:'vigilância metacognitiva'},
{text:'Observo como trata pessoas de quem não precisa.',v:{Percepção:4,Investigação:3},pattern:'evidência lateral'}]},
{tag:'DECISÃO',q:'Você precisa decidir hoje com informação incompleta. Qual é sua tendência?',focus:['Decisão','Regulação'],options:[
{text:'Protejo a opção mais segura.',v:{Regulação:3,Decisão:2},pattern:'proteção'},
{text:'Identifico quais incógnitas realmente poderiam mudar a decisão.',v:{Investigação:4,Decisão:4},pattern:'valor da informação'},
{text:'Aceito o risco quando o potencial é muito maior.',v:{Decisão:4,Regulação:2},pattern:'assimetria de oportunidade'},
{text:'Penso qual arrependimento seria mais difícil de aceitar.',v:{Autopercepção:3,Decisão:3},pattern:'simulação futura'}]},
{tag:'TENSÃO',q:'Durante uma discussão você percebe que a outra pessoa parou de discutir o tema e começou a defender a própria imagem. Qual seria sua próxima frase?',open:true,focus:['Regulação','Influência']},
{tag:'GRUPO',q:'Em uma reunião todos concordam, mas você percebe um risco que ninguém mencionou. O que pesa mais antes de falar?',focus:['Decisão','Regulação'],options:[
{text:'Se tenho evidência suficiente para contrariar o grupo.',v:{Investigação:3,Decisão:3},pattern:'limiar de evidência'},
{text:'O custo de ficar em silêncio caso minha percepção esteja certa.',v:{Decisão:4,Influência:2},pattern:'responsabilidade'},
{text:'A possibilidade de os outros já terem avaliado algo que eu não vi.',v:{Flexibilidade:4,Autopercepção:3},pattern:'humildade epistêmica'},
{text:'Como levantar o risco sem transformar a conversa em confronto.',v:{Influência:4,Regulação:3},pattern:'framing social'}]},
{tag:'MOTIVAÇÃO',q:'Alguém diz querer muito mudar, mas repete exatamente o comportamento que impede a mudança. Como você investigaria isso?',focus:['Investigação','Percepção'],options:[
{text:'Pergunto se ela realmente decidiu mudar.',v:{Decisão:3,Investigação:2},pattern:'compromisso declarado'},
{text:'Procuro o ganho, medo ou necessidade que compete com o objetivo.',v:{Investigação:4,Percepção:4},pattern:'motivação concorrente'},
{text:'Foco na disciplina e na execução diária.',v:{Decisão:3,Regulação:2},pattern:'execução'},
{text:'Mapeio quando o padrão reaparece e o que acontece imediatamente antes.',v:{Investigação:4,Percepção:4},pattern:'análise de contexto'}]},
{tag:'NEGOCIAÇÃO',q:'A outra pessoa diz: “Seu preço está alto. Se reduzir 20%, fechamos agora.” Escreva exatamente o que você responderia.',open:true,focus:['Influência','Decisão']},
{tag:'MUDANÇA',q:'Uma pessoa muda repentinamente um comportamento recorrente, mas não explica por quê. O que você conclui primeiro?',focus:['Percepção','Flexibilidade'],options:[
{text:'Provavelmente o interesse ou prioridade mudou.',v:{Percepção:2,Flexibilidade:1},pattern:'inferência causal rápida'},
{text:'Algo mudou, mas o comportamento sozinho não revela a causa.',v:{Percepção:4,Flexibilidade:4},pattern:'causa aberta'},
{text:'Espero uma sequência maior antes de interpretar.',v:{Regulação:4,Percepção:3},pattern:'amostragem'},
{text:'Pergunto diretamente o que mudou.',v:{Investigação:4,Decisão:3},pattern:'checagem direta'}]},
{tag:'INFLUÊNCIA',q:'Você percebe que alguém chegou à mesma conclusão que você, mas por uma razão frágil. O que faz?',focus:['Influência','Autopercepção'],options:[
{text:'Aceito; o resultado final é o mesmo.',v:{Decisão:3,Investigação:1},pattern:'orientação a resultado'},
{text:'Exploro a razão porque ela pode não sustentar a decisão depois.',v:{Investigação:4,Influência:3},pattern:'robustez de decisão'},
{text:'Apresento argumentos adicionais para fortalecer a base.',v:{Influência:4,Flexibilidade:2},pattern:'reforço argumentativo'},
{text:'Pergunto o que faria essa pessoa mudar de ideia novamente.',v:{Investigação:4,Autopercepção:3},pattern:'teste de estabilidade'}]},
{tag:'AUTOLEITURA',q:'Você termina uma conversa importante com a sensação de que foi muito bem. Como provaria para a NOZA que essa impressão está correta?',open:true,focus:['Autopercepção','Percepção']}
];

const textSignals=(t:string)=>{const x=t.trim();const words=x.split(/\s+/).filter(Boolean).length;const questions=(x.match(/\?/g)||[]).length;const conditional=/se |caso |depende|antes|entender|o que|qual|como/i.test(x);const empathy=/entendo|faz sentido|percebo|compreendo|receio|preocupa/i.test(x);return{words,questions,conditional,empathy}};

export default function Calibragem(){
 const[started,setStarted]=useState(false),[i,setI]=useState(0),[answers,setAnswers]=useState<Record<number,number>>({}),[texts,setTexts]=useState<Record<number,string>>({}),[saved,setSaved]=useState(false),[existing,setExisting]=useState<any>(null);
 useEffect(()=>{try{const raw=localStorage.getItem('noza-performance-baseline');if(raw)setExisting(JSON.parse(raw))}catch{}},[]);
 const done=Object.keys(answers).length+Object.keys(texts).filter(k=>texts[Number(k)]?.trim().length>=8).length===scenarios.length;
 const profile=useMemo(()=>{const sums=Object.fromEntries(dims.map(d=>[d,0])) as Record<Dim,number>;const counts=Object.fromEntries(dims.map(d=>[d,0])) as Record<Dim,number>;const patterns:Record<string,number>={};scenarios.forEach((s,idx)=>{if(s.open){const t=texts[idx]?.trim();if(!t)return;const sig=textSignals(t);s.focus.forEach((d,n)=>{let val=2.1+Math.min(sig.words,35)/35*1.1+(sig.questions?.35:0)+(sig.conditional?.35:0)+(sig.empathy&&n===1?.2:0);sums[d]+=Math.min(4,val);counts[d]++});if(sig.questions)patterns['investiga antes de afirmar']=(patterns['investiga antes de afirmar']||0)+1;if(sig.conditional)patterns['considera contexto']=(patterns['considera contexto']||0)+1;return}const choice=answers[idx];if(choice===undefined)return;const o=s.options![choice];Object.entries(o.v).forEach(([d,v])=>{sums[d as Dim]+=Number(v);counts[d as Dim]++});patterns[o.pattern]=(patterns[o.pattern]||0)+1});const scores=Object.fromEntries(dims.map(d=>[d,counts[d]?Math.round((sums[d]/counts[d])/4*100):0])) as Record<Dim,number>;const vals=Object.values(scores).filter(Boolean);const performance=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;const confidence=Math.min(48,Math.round(18+(Object.keys(answers).length/scenarios.length)*18+(Object.keys(texts).length/6)*12));const top=Object.entries(patterns).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);return{scores,performance,confidence,top}},[answers,texts]);
 const advance=()=>{if(i<scenarios.length-1)setI(v=>v+1)};
 const choose=(n:number)=>{setAnswers(a=>({...a,[i]:n}));setTimeout(advance,110)};
 const submitOpen=()=>{if((texts[i]||'').trim().length>=8)advance()};
 const finish=done&&i===scenarios.length-1;
 useEffect(()=>{if(!finish||saved)return;const payload={performance:profile.performance,scores:profile.scores,confidence:profile.confidence,model:'cognitive-baseline-v2',patterns:profile.top,completedAt:new Date().toISOString()};localStorage.setItem('noza-performance-baseline',JSON.stringify(payload));window.dispatchEvent(new CustomEvent('noza:performance-updated',{detail:payload}));setExisting(payload);setSaved(true)},[finish,saved,profile]);
 const reset=()=>{localStorage.removeItem('noza-performance-baseline');window.dispatchEvent(new Event('noza:performance-reset'));setAnswers({});setTexts({});setI(0);setSaved(false);setExisting(null);setStarted(true)};
 const s=scenarios[i];
 const strongest=Object.entries(profile.scores).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';const growth=Object.entries(profile.scores).filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1])[0]?.[0]||'—';
 return <div className="cal-shell"><AppSidebar/><main className="cal-main">
 <div className="cal-top"><span>NOZA / COGNITIVE PERFORMANCE MODEL</span><span>{started&&!finish?String(i+1).padStart(2,'0')+' / 18':'BASELINE COGNITIVO'}</span></div>
 {!started?<section className="cal-intro"><div className="cal-kicker"><i/> CALIBRAGEM COGNITIVA</div><h1>Como você tende a pensar<br/><em>quando precisa performar?</em></h1><p>A NOZA observa como você interpreta sinais, reage à pressão, constrói argumentos, decide com informação incompleta e regula sua resposta. Não há alternativa “certa”: cada decisão alimenta um padrão cognitivo que será confrontado depois com seu comportamento real.</p><div className="cal-domains">{dims.map((d,n)=><span key={d}><b>0{n+1}</b>{d}</span>)}</div>{existing&&<div className="cal-existing"><span>BASELINE ATIVO</span><strong>{existing.performance}/100</strong><p>Confiança atual do modelo: {existing.confidence||'inicial'}{typeof existing.confidence==='number'?'%':''}. Você pode refazer a calibragem para criar um novo ponto de partida.</p></div>}<button className="cal-start" onClick={()=>{setStarted(true);setI(0)}}>{existing?'REFAZER CALIBRAGEM':'INICIAR CALIBRAGEM'} <b>→</b></button><small>18 situações · 6 respostas livres · aproximadamente 8 minutos · modelo inicial, não diagnóstico clínico</small></section>
 :!finish?<section className="cal-test"><div className="cal-progress"><i style={{width:`${((i+1)/18)*100}%`}}/></div><div className="cal-code">CENÁRIO {String(i+1).padStart(2,'0')} <span>— {s.tag}</span></div><h2>{s.q}</h2><p className="cal-hint">{s.open?'Responda como falaria de verdade. A NOZA observa a estrutura da sua resposta, não uma frase “perfeita”.':'Escolha sua reação mais natural. As alternativas representam padrões diferentes — não uma resposta certa.'}</p>{s.open?<div className="cal-open"><textarea value={texts[i]||''} onChange={e=>setTexts(t=>({...t,[i]:e.target.value}))} placeholder="Escreva exatamente o que você diria..."/><div><span>{(texts[i]||'').trim().split(/\s+/).filter(Boolean).length} palavras</span><button onClick={submitOpen} disabled={(texts[i]||'').trim().length<8}>CONTINUAR →</button></div></div>:<div className="cal-options">{s.options!.map((o,n)=><button key={o.text} onClick={()=>choose(n)}><b>{String.fromCharCode(65+n)}</b><span>{o.text}</span><i>↗</i></button>)}</div>}{i>0&&<button className="cal-back" onClick={()=>setI(v=>v-1)}>← VOLTAR</button>}</section>
 :<section className="cal-result"><div className="cal-kicker"><i/> MODELO COGNITIVO INICIAL</div><h1>Seu ponto de partida<br/><em>foi identificado.</em></h1><div className="cal-performance-number"><strong>{profile.performance}</strong><span>/100<br/>BASELINE DE PERFORMANCE</span></div><div className="cal-confidence"><span>CONFIANÇA DO MODELO</span><strong>{profile.confidence}% · INICIAL</strong><i><b style={{width:`${profile.confidence}%`}}/></i><p>A confiança é propositalmente limitada: 18 situações não bastam para definir uma pessoa. Ela aumentará quando a NOZA comparar este modelo com evidências das suas interações reais.</p></div><div className="cal-scoregrid">{dims.map(d=><div key={d}><header><span>{d}</span><b>{profile.scores[d]}</b></header><div><i style={{width:`${profile.scores[d]}%`}}/></div></div>)}</div><div className="cal-model-grid"><article><span>FORÇA INICIAL</span><strong>{strongest}</strong><p>É a dimensão que apareceu com maior consistência nas situações simuladas.</p></article><article><span>ESPAÇO DE DESENVOLVIMENTO</span><strong>{growth}</strong><p>Não é uma fraqueza definitiva. É onde seu padrão atual mostrou mais espaço para evolução.</p></article></div><div className="cal-insight"><span>PADRÕES OBSERVADOS</span><strong>{profile.top.length?profile.top.join(' · '):'Modelo em formação'}</strong><p>Próximo passo: confrontar conhecimento e intenção com execução real. A NOZA procurará diferenças entre o que você demonstra saber aqui e o que efetivamente faz sob pressão.</p></div><div className="cal-compare"><span>PRÓXIMA CAMADA</span><h3>CALIBRAGEM × COMPORTAMENTO REAL</h3><p>Depois das suas interações, a NOZA poderá mostrar diferenças como: <b>“Você reconhece a importância de investigar, mas sob pressão tende a antecipar respostas.”</b></p></div><button className="cal-start" onClick={reset}>RESETAR E REFAZER <b>↻</b></button></section>}
 </main></div>
}