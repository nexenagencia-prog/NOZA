'use client';
import AppTopbar from '../AppTopbar';

import {ChangeEvent,PointerEvent,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {BarChart3,ChevronLeft,ChevronRight,ImagePlus,Pencil,Play,Star,Trash2,X} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import {resolveStoredRecordings} from './recordings-storage.mjs';
import './gravacoes.css';

type Recording={
 id:string;title:string;phrase:string;thumbnail:string;performance:number;font:string;fontSize:number;
 titleLine1?:string;titleLine2?:string;titleColor1?:string;titleColor2?:string;titleWeight?:number;
 titleSize1?:number;titleSize2?:number;titleWeight1?:number;titleWeight2?:number;titleItalic1?:boolean;titleItalic2?:boolean;
 src?:string;
};

type RecordingPrefs=Partial<Omit<Recording,'id'>>;

const STORAGE_KEY='zyvo-recordings';
const PREFS_KEY='zyvo-recording-preferences-v2';
const SELECTED_KEY='zyvo-selected-analysis';
const COVER_DB='zyvo-recording-covers';
const COVER_STORE='covers';

const defaults:Recording[]=[
 {id:'r1',title:'Reunião de planejamento',titleLine1:'Reunião de',titleLine2:'planejamento',phrase:'Estratégia, proposta e próximos passos.',thumbnail:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=88',performance:5,font:'SF Pro Display',fontSize:48,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r2',title:'Alinhamento comercial',titleLine1:'Alinhamento',titleLine2:'comercial',phrase:'Decisões mais claras para acelerar o fechamento.',thumbnail:'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=86',performance:4,font:'SF Pro Display',fontSize:48,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r3',title:'Reunião com cliente',titleLine1:'Reunião com',titleLine2:'cliente',phrase:'Objeções, escuta e próximos compromissos.',thumbnail:'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=86',performance:4,font:'SF Pro Display',fontSize:46,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r4',title:'Kickoff de projeto',titleLine1:'Kickoff de',titleLine2:'projeto',phrase:'Prioridades e responsabilidades definidas.',thumbnail:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=86',performance:5,font:'SF Pro Display',fontSize:44,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r5',title:'Revisão semanal',titleLine1:'Revisão',titleLine2:'semanal',phrase:'O que avançou e o que precisa mudar.',thumbnail:'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=86',performance:3,font:'SF Pro Display',fontSize:44,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r6',title:'Apresentação de proposta',titleLine1:'Apresentação',titleLine2:'de proposta',phrase:'Valor percebido, timing e decisão.',thumbnail:'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=86',performance:5,font:'SF Pro Display',fontSize:44,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r7',title:'Estratégia de lançamento',titleLine1:'Estratégia de',titleLine2:'lançamento',phrase:'Mensagem, prioridade e execução.',thumbnail:'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=86',performance:4,font:'SF Pro Display',fontSize:44,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r8',title:'Reunião de performance',titleLine1:'Reunião de',titleLine2:'performance',phrase:'Pontos fortes, ruídos e evolução.',thumbnail:'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=86',performance:5,font:'SF Pro Display',fontSize:44,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
 {id:'r9',title:'Entrevista estratégica',titleLine1:'Entrevista',titleLine2:'estratégica',phrase:'Perguntas melhores, respostas mais úteis.',thumbnail:'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=86',performance:4,font:'SF Pro Display',fontSize:44,titleColor1:'#ffffff',titleColor2:'#ffffff',titleWeight:650},
];

function splitTitle(title:string){const words=title.trim().split(/\s+/);const cut=Math.max(1,Math.ceil(words.length/2));return [words.slice(0,cut).join(' '),words.slice(cut).join(' ')]}
function titleParts(item:Recording){const [fallbackOne,fallbackTwo]=splitTitle(item.title);return [item.titleLine1||fallbackOne,item.titleLine2??fallbackTwo]}
function normalizeRecording(r:Partial<Recording>,i:number):Recording{const base=defaults.find(d=>d.id===r.id)??defaults[i%defaults.length];const merged={...base,...r,id:String(r.id??base.id??`saved-${i}`)} as Recording;const [line1,line2]=titleParts(merged);return {...merged,titleLine1:line1,titleLine2:line2,titleColor1:merged.titleColor1||'#ffffff',titleColor2:merged.titleColor2||'#ffffff',titleWeight:merged.titleWeight||650,titleSize1:merged.titleSize1??merged.fontSize,titleSize2:merged.titleSize2??merged.fontSize,titleWeight1:merged.titleWeight1??merged.titleWeight??650,titleWeight2:merged.titleWeight2??merged.titleWeight??650,titleItalic1:Boolean(merged.titleItalic1),titleItalic2:Boolean(merged.titleItalic2)}}
function readPrefs():Record<string,RecordingPrefs>{try{return JSON.parse(localStorage.getItem(PREFS_KEY)||'{}')||{}}catch{return {}}}
function writePref(item:Recording){try{const prefs=readPrefs();const {id,...rest}=item;prefs[id]=rest;localStorage.setItem(PREFS_KEY,JSON.stringify(prefs))}catch{}}
function openCoverDb(){return new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open(COVER_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(COVER_STORE))db.createObjectStore(COVER_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function saveCover(id:string,data:string){try{const db=await openCoverDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(COVER_STORE,'readwrite');tx.objectStore(COVER_STORE).put(data,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}catch{}}
async function loadCovers(ids:string[]){const out:Record<string,string>={};try{const db=await openCoverDb();await Promise.all(ids.map(id=>new Promise<void>(resolve=>{const tx=db.transaction(COVER_STORE,'readonly');const req=tx.objectStore(COVER_STORE).get(id);req.onsuccess=()=>{if(typeof req.result==='string')out[id]=req.result;resolve()};req.onerror=()=>resolve()})));db.close()}catch{}return out}

function Rail({children,className='',focusId}:{children:React.ReactNode;className?:string;focusId?:string}){
 const ref=useRef<HTMLDivElement>(null);const drag=useRef({active:false,x:0,left:0,moved:false});
 const down=(e:PointerEvent<HTMLDivElement>)=>{if((e.target as HTMLElement).closest('button,input,select,textarea'))return;const el=ref.current;if(!el)return;drag.current={active:true,x:e.clientX,left:el.scrollLeft,moved:false};el.setPointerCapture(e.pointerId);el.classList.add('dragging')};
 const move=(e:PointerEvent<HTMLDivElement>)=>{const el=ref.current;if(!el||!drag.current.active)return;const delta=e.clientX-drag.current.x;if(Math.abs(delta)>3)drag.current.moved=true;el.scrollLeft=drag.current.left-delta};
 const up=(e:PointerEvent<HTMLDivElement>)=>{const el=ref.current;if(!el)return;drag.current.active=false;try{el.releasePointerCapture(e.pointerId)}catch{}el.classList.remove('dragging')};
 useEffect(()=>{const el=ref.current;if(!el)return;const wheel=(e:WheelEvent)=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;if(Math.abs(e.deltaY)<2)return;e.preventDefault();el.scrollBy({left:e.deltaY*.72,behavior:'smooth'})};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel)},[]);
 useEffect(()=>{if(!focusId)return;const el=ref.current;const target=el?.querySelector<HTMLElement>(`[data-recording-id="${focusId}"]`);target?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})},[focusId]);
 return <div ref={ref} className={`recordings-rail ${className}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>{children}</div>;
}

export default function RecordingsPage(){
 const router=useRouter();const[recordings,setRecordings]=useState<Recording[]>([]);const[active,setActive]=useState(1);const[editing,setEditing]=useState<Recording|null>(null);const[hydrated,setHydrated]=useState(false);const fileRef=useRef<HTMLInputElement>(null);const pendingThumbnailId=useRef<string|null>(null);
 useEffect(()=>{(async()=>{try{const raw=localStorage.getItem(STORAGE_KEY);const prefs=readPrefs();const stored=resolveStoredRecordings(raw,defaults);let base=stored.map((r:Partial<Recording>,i:number)=>normalizeRecording(r,i));base=base.map((item,i)=>normalizeRecording({...item,...prefs[item.id],id:item.id},i));const covers=await loadCovers(base.map(r=>r.id));base=base.map(item=>covers[item.id]?{...item,thumbnail:covers[item.id]}:item);setRecordings(base);setActive(index=>Math.min(index,Math.max(0,base.length-1)))}catch{}finally{setHydrated(true)}})()},[]);
 useEffect(()=>{if(!hydrated)return;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(recordings.map(r=>({...r,thumbnail:r.thumbnail.startsWith('data:')?'':r.thumbnail}))));window.dispatchEvent(new Event('zyvo:recordings-updated'))}catch{}},[recordings,hydrated]);
 const update=(next:Recording)=>{const normalized=normalizeRecording(next,recordings.findIndex(r=>r.id===next.id));writePref(normalized);if(normalized.thumbnail.startsWith('data:'))saveCover(normalized.id,normalized.thumbnail);setRecordings(list=>list.map(item=>item.id===normalized.id?normalized:item));setEditing(null)};
 const remove=(id:string)=>{setRecordings(list=>list.filter(item=>item.id!==id));setActive(i=>Math.max(0,Math.min(i,recordings.length-2)))};
 const pickThumbnail=(id:string)=>{pendingThumbnailId.current=id;fileRef.current?.click()};
 const changeThumbnail=(e:ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];const id=pendingThumbnailId.current;if(!file||!id)return;const reader=new FileReader();reader.onload=()=>{const data=String(reader.result);saveCover(id,data);setRecordings(list=>list.map(item=>{if(item.id!==id)return item;const next={...item,thumbnail:data};writePref(next);return next}))};reader.readAsDataURL(file);e.target.value=''};
 const openAnalysis=(item:Recording)=>{try{localStorage.setItem(SELECTED_KEY,JSON.stringify(item))}catch{}router.push(`/analise-reunioes?analysis=${encodeURIComponent(item.id)}`)};
 const featured=recordings[active]??recordings[0];
 const shift=(dir:number)=>{if(!recordings.length)return;setActive(i=>Math.max(0,Math.min(recordings.length-1,i+dir)))};
 const selectFromSmall=(id:string)=>{const index=recordings.findIndex(r=>r.id===id);if(index>=0){setActive(index);requestAnimationFrame(()=>document.querySelector('.recordings-featured-wrap')?.scrollIntoView({behavior:'smooth',block:'nearest'}))}};
 const reversed=[...recordings].reverse();
 const repeated=[...recordings,...recordings,...recordings];
 const repeatedReversed=[...reversed,...reversed,...reversed];
 return <main className="recordings-page"><AppSidebar/><section className="content recordings-content"><AppTopbar floating={false}/><div className="recordings-stage">
  <input ref={fileRef} className="recordings-file-input" type="file" accept="image/*" onChange={changeThumbnail}/>
  {featured&&<section className="recordings-featured-wrap">
   <button className="recordings-arrow left" onClick={()=>shift(-1)} disabled={active===0} aria-label="Gravação anterior"><ChevronLeft/></button>
   <Rail className="recordings-featured-rail" focusId={featured.id}>
    {recordings.map((item,index)=>{const [line1,line2]=titleParts(item);return <article data-recording-id={item.id} className={`recordings-featured-card ${index===active?'is-active':''}`} key={item.id} style={{backgroundImage:`linear-gradient(180deg,rgba(4,8,12,.03),rgba(4,8,12,.72)),url(${item.thumbnail})`}} onClick={()=>setActive(index)}>
      <div className="featured-copy"><span>GRAVAÇÃO NOZA</span><h1 style={{fontFamily:item.font}}><span className="featured-title-line-one" style={{color:item.titleColor1||'#fff',fontSize:`${item.titleSize1??item.fontSize}px`,fontWeight:item.titleWeight1??item.titleWeight??650,fontStyle:item.titleItalic1?'italic':'normal'}}>{line1}</span>{line2&&<span className="featured-title-line-two" style={{color:item.titleColor2||'#fff',fontSize:`${item.titleSize2??item.fontSize}px`,fontWeight:item.titleWeight2??item.titleWeight??650,fontStyle:item.titleItalic2?'italic':'normal'}}>{line2}</span>}</h1><p>{item.phrase}</p><PerformanceStars value={item.performance}/></div>
      <div className="featured-actions"><button onClick={e=>{e.stopPropagation();openAnalysis(item)}}><BarChart3/>Analisar</button><button className="watch" onClick={e=>e.stopPropagation()}><Play fill="currentColor"/>Assistir agora</button></div>
      <CardTools onEdit={()=>setEditing(item)} onThumb={()=>pickThumbnail(item.id)} onDelete={()=>remove(item.id)} onAnalyze={()=>openAnalysis(item)}/>
    </article>})}
   </Rail>
   <button className="recordings-arrow right" onClick={()=>shift(1)} disabled={active===recordings.length-1} aria-label="Próxima gravação"><ChevronRight/></button>
  </section>}
  <Rail className="recordings-row-one">{repeated.map((item,index)=><SmallCard key={`a-${item.id}-${index}`} item={item} onOpen={()=>selectFromSmall(item.id)} onEdit={()=>setEditing(item)} onThumb={()=>pickThumbnail(item.id)} onDelete={()=>remove(item.id)} onAnalyze={()=>openAnalysis(item)}/>)}</Rail>
  <Rail className="recordings-row-two">{repeatedReversed.map((item,index)=><SmallCard key={`b-${item.id}-${index}`} item={item} onOpen={()=>selectFromSmall(item.id)} onEdit={()=>setEditing(item)} onThumb={()=>pickThumbnail(item.id)} onDelete={()=>remove(item.id)} onAnalyze={()=>openAnalysis(item)}/>)}</Rail>
 </div></section>
 {editing&&<EditModal value={editing} onClose={()=>setEditing(null)} onSave={update}/>}</main>;
}

function PerformanceStars({value,compact=false}:{value:number;compact?:boolean}){return <div className={`recordings-stars ${compact?'compact':''}`} aria-label={`Performance ${value} de 5`}>{[1,2,3,4,5].map(n=><Star key={n} className={n<=value?'filled':''}/>)}</div>}
function CardTools({onEdit,onThumb,onDelete,onAnalyze}:{onEdit:()=>void;onThumb:()=>void;onDelete:()=>void;onAnalyze:()=>void}){return <div className="recordings-tools" onClick={e=>e.stopPropagation()}><button title="Assistir"><Play fill="currentColor"/></button><button title="Analisar" onClick={onAnalyze}><BarChart3/></button><button title="Editar gravação" onClick={onEdit}><Pencil/></button><button title="Alterar miniatura" onClick={onThumb}><ImagePlus/></button><button title="Excluir" onClick={onDelete}><Trash2/></button></div>}
function SmallCard({item,onOpen,onEdit,onThumb,onDelete,onAnalyze}:{item:Recording;onOpen:()=>void;onEdit:()=>void;onThumb:()=>void;onDelete:()=>void;onAnalyze:()=>void}){return <article className="recordings-small-card" style={{backgroundImage:`linear-gradient(180deg,rgba(5,8,12,.02),rgba(5,8,12,.56)),url(${item.thumbnail})`}} onClick={onOpen}><div className="small-meta"><strong style={{fontFamily:item.font}}>{item.title}</strong><PerformanceStars value={item.performance} compact/></div><CardTools onEdit={onEdit} onThumb={onThumb} onDelete={onDelete} onAnalyze={onAnalyze}/></article>}

function EditModal({value,onClose,onSave}:{value:Recording;onClose:()=>void;onSave:(r:Recording)=>void}){
 const[line1,line2]=titleParts(value);const[draft,setDraft]=useState<Recording>({...normalizeRecording(value,0),titleLine1:line1,titleLine2:line2});const previewFileRef=useRef<HTMLInputElement>(null);
 const save=()=>onSave({...draft,title:[draft.titleLine1,draft.titleLine2].filter(Boolean).join(' ')});
 const previewCover=(e:ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setDraft(d=>({...d,thumbnail:String(reader.result)}));reader.readAsDataURL(file);e.target.value=''};
 const [p1,p2]=titleParts(draft);
 return <div className="recordings-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="recordings-modal recordings-editor"><button className="modal-close" onClick={onClose}><X/></button>
  <div className="recordings-editor-preview" style={{backgroundImage:`linear-gradient(180deg,rgba(4,8,12,.03),rgba(4,8,12,.72)),url(${draft.thumbnail})`}}>
   <div className="editor-preview-copy"><span>GRAVAÇÃO NOZA</span><h3 style={{fontFamily:draft.font}}><span style={{color:draft.titleColor1||'#fff',fontSize:`${draft.titleSize1??draft.fontSize}px`,fontWeight:draft.titleWeight1??650,fontStyle:draft.titleItalic1?'italic':'normal'}}>{p1}</span>{p2&&<span style={{color:draft.titleColor2||'#fff',fontSize:`${draft.titleSize2??draft.fontSize}px`,fontWeight:draft.titleWeight2??650,fontStyle:draft.titleItalic2?'italic':'normal'}}>{p2}</span>}</h3><p>{draft.phrase}</p><PerformanceStars value={draft.performance}/></div>
   <button className="editor-cover-button" onClick={()=>previewFileRef.current?.click()}><ImagePlus/>Trocar capa</button><input ref={previewFileRef} type="file" accept="image/*" hidden onChange={previewCover}/>
  </div>
  <div className="recordings-editor-controls"><span>EDITAR GRAVAÇÃO</span><h2>Personalize a capa em tempo real.</h2><div className="editor-scroll">
   <label>Linha 1 do título<input value={draft.titleLine1||''} onChange={e=>setDraft({...draft,titleLine1:e.target.value})}/></label>
   <div className="editor-inline"><label>Cor 1<input type="color" value={draft.titleColor1||'#ffffff'} onChange={e=>setDraft({...draft,titleColor1:e.target.value})}/></label><label>Tamanho 1<b>{draft.titleSize1??draft.fontSize}px</b><input type="range" min="28" max="76" value={draft.titleSize1??draft.fontSize} onChange={e=>setDraft({...draft,titleSize1:Number(e.target.value)})}/></label></div>
   <div className="editor-inline"><label>Peso 1<select value={draft.titleWeight1??650} onChange={e=>setDraft({...draft,titleWeight1:Number(e.target.value)})}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option><option value="800">Extra Bold</option></select></label><label>Estilo 1<select value={draft.titleItalic1?'italic':'normal'} onChange={e=>setDraft({...draft,titleItalic1:e.target.value==='italic'})}><option value="normal">Normal</option><option value="italic">Itálico</option></select></label></div>
   <label>Linha 2 do título<input value={draft.titleLine2||''} onChange={e=>setDraft({...draft,titleLine2:e.target.value})}/></label>
   <div className="editor-inline"><label>Cor 2<input type="color" value={draft.titleColor2||'#ffffff'} onChange={e=>setDraft({...draft,titleColor2:e.target.value})}/></label><label>Tamanho 2<b>{draft.titleSize2??draft.fontSize}px</b><input type="range" min="28" max="76" value={draft.titleSize2??draft.fontSize} onChange={e=>setDraft({...draft,titleSize2:Number(e.target.value)})}/></label></div>
   <div className="editor-inline"><label>Peso 2<select value={draft.titleWeight2??650} onChange={e=>setDraft({...draft,titleWeight2:Number(e.target.value)})}><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option><option value="800">Extra Bold</option></select></label><label>Estilo 2<select value={draft.titleItalic2?'italic':'normal'} onChange={e=>setDraft({...draft,titleItalic2:e.target.value==='italic'})}><option value="normal">Normal</option><option value="italic">Itálico</option></select></label></div>
   <label>Fonte<select value={draft.font} onChange={e=>setDraft({...draft,font:e.target.value})}><option>SF Pro Display</option><option>Helvetica Neue</option><option>Arial</option><option>Georgia</option></select></label>
   <label>Frase<textarea value={draft.phrase} onChange={e=>setDraft({...draft,phrase:e.target.value})}/></label>
   <label>Performance<div className="modal-stars">{[1,2,3,4,5].map(n=><button key={n} className={n<=draft.performance?'active':''} onClick={()=>setDraft({...draft,performance:n})}><Star fill={n<=draft.performance?'currentColor':'none'}/></button>)}</div></label>
  </div><div className="modal-actions"><button onClick={onClose}>Cancelar</button><button className="save" onClick={save}>Salvar alterações</button></div></div>
 </section></div>;
}