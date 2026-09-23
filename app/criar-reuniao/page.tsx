'use client';

import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowRight,BrainCircuit,BriefcaseBusiness,Check,ChevronRight,CircleDollarSign,GraduationCap,Handshake,Mic2,Plus,Presentation,Target,Users,X} from 'lucide-react';
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
  const current=useMemo(()=>types.find(item=>item.id===type)||types[0],[type]);
  const skills=selectedSkills.length?selectedSkills:current.skills;
  const toggleMember=(id:string)=>setSelectedMembers(list=>list.includes(id)?list.filter(item=>item!==id):[...list,id]);
  const toggle=(skill:string)=>setSelectedSkills(list=>list.includes(skill)?list.filter(item=>item!==skill):[...list,skill]);
  const prepare=()=>{const invited=members.filter(member=>selectedMembers.includes(member.id));const payload={id:'meeting-'+Date.now(),type:current.label,person,goal,context,skills,members:invited,date:meetingDate,time:meetingTime,subject:subject.trim()||goal.trim()||current.label,createdAt:new Date().toISOString()};const invite={meetingId:payload.id,date:meetingDate,time:meetingTime,subject:payload.subject,participants:invited.map(member=>({id:member.id,name:member.name,image:member.image})),status:'pending'};try{localStorage.setItem('noza-meeting-preparation',JSON.stringify(payload));localStorage.setItem('noza-meeting-skills',JSON.stringify(skills));localStorage.setItem('noza-last-meeting-invite',JSON.stringify(invite));const queue=JSON.parse(localStorage.getItem('noza-meeting-invites')||'[]');localStorage.setItem('noza-meeting-invites',JSON.stringify([invite,...queue].slice(0,50)))}catch{}router.push('/space')};

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
            <div className="meeting-note">Depois da reunião, a NOZA poderá confrontar o objetivo declarado com os padrões observados e usar isso na sua evolução.</div>
            <button className="meeting-primary" onClick={prepare}><span>Preparar reunião</span><ArrowRight/></button>
            <button className="meeting-secondary" onClick={()=>router.push('/space')}>Entrar direto no Space <ChevronRight/></button>
          </aside>
        </section>
      </div>
    </section>
  </main>;
}
