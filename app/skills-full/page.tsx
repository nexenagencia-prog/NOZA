'use client';
import {useEffect,useState} from 'react';
import dynamic from 'next/dynamic';
import AppSidebar from '../AppSidebar';
import {BrainCircuit,ChevronRight,Search,Target,Database,Layers3,Stars,HeartPulse,MessageCircleMore,Telescope,UsersRound,Zap,Activity,ScanLine,ChartNoAxesColumnIncreasing} from 'lucide-react';
import './skills-full.css';

const Brain3D=dynamic(()=>import('./Brain3D'),{ssr:false});
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

const feedbacks:any={
 foco:{impact:'+73%',lead:'Você está tentando construir confiança durante a argumentação. Para este perfil, ela precisa existir antes dela.',read:'Ele tende a decidir quando consegue relacionar a proposta ao próprio contexto: rotina, responsabilidades, experiências anteriores e riscos que já reconhece.',change:'Entre primeiro no universo de decisão dele. Se você sabe que a empresa está crescendo, descubra o que esse crescimento está exigindo: tempo, equipe, controle, previsibilidade ou segurança. Use isso para construir rapport real — não como assunto decorativo.',path:'Contexto → identificação → confiança → autoridade → proposta → decisão.'},
 memoria:{impact:'+68%',lead:'Você entrega informação nova antes de reativar aquilo que o cliente já validou. Isso enfraquece a continuidade da decisão.',read:'A pessoa interpreta uma proposta a partir de referências que já possui. Recuperar uma experiência, prioridade ou frase anterior reduz o esforço para compreender o próximo argumento.',change:'Antes de apresentar um novo benefício, recupere uma memória relevante da conversa: “Você comentou que no último trimestre perdeu tempo justamente nisso…”. A nova informação passa a se conectar a algo que ele já reconhece como verdadeiro.',path:'Memória anterior → reconhecimento → associação → novo argumento → decisão.'},
 disciplina:{impact:'+71%',lead:'Sua condução muda quando o cliente muda de assunto. Você acompanha a conversa, mas perde o objetivo que deveria organizá-la.',read:'O cliente abre frentes a partir das próprias preocupações. Seu papel não é bloquear essas frentes, mas conectá-las ao critério central de decisão.',change:'Defina antes da reunião qual comportamento indicará avanço. Quando surgir uma tangente, acolha, responda e faça a ponte de volta: “Isso se conecta diretamente ao ponto que você trouxe sobre…”. Você preserva rapport sem entregar a direção.',path:'Objetivo → escuta → desvio → ponte → retomada → compromisso.'},
 criatividade:{impact:'+66%',lead:'Você usa exemplos corretos, mas previsíveis. Eles explicam a solução; não fazem o cliente enxergá-la dentro da própria realidade.',read:'A compreensão aumenta quando a pessoa consegue simular uma situação concreta com elementos familiares do próprio cotidiano.',change:'Transforme benefícios em cenários personalizados. Use equipe, rotina, clientes, prazos ou situações que ele já mencionou e construa um “e se” específico. Use apenas contexto realmente revelado na conversa.',path:'Contexto conhecido → cenário → simulação mental → relevância → valor.'},
 emocional:{impact:'+76%',lead:'Quando aparece resistência, você acelera a explicação. Isso pode transmitir urgência justamente quando o cliente procura segurança.',read:'Objeções muitas vezes revelam risco percebido. Antes de responder ao conteúdo, identifique o estado que organiza a resistência: insegurança, perda de controle, exposição ou medo de errar.',change:'Diminua o ritmo e nomeie o risco sem dramatizar: “Pelo que entendi, sua preocupação não é o investimento; é colocar a equipe numa mudança que possa gerar atrito. É isso?”. Quando ele confirma, responda ao risco real.',path:'Sinal emocional → validação → risco real → segurança → argumento → avanço.'},
 comunicacao:{impact:'+79%',lead:'Sua mensagem é clara, mas você ainda fala na arquitetura da sua solução. O cliente decide na arquitetura do problema dele.',read:'Funcionalidades e processos exigem tradução. A mensagem ganha força quando cada conceito é conectado a uma consequência reconhecível no cotidiano.',change:'Troque “recurso → explicação” por “situação dele → consequência → recurso”. Use palavras que o cliente já empregou para descrever o problema, sem imitá-lo artificialmente.',path:'Linguagem do cliente → problema → consequência → solução → confirmação.'},
 visao:{impact:'+70%',lead:'Você apresenta o futuro como promessa da solução. O futuro é mais convincente quando o próprio cliente ajuda a construí-lo.',read:'Quando a pessoa projeta consequências usando a própria realidade, começa a comparar dois futuros: permanecer como está ou mudar.',change:'Faça o cliente projetar primeiro: “Se isso estiver resolvido daqui a seis meses, o que muda na sua rotina?”. Depois conecte a proposta aos elementos que ele colocou nesse futuro.',path:'Presente → projeção → futuro verbalizado → contraste → caminho → decisão.'},
 lideranca:{impact:'+74%',lead:'Você tenta demonstrar autoridade explicando mais. Em conversas de decisão, autoridade também aparece na capacidade de organizar complexidade.',read:'Quem lidera a conversa percebe interesses diferentes, sintetiza tensões e cria um próximo passo que faça sentido para os envolvidos.',change:'Mapeie quem influencia, quem usa, quem aprova e quem assume o risco. Devolva uma síntese que inclua essas perspectivas. Você demonstra compreensão do sistema da decisão, não apenas do produto.',path:'Atores → interesses → tensão → síntese → direção → compromisso.'},
 produtividade:{impact:'+72%',lead:'Você trata produtividade como quantidade de informação entregue. Na reunião, produtividade é reduzir a distância entre conversa e próximo movimento.',read:'Toda explicação que não altera compreensão, risco ou decisão adiciona carga sem produzir avanço.',change:'Depois de cada bloco importante, faça um checkpoint: o que ficou resolvido, o que ainda impede avanço e qual é o próximo passo. Se o cliente já compreendeu, pare de adicionar argumentos.',path:'Informação → compreensão → checkpoint → impedimento → próximo passo.'}
};

export default function Page(){
 const [profileAvatar,setProfileAvatar]=useState('');
 useEffect(()=>{
   const readAvatar=()=>{
     try{setProfileAvatar(localStorage.getItem('zyvo-profile-avatar')||'')}catch{setProfileAvatar('')}
   };
   readAvatar();
   window.addEventListener('storage',readAvatar);
   window.addEventListener('focus',readAvatar);
   return()=>{window.removeEventListener('storage',readAvatar);window.removeEventListener('focus',readAvatar)}
 },[]);


 const[active,setActive]=useState(skills[0]);
 const insight=feedbacks[active.id]||feedbacks.foco;
 return <main className="sp-shell"><AppSidebar/><div className="sp-page">
  <header className="sp-header">
   <div><div className="sci-class">NOZA / HUMAN PERFORMANCE / SKILLS FULL</div><h1>Skills Pro</h1><p>Leitura comportamental aplicada à evolução de performance.</p></div>
   <label><Search/><input placeholder="Buscar habilidade"/><kbd>⌘ K</kbd></label>
   <div className="sp-status"><Activity/><span>LIVE ANALYSIS</span><b>03</b></div>
  </header>
  <div className="sp-grid">
   <nav className="sp-skills">{skills.map((s)=>{const Icon=icons[s.id];return <button key={s.id} className={active.id===s.id?'active':''} onClick={()=>setActive(s)}>
    <span className="sp-icon"><Icon/></span><span className="sp-skillcopy"><b>{s.name}</b><small>{s.tag}</small></span><span className="sp-skillstate">{active.id===s.id?'ACTIVE':'VIEW'}</span>
   </button>})}</nav>
   <section className="sp-brain">
    <Brain3D active={active.id} color={active.color}/>
    <div className="sci-hud" aria-hidden="true">
      <span className="sci-corner tl">NOZA // COGNITIVE MAP</span><span className="sci-corner tr">SCAN // 03</span>
      <div className="sci-axis axis-x"/><div className="sci-axis axis-y"/><div className="sci-reticle"><ScanLine/></div>
      <div className="sci-meter meter-a"><small>NEURAL SIGNAL</small><b>0.873</b><em><i style={{width:'87%'}}/></em></div>
      <div className="sci-meter meter-b"><small>BEHAVIOR INDEX</small><b>73.4</b><em><i style={{width:'73%'}}/></em></div>
      <div className="sci-coord">X 042.18 / Y 018.72 / Z 006.31</div>
      <svg className="sci-wave" viewBox="0 0 260 48" preserveAspectRatio="none"><polyline points="0,28 18,27 27,15 35,37 44,24 63,26 72,10 81,39 91,25 111,27 121,18 130,32 141,23 161,25 172,13 181,36 191,24 212,27 225,19 236,30 260,24"/></svg>
    </div>
    <div className="sp-label l1"><b>{active.region}</b><span>{active.desc}</span></div>
    <div className="sp-label l2"><b>Sistema Límbico</b><span>Emoções e motivação</span></div>
    <div className="sp-label l3"><b>Cerebelo</b><span>Coordenação e aprendizado</span></div>
    <div className="sp-view">ARRASTE PARA EXPLORAR / 360°</div>
    <div className="sp-switch"><button className="selected">Visão lateral</button><button>Visão frontal</button><button>Visão superior</button></div>
   </section>
   <aside className="sp-panel sp-panel-intelligence">
    <div className="panel-head"><span className="sp-pill">SKILL EM DESTAQUE</span><span>NOZA INTELLIGENCE</span><b>•••</b></div>
    <h2>{active.name}</h2><p className="sp-sub">{active.tag}</p>
    <div className="sp-impact"><span>Impacto observado</span><b>{insight.impact}</b></div>
    <section className="intel-block intel-primary"><span className="intel-label">LEITURA DO SEU COMPORTAMENTO</span><p>{insight.lead}</p></section>
    <section className="intel-block"><span className="intel-label">COMO ESSA DECISÃO SE FORMA</span><p>{insight.read}</p></section>
    <section className="intel-block intel-change"><span className="intel-label">O QUE VOCÊ PRECISA MUDAR</span><p>{insight.change}</p></section>
    <div className="intel-path"><BrainCircuit/><div><span>PRÓXIMA CONDUÇÃO</span><b>{insight.path}</b></div></div>
    <button className="sp-cta sp-cta-scientific">INICIAR TREINAMENTO <ChevronRight/></button>
    <div className="sp-science"><BrainCircuit/><div><b>Base de referência</b><p>Sinais observáveis das reuniões. A visualização cerebral é educativa e não representa diagnóstico neurológico.</p></div></div>
   </aside>
  </div>
  <footer><div className="foot-stat"><div className="foot-profile">{profileAvatar?<img src={profileAvatar} alt="Foto do perfil"/>:<span/>}</div><ChartNoAxesColumnIncreasing/><span>PERFORMANCE INDEX</span><b>73.4</b></div><div className="foot-bars">{Array.from({length:34},(_,i)=><i key={i} style={{height:`${10+((i*13)%24)}px`}}/> )}</div><p>Performance longitudinal baseada em padrões recorrentes.<small>NOZA INTELLIGENCE / SESSION 024</small></p></footer>
 </div></main>
}