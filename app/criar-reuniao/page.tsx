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

type InviteGuest={name?:string;email:string};
type DeepAnswers={desiredOutcome:string;targetPrice:string;valueDifferentiator:string;proofPoints:string;profileUrl:string;decisionMaker:string;urgency:string;alternatives:string;objection:string;nextStep:string;opening:string};
const emptyDeep:DeepAnswers={desiredOutcome:'',targetPrice:'',valueDifferentiator:'',proofPoints:'',profileUrl:'',decisionMaker:'',urgency:'',alternatives:'',objection:'',nextStep:'',opening:''};
function diagnoseMeeting(input:{type:string;person:string;goal:string;context:string;deep:DeepAnswers;skills:string[]}){
  const {type,person,goal,context,deep,skills}=input;
  const isSales=type.toLowerCase().includes('venda');
  const answers=[person,goal,context,deep.desiredOutcome,...(isSales?[deep.targetPrice]:[]),deep.valueDifferentiator,deep.proofPoints,deep.decisionMaker,deep.urgency,deep.alternatives,deep.objection,deep.nextStep,deep.opening];
  const score=answers.filter(value=>value.trim().length>0).length,total=answers.length;
  const missing:string[]=[];
  if(!person.trim())missing.push('identificar a pessoa, seu papel e a relação com você');
  if(!goal.trim()&&!deep.desiredOutcome.trim())missing.push('definir o resultado concreto que você quer obter');
  if(!context.trim())missing.push('registrar histórico, necessidade e contexto relevante');
  if(isSales&&!deep.targetPrice.trim())missing.push('definir preço, faixa de negociação e limite mínimo');
  if(!deep.valueDifferentiator.trim())missing.push('explicar por que sua solução tem valor próprio frente às alternativas');
  if(!deep.proofPoints.trim())missing.push('reunir evidências, resultados ou exemplos que sustentem sua proposta');
  if(!deep.decisionMaker.trim())missing.push('mapear quem decide e quem influencia a decisão');
  if(!deep.urgency.trim())missing.push('entender prioridade, prazo e custo de adiar');
  if(!deep.alternatives.trim())missing.push('descobrir o que a pessoa compara ou usa hoje');
  if(!deep.objection.trim())missing.push('antecipar a principal dúvida que pode impedir o avanço');
  if(!deep.nextStep.trim())missing.push('definir próximo passo, responsável e prazo');
  if(!deep.opening.trim())missing.push('preparar uma pergunta inicial que revele a necessidade real');
  const level=score>=Math.ceil(total*.75)?'Bem direcionada':score>=Math.ceil(total*.4)?'Em construção':'Precisa de foco';
  const diagnosis=score>=Math.ceil(total*.75)
    ?'A preparação conecta objetivo, valor, decisão e avanço esperado. Use os dados informados para conduzir a conversa e confirmar as hipóteses com a outra pessoa.'
    :score>=Math.ceil(total*.4)
      ?'Já existe uma direção, mas faltam dados para sustentar valor e prever como a decisão será tomada. Feche as lacunas prioritárias antes de apresentar a proposta.'
      :'Ainda há pouca informação para orientar a conversa com precisão. Comece pelo resultado desejado, pela necessidade da outra pessoa e pelo critério de decisão.';
  const nextStep=deep.nextStep.trim()||'Combine uma ação, uma pessoa responsável e uma data para o próximo passo.';
  return {score,total,level,diagnosis,missing,goal:deep.desiredOutcome.trim()||goal.trim()||'Defina o resultado observável que precisa alcançar.',risk:deep.objection.trim()||deep.alternatives.trim()||'Investigue o que ainda impede a decisão antes de apresentar a solução.',evidence:deep.proofPoints.trim()||'Separe um exemplo, dado ou caso verificável que conecte a proposta à necessidade.',criteria:[deep.decisionMaker.trim(),deep.urgency.trim()].filter(Boolean).join(' · ')||'Descubra quem decide, o que pesa na escolha e até quando a decisão precisa acontecer.',opening:deep.opening.trim()||'Abra perguntando qual resultado tornaria a conversa valiosa para a outra pessoa.',nextStep,skills,differentiator:deep.valueDifferentiator.trim()||'Explicite a diferença relevante para a necessidade da pessoa.',targetPrice:deep.targetPrice.trim(),profileUrl:deep.profileUrl.trim()};
}

export default function CriarReuniao(){export default function CriarReuniao(){
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
  const[inviteGuests,setInviteGuests]=useState<InviteGuest[]>([]);
  const[deepOpen,setDeepOpen]=useState(false);
  const[deep,setDeep]=useState<DeepAnswers>(emptyDeep);
  const[showDiagnosis,setShowDiagnosis]=useState(false);
  const[aiDiagnosis,setAiDiagnosis]=useState('');
  const[analyzing,setAnalyzing]=useState(false);
  const[notice,setNotice]=useState('');
  const[saving,setSaving]=useState(false);
  const current=useMemo(()=>types.find(item=>item.id===type)||types[0],[type]);
  const skills=selectedSkills.length?selectedSkills:current.skills;
  const toggleMember=(id:string)=>setSelectedMembers(list=>list.includes(id)?list.filter(item=>item!==id):[...list,id]);
  const toggle=(skill:string)=>setSelectedSkills(list=>list.includes(skill)?list.filter(item=>item!==skill):[...list,skill]);
  const diagnosis=useMemo(()=>diagnoseMeeting({type:current.label,person,goal,context,deep,skills}),[current.label,person,goal,context,deep,skills]);
  const payload=()=>({id:'meeting-'+Date.now(),type:current.label,person,goal,context,skills,deep,guests:inviteGuests,members:members.filter(member=>selectedMembers.includes(member.id)),date:meetingDate,time:meetingTime,subject:subject.trim()||goal.trim()||current.label,diagnosis,createdAt:new Date().toISOString()});
  const storePreparation=()=>{const data=payload();try{localStorage.setItem('noza-meeting-preparation',JSON.stringify(data));localStorage.setItem('noza-meeting-skills',JSON.stringify(skills))}catch{}return data};
  const savePreparation=()=>{storePreparation();setShowDiagnosis(true);setNotice('Preparação salva. Você pode voltar a ela quando quiser.')};
  const enterSpace=()=>{storePreparation();router.push('/space')};
  const addInviteGuest=()=>{const email=memberName.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setNotice('Digite um e-mail válido para enviar o convite.');return}if(inviteGuests.some(guest=>guest.email===email)){setNotice('Esse e-mail já está na lista de convidados.');return}if(inviteGuests.length>=20){setNotice('A reunião aceita até 20 convidados por e-mail.');return}setInviteGuests(list=>[...list,{email,name:email.split('@')[0]}]);setMemberName('');setNotice('')};
  const addToAgenda=async()=>{if(saving)return;if(!meetingDate||!meetingTime){setNotice('Escolha a data e o horário para adicionar esta reunião à Agenda.');return}setSaving(true);setNotice('');try{const startsAt=new Date(meetingDate+'T'+meetingTime+':00');if(!Number.isFinite(startsAt.getTime()))throw Error('Confira a data e o horário da reunião.');const endsAt=new Date(startsAt.getTime()+45*60000);const prepared=payload();const response=await fetch('/api/agenda',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({subject:prepared.subject,startsAt:startsAt.toISOString(),endsAt:endsAt.toISOString(),guests:inviteGuests,objective:goal,preparation:{type:current.label,person,context,skills,deep,participants:prepared.members,diagnosis}})});const result=await response.json();if(!response.ok)throw Error(result.error||'Não foi possível salvar na Agenda.');storePreparation();const delivery=result.delivery;let message='Reunião adicionada à Agenda para '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(startsAt)+'.';if(inviteGuests.length){if(!delivery?.configured)message+=' O envio de convite por e-mail ainda não está configurado.';else if(delivery.failed)message+=' Convite enviado para '+delivery.sent+' de '+delivery.total+' convidados; alguns e-mails falharam.';else message+=' Convite enviado para '+delivery.sent+' convidado(s), com link para entrar na NOZA.'}setNotice(message)}catch(error){setNotice(error instanceof Error?error.message:'Não foi possível salvar na Agenda. Tente novamente.')}finally{setSaving(false)}};
  const updateDeep=(key:keyof DeepAnswers,value:string)=>setDeep(current=>({...current,[key]:value}));
  const analyzePreparation=async()=>{setShowDiagnosis(true);setAnalyzing(true);setAiDiagnosis('');const prompt='Gere um diagnóstico prático e preciso para esta reunião, em português do Brasil. Use os dados enviados, não invente fatos e diferencie informações fornecidas de hipóteses. Estruture com estes títulos: DIAGNÓSTICO, VALOR E POSICIONAMENTO, DECISÃO E RISCOS, ESTRATÉGIA DE CONDUÇÃO, PERGUNTA-CHAVE, PRÓXIMO PASSO E CRITÉRIO DE SUCESSO. Dê uma sequência objetiva para a conversa. Se faltar evidência, proponha perguntas para descobrir. O campo de perfil social é apenas um link: este serviço não navega automaticamente até a página; nunca afirme ter analisado um link se não tiver recebido o conteúdo. Considere apenas conteúdo profissional público fornecido. Não infira classe social, localização pessoal, relações privadas ou outros atributos pessoais. Contexto: '+JSON.stringify({tipo:current.label,pessoa:person,objetivo:goal,objetivoConcreto:deep.desiredOutcome,contexto:context,precoPretendido:type==='venda'?deep.targetPrice:'',diferencial:deep.valueDifferentiator,evidencias:deep.proofPoints,perfilPublico:deep.profileUrl,decisor:deep.decisionMaker,urgencia:deep.urgency,alternativas:deep.alternatives,objecao:deep.objection,proximoPasso:deep.nextStep,perguntaDeAbertura:deep.opening,skillsObservadas:skills});try{const response=await fetch('/api/zybos',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:prompt}]})});const result=await response.json();if(!response.ok||typeof result.answer!=='string')throw Error(result.error||'Falha ao analisar');setAiDiagnosis(result.answer)}catch{setAiDiagnosis('A análise inteligente não está disponível neste momento. Use a leitura de preparação abaixo: '+diagnosis.diagnosis+' Lacuna principal: '+(diagnosis.missing[0]||'confirme qual compromisso será combinado ao final.'))}finally{setAnalyzing(false)}};

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
              <button type="button" className="meeting-deep-toggle" aria-expanded={deepOpen} onClick={()=>setDeepOpen(value=>!value)}><span><BrainCircuit/>{deepOpen?'Fechar análise avançada':'Abrir análise avançada'}</span><ChevronRight className={deepOpen?'rotated':''}/></button>
              {deepOpen&&<div className="meeting-deep-questions">
                <label><span>+</span><div><strong>O que você quer alcançar ao final?</strong><small>Descreva um resultado concreto que mostre que a conversa avançou.</small></div><textarea value={deep.desiredOutcome} onChange={e=>updateDeep('desiredOutcome',e.target.value)} placeholder="Ex.: sair com a proposta aprovada e uma data de início."/></label>
                {type==='venda'&&<label><span>R$</span><div><strong>Quanto pretende cobrar?</strong><small>Registre preço ideal, faixa de negociação e limite mínimo sustentável.</small></div><input value={deep.targetPrice} onChange={e=>updateDeep('targetPrice',e.target.value)} placeholder="Ex.: proposta de R$ 12 mil; limite mínimo de R$ 10 mil."/></label>}
                <label><span>+</span><div><strong>O que diferencia seu valor das alternativas?</strong><small>Qual resultado, método ou experiência torna sua oferta mais adequada?</small></div><textarea value={deep.valueDifferentiator} onChange={e=>updateDeep('valueDifferentiator',e.target.value)} placeholder="Ex.: implantação acompanhada e redução do tempo até o resultado."/></label>
                <label><span>+</span><div><strong>Quais argumentos provam o valor do produto ou serviço?</strong><small>Use resultados, casos, dados ou demonstrações verificáveis.</small></div><textarea value={deep.proofPoints} onChange={e=>updateDeep('proofPoints',e.target.value)} placeholder="Ex.: resultado de um cliente, prazo de retorno ou demonstração prática."/></label>
                <label><span>↗</span><div><strong>Link público do Instagram ou LinkedIn</strong><small>Para contextualizar posicionamento e comunicação profissional. Se o conteúdo não estiver acessível, cole a bio ou trechos públicos no contexto da reunião.</small></div><input type="url" value={deep.profileUrl} onChange={e=>updateDeep('profileUrl',e.target.value)} placeholder="https://www.instagram.com/perfil ou linkedin.com/in/perfil"/><small className="meeting-profile-note">A leitura se limita à marca e ao conteúdo profissional público; não estima classe social, rede privada de seguidores ou localização pessoal.</small></label>
                <label><span>+</span><div><strong>Quem decide e quem influencia?</strong><small>Mapeie as pessoas envolvidas e o papel de cada uma.</small></div><textarea value={deep.decisionMaker} onChange={e=>updateDeep('decisionMaker',e.target.value)} placeholder="Ex.: a diretora aprova; o financeiro valida o orçamento."/></label>
                <label><span>+</span><div><strong>Qual é a prioridade e o que acontece se adiar?</strong><small>Identifique prazo, urgência real e consequência de não agir.</small></div><textarea value={deep.urgency} onChange={e=>updateDeep('urgency',e.target.value)} placeholder="Ex.: precisa decidir até o fechamento do trimestre para evitar mais atraso."/></label>
                <label><span>+</span><div><strong>Quais alternativas a pessoa considera hoje?</strong><small>Concorrentes, solução interna, fazer por conta própria ou não agir.</small></div><textarea value={deep.alternatives} onChange={e=>updateDeep('alternatives',e.target.value)} placeholder="Ex.: comparar com dois fornecedores e manter o processo atual."/></label>
                <label><span>+</span><div><strong>Qual dúvida pode impedir a decisão?</strong><small>Antecipe uma objeção específica e como descobrir sua causa.</small></div><textarea value={deep.objection} onChange={e=>updateDeep('objection',e.target.value)} placeholder="Ex.: receio de investimento sem retorno mensurável."/></label>
                <label><span>+</span><div><strong>Qual próximo passo você quer confirmar?</strong><small>Defina ação, responsável e data antes de encerrar a reunião.</small></div><textarea value={deep.nextStep} onChange={e=>updateDeep('nextStep',e.target.value)} placeholder="Ex.: enviar proposta revisada até sexta e marcar retorno na terça."/></label>
                <label><span>+</span><div><strong>Qual pergunta pode revelar a necessidade real?</strong><small>Prepare uma abertura curiosa, direta e sem pressupor a resposta.</small></div><textarea value={deep.opening} onChange={e=>updateDeep('opening',e.target.value)} placeholder="Ex.: o que precisa melhorar primeiro para essa solução valer a pena?"/></label>
              </div>}
            </div>
            <div className="meeting-members">
              <div className="meeting-step"><span>05</span><div><strong>Quem vai participar?</strong><small>Adicione membros para preparar a reunião com o contexto certo.</small></div></div>
              <div className="meeting-member-grid">{members.map(member=><button key={member.id} className={selectedMembers.includes(member.id)?'active':''} onClick={()=>toggleMember(member.id)}><img src={member.image} alt=""/><span><strong>{member.name}</strong><small>{member.role}</small></span>{selectedMembers.includes(member.id)?<Check/>:<Plus/>}</button>)}</div>
              <div className="meeting-member-add"><input type="email" value={memberName} onChange={e=>setMemberName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addInviteGuest()}}} placeholder="E-mail do participante para convite"/><button type="button" onClick={addInviteGuest}><Plus/>Convidar</button></div>{inviteGuests.length>0&&<div className="meeting-selected-members meeting-invite-list">{inviteGuests.map(guest=><span key={guest.email}>{guest.email}<button onClick={()=>setInviteGuests(list=>list.filter(item=>item.email!==guest.email))} aria-label={'Remover '+guest.email}><X/></button></span>)}</div>}
              {selectedMembers.length>0&&<div className="meeting-selected-members">{members.filter(member=>selectedMembers.includes(member.id)).map(member=><span key={member.id}><img src={member.image} alt=""/>{member.name}<button onClick={()=>toggleMember(member.id)} aria-label={'Remover '+member.name}><X/></button></span>)}</div>}
            </div>
          </div>

          <aside className="meeting-skills-card">
            <div className="meeting-skills-head"><BrainCircuit/><div><span>SKILLS DA REUNIÃO</span><strong>Foco recomendado</strong></div></div>
            <p>Para uma reunião de <b>{current.label.toLowerCase()}</b>, estas são as capacidades que a NOZA deve observar com mais atenção.</p>
            <div className="meeting-skill-list">{current.skills.map((skill,index)=><button key={skill} className={skills.includes(skill)?'active':''} onClick={()=>toggle(skill)}><span>{String(index+1).padStart(2,'0')}</span><strong>{skill}</strong><Check/></button>)}</div>
            <div className="meeting-readout"><Target/><div><small>OBJETIVO DE PERFORMANCE</small><p>{goal.trim()||'Defina o resultado desejado para a NOZA conectar contexto, comportamento e Skills.'}</p></div></div>
            {showDiagnosis&&<section className="meeting-diagnosis" aria-live="polite"><div className="meeting-diagnosis-head"><span><BrainCircuit/>LEITURA DA PREPARAÇÃO</span><strong>{diagnosis.level}</strong></div><div className="meeting-coverage"><div><span>Respostas mapeadas</span><b>{diagnosis.score}/{diagnosis.total}</b></div><i><em style={{width:(diagnosis.score/diagnosis.total*100)+'%'}}/></i></div>{analyzing?<p className="meeting-ai-loading" role="status">A NOZA está cruzando as respostas e preparando um diagnóstico…</p>:aiDiagnosis&&<div className="meeting-ai-output"><small>ANÁLISE NOZA</small><p>{aiDiagnosis}</p></div>}<p className="meeting-diagnosis-summary">{diagnosis.diagnosis}</p><div className="meeting-diagnosis-block"><small>RESULTADO A BUSCAR</small><p>{diagnosis.goal}</p></div><div className="meeting-diagnosis-block"><small>DIFERENCIAL DE VALOR</small><p>{diagnosis.differentiator}</p></div>{type==='venda'&&<div className="meeting-diagnosis-block"><small>PREÇO PRETENDIDO</small><p>{diagnosis.targetPrice||'Defina sua faixa de preço e o limite mínimo sustentável.'}</p></div>}{diagnosis.profileUrl&&<div className="meeting-diagnosis-block"><small>PERFIL PÚBLICO INFORMADO</small><p>{diagnosis.profileUrl} · confira o conteúdo profissional público ou cole a bio para análise.</p></div>}<div className="meeting-diagnosis-block"><small>CRITÉRIO DE DECISÃO</small><p>{diagnosis.criteria}</p></div><div className="meeting-diagnosis-block"><small>RISCO PARA ANTECIPAR</small><p>{diagnosis.risk}</p></div><div className="meeting-diagnosis-block"><small>LINHA DE CONDUÇÃO</small><p>{diagnosis.opening} Traga a evidência no momento certo e feche combinando: {diagnosis.nextStep}</p></div><div className="meeting-diagnosis-block"><small>SKILLS PARA OBSERVAR</small><p>{skills.join(' · ')}</p></div>{diagnosis.missing.length>0&&<div className="meeting-diagnosis-gaps"><small>PARA AUMENTAR A PRECISÃO</small><p>{diagnosis.missing.slice(0,3).map(item=>'• '+item).join('  ')}</p></div>}</section>}
            <div className="meeting-note">O diagnóstico usa as respostas deste briefing para organizar foco, riscos e próximos passos. Ele pode ser refinado enquanto você preenche.</div>
            <button className="meeting-analyze" onClick={()=>void analyzePreparation()} disabled={analyzing}><span>{analyzing?'Analisando…':showDiagnosis?'Atualizar análise':'Analisar preparação'}</span><BrainCircuit/></button>
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
