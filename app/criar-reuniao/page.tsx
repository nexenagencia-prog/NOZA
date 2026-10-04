'use client';

import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowRight,BrainCircuit,BriefcaseBusiness,CalendarDays,Check,ChevronRight,CircleDollarSign,GraduationCap,Handshake,Mic2,Plus,Presentation,Target,Users,X} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import AppTopbar from '../AppTopbar';
import './criar-reuniao.css';

const members=[
  {id:'m1',name:'Amanda Costa',role:'Marketing',image:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=82'},
  {id:'m2',name:'Marcus Lima',role:'Comercial',image:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=82'},
  {id:'m3',name:'Julia Alves',role:'Produto',image:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=82'},
  {id:'m4',name:'Eric Martins',role:'Cliente',image:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=82'},
];

const types=[
  {id:'venda',label:'Venda',Icon:CircleDollarSign,skills:['Investigação','Persuasão','Objeções','Decisão']},
  {id:'negociacao',label:'Negociação',Icon:Handshake,skills:['Investigação','Influência','Flexibilidade','Decisão']},
  {id:'apresentacao',label:'Apresentação',Icon:Presentation,skills:['Clareza','Argumentação','Influência','Comunicação']},
  {id:'aula',label:'Aula / Mentoria',Icon:GraduationCap,skills:['Clareza','Comunicação','Percepção','Repertório']},
  {id:'entrevista',label:'Entrevista',Icon:Mic2,skills:['Percepção','Investigação','Clareza','Raciocínio']},
  {id:'alinhamento',label:'Alinhamento',Icon:Users,skills:['Escuta','Clareza','Decisão','Comunicação']},
  {id:'personalizado',label:'Outro contexto',Icon:BriefcaseBusiness,skills:['Percepção','Investigação','Comunicação','Decisão']},
];

type DeepAnswers={decisionCriteria:string;likelyObjection:string;evidence:string;minimumCommitment:string;opening:string};
const emptyDeep:DeepAnswers={decisionCriteria:'',likelyObjection:'',evidence:'',minimumCommitment:'',opening:''};
function diagnoseMeeting(input:{type:string;person:string;goal:string;context:string;deep:DeepAnswers;skills:string[]}){
  const {type,person,goal,context,deep,skills}=input;
  const answers=[person,goal,context,deep.decisionCriteria,deep.likelyObjection,deep.evidence,deep.minimumCommitment,deep.opening];
  const score=answers.filter(value=>value.trim().length>0).length;
  const missing:string[]=[];
  if(!person.trim())missing.push('definir quem estará do outro lado e qual é a relação com essa pessoa');
  if(!goal.trim())missing.push('transformar o objetivo em um resultado observável');
  if(!context.trim())missing.push('registrar o histórico e o contexto que podem mudar a conversa');
  if(!deep.decisionCriteria.trim())missing.push('entender quais critérios pesam na decisão');
  if(!deep.likelyObjection.trim())missing.push('antecipar dúvidas ou resistências');
  if(!deep.evidence.trim())missing.push('separar evidências e exemplos que sustentam sua proposta');
  if(!deep.minimumCommitment.trim())missing.push('definir qual próximo compromisso seria um bom avanço');
  if(!deep.opening.trim())missing.push('planejar uma abertura que crie alinhamento');
  const level=score>=6?'Bem direcionada':score>=3?'Em construção':'Precisa de foco';
  const diagnosis=score>=6
    ?'O briefing conecta objetivo, contexto e dinâmica de decisão. Você tem base para conduzir uma conversa de '+type.toLowerCase()+' com intenção e terminar com um próximo passo claro.'
    :score>=3
      ?'Já existe uma direção para a conversa, mas alguns pontos importantes ainda estão em aberto. Preencha as lacunas para reduzir improviso e chegar a um próximo passo concreto.'
      :'Ainda há pouca informação para orientar a conversa com precisão. Comece pelo resultado que você quer produzir e pelo contexto da outra pessoa.';
  const nextStep=deep.minimumCommitment.trim()||'Feche a conversa combinando uma ação, uma pessoa responsável e uma data para o próximo passo.';
  return {score,total:answers.length,level,diagnosis,missing,goal:goal.trim()||'Defina o resultado observável que precisa alcançar.',risk:deep.likelyObjection.trim()||'Nenhuma resistência foi registrada. Pergunte o que ainda pode impedir a decisão antes de apresentar a solução.',evidence:deep.evidence.trim()||'Separe um exemplo, dado ou caso concreto que conecte sua proposta à necessidade da outra pessoa.',criteria:deep.decisionCriteria.trim()||'Investigue quais critérios a pessoa usará para decidir e o que precisa ficar claro para avançar.',opening:deep.opening.trim()||'Comece confirmando a prioridade da outra pessoa e peça permissão para alinhar o resultado esperado.',nextStep,skills};
}

export default function CriarReuniao(){
  const router=useRouter();
  const[type,setType]=useState('venda');
  const[person,setPerson]=useState('');
  const[goal,setGoal]=useState('');
  const[meetingDate,setMeetingDate]=useState('');
  const[meetingTime,setMeetingTime]=useState('');
  const[subject,setSubject]=useState('');
  const[context,setContext]=useState('');
  const[selectedSkills,setSelectedSkills]=useState<string[]>([]);
  const[selectedMembers,setSelectedMembers]=useState<string[]>([]);
  const[memberName,setMemberName]=useState('');
  const[deepOpen,setDeepOpen]=useState(false);
  const[deep,setDeep]=useState<DeepAnswers>(emptyDeep);
  const[showDiagnosis,setShowDiagnosis]=useState(false);
  const[notice,setNotice]=useState('');
  const[saving,setSaving]=useState(false);
  const current=useMemo(()=>types.find(item=>item.id===type)||types[0],[type]);
  const skills=selectedSkills.length?selectedSkills:current.skills;
  const toggleMember=(id:string)=>setSelectedMembers(list=>list.includes(id)?list.filter(item=>item!==id):[...list,id]);
  const toggle=(skill:string)=>setSelectedSkills(list=>list.includes(skill)?list.filter(item=>item!==skill):[...list,skill]);
  const diagnosis=useMemo(()=>diagnoseMeeting({type:current.label,person,goal,context,deep,skills}),[current.label,person,goal,context,deep,skills]);
  const payload=()=>({id:'meeting-'+Date.now(),type:current.label,person,goal,context,skills,deep,members:members.filter(member=>selectedMembers.includes(member.id)),date:meetingDate,time:meetingTime,subject:subject.trim()||goal.trim()||current.label,diagnosis,createdAt:new Date().toISOString()});
  const storePreparation=()=>{const data=payload();try{localStorage.setItem('noza-meeting-preparation',JSON.stringify(data));localStorage.setItem('noza-meeting-skills',JSON.stringify(skills))}catch{}return data};
  const savePreparation=()=>{storePreparation();setShowDiagnosis(true);setNotice('Preparação salva. Você pode voltar a ela quando quiser.')};
  const enterSpace=()=>{storePreparation();router.push('/space')};
  const addToAgenda=async()=>{if(saving)return;if(!meetingDate||!meetingTime){setNotice('Escolha a data e o horário para adicionar esta reunião à Agenda.');return}setSaving(true);setNotice('');try{const startsAt=new Date(meetingDate+'T'+meetingTime+':00');if(!Number.isFinite(startsAt.getTime()))throw Error('Confira a data e o horário da reunião.');const endsAt=new Date(startsAt.getTime()+45*60000);const {createClient}=await import('../../lib/supabase/client');const client=createClient();const {data:{user}}=await client.auth.getUser();if(!user)throw Error('Entre na sua conta para adicionar à Agenda.');const prepared=storePreparation();const {data,error}=await client.from('meetings').insert({creator_id:user.id,subject:prepared.subject,starts_at:startsAt.toISOString(),analysis:{agendaStatus:'scheduled',agendaEndsAt:endsAt.toISOString(),agendaObjective:goal.trim(),agendaLocation:'',type:current.label,person,goal,context,skills,participants:prepared.members,deep,diagnosis}}).select('id').single();if(error||!data)throw Error('Não foi possível salvar na Agenda. Confira sua conexão e tente novamente.');setNotice('Reunião adicionada à Agenda para '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(startsAt)+'. Ela não foi iniciada no Space.')}catch(error){setNotice(error instanceof Error?error.message:'Não foi possível adicionar à Agenda.')}finally{setSaving(false)}};
  const updateDeep=(key:keyof DeepAnswers,value:string)=>setDeep(current=>({...current,[key]:value}));

  return <main className="app-shell meeting-create-page">
    <AppSidebar/>
    <section className="content meeting-create-content">
      <AppTopbar nextLabel="PREPARAÇÃO" nextDateTime="Performance antes da reunião"/>
      <div className="meeting-create-shell">
        <header className="meeting-create-hero">
          <div><span className="meeting-kicker">PERFORMANCE INTELLIGENCE</span><h1>Prepare sua próxima conversa.</h1><p>A NOZA usa o contexto da reunião para identificar quais Skills podem ajudar você a alcançar o resultado que busca.</p></div>
          <div className="meeting-intelligence"><BrainCircuit/><span>CONTEXTO → SKILLS → PERFORMANCE</span></div>
        </header>

        <section className="meeting-create-grid">
          <div className="meeting-form-card">
            <div className="meeting-step"><span>01</span><div><strong>Que tipo de reunião é essa?</strong><small>Isso orienta quais capacidades serão mais importantes.</small></div></div>
            <div className="meeting-type-grid">{types.map(({id,label,Icon})=><button key={id} className={type===id?'active':''} onClick={()=>{setType(id);setSelectedSkills([])}}><Icon/><span>{label}</span>{type===id&&<Check/>}</button>)}</div>

            <div className="meeting-fields">
              <label><span>00</span><div><strong>Quando e sobre o quê?</strong><small>Estas são as informações compartilhadas com os participantes convidados.</small></div><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Assunto da reunião"/><div className="meeting-date-time"><input aria-label="Data da reunião" type="date" value={meetingDate} onChange={e=>setMeetingDate(e.target.value)}/><input aria-label="Horário da reunião" type="time" value={meetingTime} onChange={e=>setMeetingTime(e.target.value)}/></div></label>
              <label><span>02</span><div><strong>Com quem você vai falar?</strong><small>Pessoa, cliente, empresa ou equipe.</small></div><input value={person} onChange={e=>setPerson(e.target.value)} placeholder="Ex.: cliente de marketing"/></label>
              <label><span>03</span><div><strong>O que você precisa conseguir?</strong><small>Defina o resultado real que deseja produzir.</small></div><textarea value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Ex.: avançar para o fechamento sem reduzir o preço."/></label>
              <label><span>04</span><div><strong>O que a NOZA precisa saber antes?</strong><small>Resistências, histórico, riscos ou qualquer contexto importante.</small></div><textarea value={context} onChange={e=>setContext(e.target.value)} placeholder="Ex.: o cliente já demonstrou resistência ao preço e adiou a decisão."/></label>
              <button type="button" className="meeting-deep-toggle" aria-expanded={deepOpen} onClick={()=>setDeepOpen(value=>!value)}><span><BrainCircuit/>{deepOpen?'Ocultar perguntas profundas':'Fazer perguntas profundas'}</span><ChevronRight className={deepOpen?'rotated':''}/></button>
              {deepOpen&&<div className="meeting-deep-questions">
                <label><span>+</span><div><strong>O que essa pessoa considera para decidir?</strong><small>Critérios, prioridades ou condições que pesam na escolha.</small></div><textarea value={deep.decisionCriteria} onChange={e=>updateDeep('decisionCriteria',e.target.value)} placeholder="Ex.: prazo, retorno esperado e segurança na implementação."/></label>
                <label><span>+</span><div><strong>Que dúvida ou resistência pode surgir?</strong><small>Antecipe o ponto que pode travar o avanço.</small></div><textarea value={deep.likelyObjection} onChange={e=>updateDeep('likelyObjection',e.target.value)} placeholder="Ex.: receio de custo, prazo ou dificuldade para mudar o processo."/></label>
                <label><span>+</span><div><strong>Que evidência sustenta sua proposta?</strong><small>Exemplos, dados ou resultados que conectam solução e necessidade.</small></div><textarea value={deep.evidence} onChange={e=>updateDeep('evidence',e.target.value)} placeholder="Ex.: um caso semelhante com resultado e prazo verificáveis."/></label>
                <label><span>+</span><div><strong>Qual avanço concreto já seria produtivo?</strong><small>Defina o compromisso mínimo para a conversa terminar com progresso.</small></div><textarea value={deep.minimumCommitment} onChange={e=>updateDeep('minimumCommitment',e.target.value)} placeholder="Ex.: validar uma proposta e marcar a conversa final com quem decide."/></label>
                <label><span>+</span><div><strong>Como você quer abrir a conversa?</strong><small>Uma pergunta ou alinhamento que ajude a criar confiança.</small></div><textarea value={deep.opening} onChange={e=>updateDeep('opening',e.target.value)} placeholder="Ex.: perguntar qual resultado tornaria esse encontro útil."/></label>
              </div>}
            </div>
            <div className="meeting-members">
              <div className="meeting-step"><span>05</span><div><strong>Quem vai participar?</strong><small>Adicione membros para preparar a reunião com o contexto certo.</small></div></div>
              <div className="meeting-member-grid">{members.map(member=><button key={member.id} className={selectedMembers.includes(member.id)?'active':''} onClick={()=>toggleMember(member.id)}><img src={member.image} alt=""/><span><strong>{member.name}</strong><small>{member.role}</small></span>{selectedMembers.includes(member.id)?<Check/>:<Plus/>}</button>)}</div>
              <div className="meeting-member-add"><input value={memberName} onChange={e=>setMemberName(e.target.value)} placeholder="Nome ou e-mail de outro participante"/><button onClick={()=>{if(memberName.trim()){setPerson(value=>value||memberName.trim());setMemberName('')}}}><Plus/>Adicionar</button></div>
              {selectedMembers.length>0&&<div className="meeting-selected-members">{members.filter(member=>selectedMembers.includes(member.id)).map(member=><span key={member.id}><img src={member.image} alt=""/>{member.name}<button onClick={()=>toggleMember(member.id)} aria-label={'Remover '+member.name}><X/></button></span>)}</div>}
            </div>
          </div>

          <aside className="meeting-skills-card">
            <div className="meeting-skills-head"><BrainCircuit/><div><span>SKILLS DA REUNIÃO</span><strong>Foco recomendado</strong></div></div>
            <p>Para uma reunião de <b>{current.label.toLowerCase()}</b>, estas são as capacidades que a NOZA deve observar com mais atenção.</p>
            <div className="meeting-skill-list">{current.skills.map((skill,index)=><button key={skill} className={skills.includes(skill)?'active':''} onClick={()=>toggle(skill)}><span>{String(index+1).padStart(2,'0')}</span><strong>{skill}</strong><Check/></button>)}</div>
            <div className="meeting-readout"><Target/><div><small>OBJETIVO DE PERFORMANCE</small><p>{goal.trim()||'Defina o resultado desejado para a NOZA conectar contexto, comportamento e Skills.'}</p></div></div>
            {showDiagnosis&&<section className="meeting-diagnosis" aria-live="polite"><div className="meeting-diagnosis-head"><span><BrainCircuit/>LEITURA DA PREPARAÇÃO</span><strong>{diagnosis.level}</strong></div><div className="meeting-coverage"><div><span>Respostas mapeadas</span><b>{diagnosis.score}/{diagnosis.total}</b></div><i><em style={{width:(diagnosis.score/diagnosis.total*100)+'%'}}/></i></div><p className="meeting-diagnosis-summary">{diagnosis.diagnosis}</p><div className="meeting-diagnosis-block"><small>RESULTADO A BUSCAR</small><p>{diagnosis.goal}</p></div><div className="meeting-diagnosis-block"><small>CRITÉRIO DE DECISÃO</small><p>{diagnosis.criteria}</p></div><div className="meeting-diagnosis-block"><small>RISCO PARA ANTECIPAR</small><p>{diagnosis.risk}</p></div><div className="meeting-diagnosis-block"><small>LINHA DE CONDUÇÃO</small><p>{diagnosis.opening} Traga a evidência no momento certo e feche combinando: {diagnosis.nextStep}</p></div><div className="meeting-diagnosis-block"><small>SKILLS PARA OBSERVAR</small><p>{skills.join(' · ')}</p></div>{diagnosis.missing.length>0&&<div className="meeting-diagnosis-gaps"><small>PARA AUMENTAR A PRECISÃO</small><p>{diagnosis.missing.slice(0,3).map(item=>'• '+item).join('  ')}</p></div>}</section>}
            <div className="meeting-note">O diagnóstico usa as respostas deste briefing para organizar foco, riscos e próximos passos. Ele pode ser refinado enquanto você preenche.</div>
            <button className="meeting-analyze" onClick={()=>setShowDiagnosis(true)}><span>{showDiagnosis?'Atualizar análise':'Analisar preparação'}</span><BrainCircuit/></button>
            <button className="meeting-primary" onClick={()=>void addToAgenda()} disabled={saving}><span>{saving?'Adicionando…':'Adicionar à Agenda'}</span><CalendarDays/></button>
            <button className="meeting-secondary" onClick={savePreparation}><span>Salvar preparação</span><Check/></button>
            <button className="meeting-secondary" onClick={enterSpace}><span>Entrar direto no Space</span><ChevronRight/></button>
            {notice&&<p className="meeting-create-notice" role="status">{notice}</p>}
          </aside>
        </section>
      </div>
    </section>
  </main>;
}
