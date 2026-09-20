'use client';
import {useMemo,useState} from 'react';
import AppSidebar from '../AppSidebar';
import './calibragem.css';

const qs=[
 {tag:'DESCOBERTA',q:'Um cliente diz: “Gostei, mas neste momento está muito caro.” O que você faz primeiro?',a:['Explico por que o investimento se paga.','Pergunto qual referência ele está usando para considerar caro.','Ofereço uma condição comercial melhor.','Reforço os principais diferenciais da solução.'],skill:'Investigação'},
 {tag:'ESCUTA',q:'Durante uma conversa importante, a pessoa termina uma explicação longa e pouco objetiva. Sua primeira reação é:',a:['Resumir o que entendi e confirmar antes de avançar.','Apresentar imediatamente minha interpretação.','Trazer a conversa de volta para meu objetivo.','Fazer uma nova pergunta sobre outro ponto.'],skill:'Escuta'},
 {tag:'PERSUASÃO',q:'Você percebe resistência a uma ideia que considera claramente melhor. Como conduz?',a:['Aumento a quantidade de argumentos.','Investigo o critério que está sustentando a resistência.','Uso um exemplo de autoridade para encerrar a dúvida.','Mudo de assunto e retorno depois.'],skill:'Persuasão'},
 {tag:'ARGUMENTAÇÃO',q:'Você precisa defender uma proposta em poucos minutos. O que organiza primeiro?',a:['O maior número possível de benefícios.','Contexto, problema, evidência e consequência.','Uma frase de impacto e o preço.','Cases de clientes conhecidos.'],skill:'Argumentação'},
 {tag:'NEGOCIAÇÃO',q:'A outra parte pede um desconto relevante logo no início da negociação. Você:',a:['Concede parte para manter o interesse.','Entende o que precisa mudar para o acordo fazer sentido.','Recusa imediatamente para proteger valor.','Apresenta uma condição promocional.'],skill:'Negociação'},
 {tag:'CONDUÇÃO',q:'Uma reunião começa a se dispersar em vários assuntos. Sua melhor intervenção é:',a:['Deixar fluir para não interromper.','Recapitular objetivo, alinhar prioridade e definir o próximo ponto.','Acelerar sua apresentação.','Encerrar e remarcar.'],skill:'Condução'},
 {tag:'COMUNICAÇÃO',q:'Ao explicar uma ideia complexa para alguém que não domina o tema, você tende a:',a:['Preservar os termos técnicos para ser preciso.','Adaptar linguagem, criar uma estrutura simples e validar compreensão.','Falar mais devagar mantendo a mesma explicação.','Enviar material para a pessoa estudar depois.'],skill:'Comunicação'},
 {tag:'DECISÃO',q:'Você recebe uma objeção inesperada em uma conversa de alta pressão. O que prioriza?',a:['Responder rápido para demonstrar domínio.','Separar fato, interpretação e informação que ainda falta.','Usar a resposta que costuma funcionar.','Transferir a decisão para depois.'],skill:'Decisão'}
];
const skills=['Comunicação','Escuta','Investigação','Persuasão','Argumentação','Negociação','Condução','Decisão'];

export default function Calibragem(){
 const [started,setStarted]=useState(false),[i,setI]=useState(0),[answers,setAnswers]=useState<number[]>([]);
 const done=answers.length===qs.length;
 const scores=useMemo(()=>Object.fromEntries(skills.map((s,idx)=>{const qi=qs.findIndex(q=>q.skill===s);const ans=answers[qi];const base=ans===undefined?0:[64,88,72,58][ans];return [s,Math.min(96,base+(idx%3)*2)]})),[answers]);
 const choose=(n:number)=>{const next=[...answers,n];setAnswers(next);if(i<qs.length-1)setTimeout(()=>setI(i+1),120)};
 const reset=()=>{setAnswers([]);setI(0);setStarted(true)};
 return <div className="cal-shell"><AppSidebar/><main className="cal-main">
   <div className="cal-top"><span>NOZA / INTELLIGENCE SYSTEM</span><span>{started&&!done?String(i+1).padStart(2,'0')+' / '+String(qs.length).padStart(2,'0'):'BASELINE'}</span></div>
   {!started?<section className="cal-intro">
    <div className="cal-kicker"><i/> CALIBRAGEM INICIAL</div>
    <h1>Antes de evoluir sua performance,<br/><em>precisamos entender como você pensa.</em></h1>
    <p>A NOZA vai mapear como você interpreta situações, constrói argumentos, faz perguntas, influencia decisões e reage sob pressão.</p>
    <div className="cal-domains">{skills.map((s,n)=><span key={s}><b>0{n+1}</b>{s}</span>)}</div>
    <button className="cal-start" onClick={()=>setStarted(true)}>INICIAR CALIBRAGEM <b>→</b></button>
    <small>8 cenários · aproximadamente 4 minutos · sem respostas óbvias</small>
   </section>:!done?<section className="cal-test">
    <div className="cal-progress"><i style={{width:`${((i+1)/qs.length)*100}%`}}/></div>
    <div className="cal-code">CENÁRIO {String(i+1).padStart(2,'0')} <span>— {qs[i].tag}</span></div>
    <h2>{qs[i].q}</h2>
    <p className="cal-hint">Escolha a resposta mais próxima do que você realmente faria — não do que parece ideal.</p>
    <div className="cal-options">{qs[i].a.map((a,n)=><button key={a} onClick={()=>choose(n)}><b>{String.fromCharCode(65+n)}</b><span>{a}</span><i>↗</i></button>)}</div>
   </section>:<section className="cal-result">
    <div className="cal-kicker"><i/> BASELINE 01 CONCLUÍDO</div>
    <h1>Seu ponto de partida<br/><em>foi identificado.</em></h1>
    <p>Este é um retrato inicial. A NOZA vai confrontar esta calibragem com evidências reais das suas próximas interações.</p>
    <div className="cal-scoregrid">{skills.map(s=><div key={s}><header><span>{s}</span><b>{scores[s]}</b></header><div><i style={{width:`${scores[s]}%`}}/></div></div>)}</div>
    <div className="cal-insight"><span>PRIORIDADE INICIAL</span><strong>Investigação antes da argumentação.</strong><p>Seu padrão sugere espaço para aprofundar contexto e critérios antes de construir a resposta. A confiança deste diagnóstico aumentará com evidências reais.</p></div>
    <button className="cal-start" onClick={reset}>RECALIBRAR <b>↻</b></button>
   </section>}
 </main></div>
}