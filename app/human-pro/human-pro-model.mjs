const textOf=meeting=>[meeting.title,meeting.objective,meeting.phrase,meeting.summary,meeting.transcript].filter(Boolean).join(' ').toLowerCase();
const clean=value=>String(value||'').trim().replace(/\s+/g,' ');

export const HUMAN_PRO_PROMPTS=[
  'Onde estou errando?',
  'O que está me faltando?',
  'O que preciso aprender?',
  'O que preciso mudar?',
  'O que devo praticar?',
];

export function getHumanProPresentation(){
  return {
    title:'HUMAN PRO',
    subtitle:'',
    backdrop:'/human-pro-scene.png',
  };
}

export function getHumanScenePanels(){
  return [
    {id:'rear-console',kind:'console',position:'rear-top',depth:'rear',mediaSlots:1},
    {id:'left-workspace',kind:'workspace',position:'left-top',depth:'foreground',mediaSlots:5},
    {id:'left-call',kind:'call',position:'left-bottom',depth:'foreground',mediaSlots:3},
    {id:'right-insights',kind:'insights',position:'right',depth:'mid',mediaSlots:3},
    {id:'lower-console',kind:'console',position:'rear-bottom',depth:'rear',mediaSlots:2},
  ];
}

export function createHumanParticleField(count=72){
  let state=918273;
  const random=()=>{
    state=(state*1664525+1013904223)>>>0;
    return state/4294967296;
  };
  return Array.from({length:count},(_,index)=>({
    id:index,
    x:34+random()*62,
    y:43+random()*29,
    size:.7+random()*2.1,
    opacity:.22+random()*.58,
    duration:4.8+Math.round(random()*54)/10,
    delay:-random()*8,
    driftX:42+random()*94,
    driftY:(index%2?-1:1)*(2+random()*10),
  }));
}

export function shouldSubmitOnKeyDown({key,shiftKey=false,isComposing=false}){
  return key==='Enter'&&!shiftKey&&!isComposing;
}

const contexts=[
  {name:'Vendas e negociação',terms:['venda','vendas','cliente','fechar','fechamento','preço','preco','objeção','objecao','negociação','negociacao','proposta','investimento'],gap:'construção de valor, descoberta comercial e investigação de objeções'},
  {name:'Comunicação',terms:['comunicação','comunicacao','oratória','oratoria','clareza','apresentação','apresentacao','explicar','fala'],gap:'clareza, síntese e escuta ativa'},
  {name:'Liderança e gestão',terms:['liderança','lideranca','gestão','gestao','time','equipe','feedback','delegar','conflito'],gap:'liderança situacional, alinhamento e gestão de conflitos'},
  {name:'Conhecimento e aprendizagem',terms:['aprender','estudar','conhecimento','técnico','tecnico','habilidade','praticar'],gap:'prática deliberada e conhecimento aplicado'},
];

function pickContext(question,meetings){
  const corpus=`${question} ${meetings.map(textOf).join(' ')}`.toLowerCase();
  return contexts.map(context=>({...context,score:context.terms.filter(term=>corpus.includes(term)).length})).sort((a,b)=>b.score-a.score)[0];
}

function evidenceFrom(meetings){
  return meetings.slice(0,5).map(meeting=>({
    id:String(meeting.id||meeting.title||'reunião'),
    title:clean(meeting.title)||'Reunião analisada',
    excerpt:clean(meeting.phrase||meeting.summary||meeting.transcript)||'Registro disponível sem descrição detalhada.',
  }));
}

export function analyzePerformance(question,meetings=[]){
  const normalizedQuestion=clean(question);
  const usable=Array.isArray(meetings)?meetings.filter(meeting=>meeting&&typeof meeting==='object'):[];
  if(!usable.length){
    return {status:'insufficient-evidence',context:'Sem contexto',evidenceCount:0,summary:'Ainda não encontrei reuniões locais para sustentar uma análise. Abra ou registre reuniões na NOZA e volte aqui.',layers:[],recommendation:'O Human Pro não inventa um diagnóstico sem evidências.',evidence:[]};
  }

  const context=pickContext(normalizedQuestion,usable);
  const evidence=evidenceFrom(usable);
  const sales=context.name==='Vendas e negociação';
  const behavior=sales
    ?'Nas conversas relacionadas, a solução e os argumentos aparecem cedo; diante de resistência, a tendência é explicar mais em vez de investigar primeiro.'
    :`Há um padrão recorrente nas reuniões ligado a ${context.gap}. Os registros mostram que o comportamento muda quando a situação exige mais segurança e adaptação.`;
  const cause=sales
    ?'O padrão surge principalmente quando é necessário justificar valor ou conduzir uma decisão, não durante a apresentação do produto.'
    :'A variação parece depender do contexto da reunião e da pressão do momento, não de uma incapacidade geral.';
  const next=sales
    ?'Na próxima objeção, faça uma pergunta para entender a resistência antes de responder. Depois, conecte a solução ao impacto que o cliente acabou de revelar.'
    :`Escolha uma reunião próxima e pratique uma única mudança: pause, investigue o contexto e só então responda com foco em ${context.gap}.`;

  return {
    status:'ready',
    context:context.name,
    evidenceCount:usable.length,
    summary:sales?'Seu principal ponto de evolução aparece antes do fechamento: na descoberta e na construção de valor.':`Encontrei um padrão consistente em ${context.name.toLowerCase()} que merece atenção prática.`,
    layers:[
      {label:'O que está acontecendo',body:behavior},
      {label:'Por que provavelmente acontece',body:cause},
      {label:'O que está faltando',body:`A lacuna mais provável está em ${context.gap}.`},
      {label:'O que fazer agora',body:next},
    ],
    recommendation:sales?'Não começaria por técnicas de fechamento. Começaria por descoberta comercial e construção de valor.':`Priorize ${context.gap}; não tente desenvolver tudo ao mesmo tempo.`,
    evidence,
  };
}

export function createLocalChatReply(question,meetings=[]){
  const analysis=analyzePerformance(question,meetings);
  if(analysis.status==='insufficient-evidence'){
    return `${analysis.summary}\n\n${analysis.recommendation}`;
  }

  const sections=analysis.layers.map(layer=>`${layer.label}\n${layer.body}`).join('\n\n');
  return `${analysis.summary}\n\n${sections}\n\nMinha recomendação\n${analysis.recommendation}`;
}

export function createHistoryItem(question,result,now=Date.now()){
  return {id:`human-pro-${now}`,question:clean(question),summary:clean(result?.summary),context:clean(result?.context),createdAt:now};
}

export function parseHistory(raw){
  try{
    const value=JSON.parse(raw||'[]');
    if(!Array.isArray(value))return [];
    return value.filter(item=>item&&typeof item.id==='string'&&typeof item.question==='string'&&typeof item.summary==='string'&&typeof item.context==='string'&&Number.isFinite(item.createdAt));
  }catch{return []}
}
