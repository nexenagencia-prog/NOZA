export function appendMessage(messages,body,time){
  const clean=String(body||'').trim();
  if(!clean)return messages;
  return [...messages,{id:`message-${messages.length+1}`,author:'Você',body:clean,time,mine:true}];
}

export function toggleAgendaItem(items,id){
  return items.map(item=>item.id===id?{...item,done:!item.done}:item);
}

export function upsertNote(notes,note){
  return [note,...notes.filter(item=>item.id!==note.id)];
}

export function filterParticipants(participants,filter){
  if(filter==='active')return participants.filter(item=>item.active);
  if(filter==='muted')return participants.filter(item=>item.muted);
  return participants;
}

export function createLocalSlide(file,url,stamp=Date.now()){
  const isPdf=file?.type==='application/pdf';
  const isImage=String(file?.type||'').startsWith('image/');
  if((!isPdf&&!isImage)||!url)return null;
  return {
    id:`computer-${stamp}`,
    title:String(file.name||'Slide').replace(/\.[^.]+$/,''),
    source:'computer',
    kind:isPdf?'pdf':'image',
    url,
  };
}

export function mergeSlides(current,incoming){
  const ids=new Set();
  return [...current,...incoming].filter(item=>{
    if(!item?.id||!item?.url||ids.has(item.id))return false;
    ids.add(item.id);
    return true;
  });
}

export function selectParticipant(participants,id){
  return participants.find(person=>person.id===id)??null;
}

export function getSlideOverlay(slide){
  if(slide?.kind!=='insight')return null;
  return {title:slide.title,copy:slide.copy,sourceLabel:'Insight da reunião'};
}

export function previousSlideIndex(index,length){
  if(length<=0)return 0;
  return (index-1+length)%length;
}

export function getParticipantPanelView(participants,id){
  const participant=selectParticipant(participants,id);
  return participant?{mode:'focus',participant}:{mode:'mosaic',participant:null};
}
