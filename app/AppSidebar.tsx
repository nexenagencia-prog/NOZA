'use client';

import Link from 'next/link';
import {BarChart3,Bell,BrainCircuit,Calculator,CalendarDays,Camera,CirclePlus,DoorOpen,Grid2X2,Hexagon,Headphones,Menu,NotebookPen,Orbit,Pencil,Presentation,Sparkles,StickyNote,Video,X} from 'lucide-react';
import {ChangeEvent,useEffect,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {BRAND_LOGO,BRAND_NAME,rebrandPublicText} from './brand.mjs';
import {isSidebarRouteActive,resolveSidebarRoute} from './sidebar-navigation.mjs';
import './app-sidebar.css';

const PROFILE_AVATAR_KEY='zyvo-profile-avatar';
let cachedProfileAvatar:string|null|undefined;
const ChatnosaMark=()=> <span className="sidebar-chatnosa-mark" aria-hidden="true">N</span>;
const icons=[Grid2X2,CirclePlus,CalendarDays,BrainCircuit,BarChart3,ChatnosaMark,Bell,Video,Hexagon,DoorOpen];
const defaults=['Início','Criar reunião','Agenda','Calibragem','Skills Pro','Chat Noza','My Performance','Space','Suporte','Configurações','Sair'];
const extras:{label:string;Icon:typeof BrainCircuit}[]=[];
type Props={name?:string;planLabel?:string;avatarUrl?:string|null;labels?:string[];onCalculator?:()=>void;onAnotar?:()=>void;onExpandedChange?:(value:boolean)=>void};

export default function AppSidebar({name='Sandro Bello',planLabel='NOZA Pro',avatarUrl=null,labels:_labels=defaults,onCalculator,onAnotar,onExpandedChange}:Props){
  const labels=defaults;
  const router=useRouter();const pathname=usePathname();const[mobileOpen,setMobileOpen]=useState(false);const[profileName,setProfileName]=useState(name);const[editingName,setEditingName]=useState(false);const[avatar,setAvatar]=useState<string|null>(()=>avatarUrl||cachedProfileAvatar||null);const fileRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{document.body.classList.add('zyvo-sidebar-expanded');onExpandedChange?.(true);try{const saved=localStorage.getItem(PROFILE_AVATAR_KEY);if(saved){cachedProfileAvatar=saved;if(!avatar)setAvatar(saved)}const savedName=localStorage.getItem('noza-profile-name');if(savedName)setProfileName(savedName)}catch{}},[onExpandedChange]);
  const changeAvatar=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const value=String(reader.result);cachedProfileAvatar=value;setAvatar(value);try{localStorage.setItem(PROFILE_AVATAR_KEY,value)}catch{}};reader.readAsDataURL(file)};
  const hiddenLabels=new Set<string>();
  const primary=labels.map((label,index)=>({label,index,Icon:icons[index]||Grid2X2})).filter(item=>item.label!=='Configurações'&&item.label!=='Sair'&&!hiddenLabels.has(item.label));
  const final=[...labels.map((label,index)=>({label,index,Icon:icons[index]||Grid2X2})).filter(item=>item.label==='Configurações'||item.label==='Sair'),...(!labels.includes('Configurações')?[{label:'Configurações',index:998,Icon:Hexagon}]:[])].sort((a,b)=>a.label==='Sair'?1:b.label==='Sair'?-1:a.index-b.index);
  const emit=(eventName:string)=>window.dispatchEvent(new Event(eventName));
  useEffect(()=>{setMobileOpen(false)},[pathname]);
  const action=(label:string)=>{if(label==='Suporte'){router.push('/suporte');return}const route=resolveSidebarRoute(label);if(route)router.push(route);else if(label==='Calculadora')onCalculator?onCalculator():emit('zyvo:open-calculator');else if(label==='Anotar')onAnotar?onAnotar():emit('zyvo:open-notes');else if(label==='Criar slides')router.push('/slides');else if(label==='Sair'){setMobileOpen(false);void import('../lib/supabase/client').then(({createClient})=>createClient().auth.signOut({scope:'local'})).finally(()=>window.location.replace('/login'))}};
  const active=(label:string)=>isSidebarRouteActive(label,pathname);
  const prefetch=(label:string)=>{const route=label==='Suporte'?'/suporte':resolveSidebarRoute(label);if(route)router.prefetch(route)};
  return <><button className="mobile-nav-trigger" onClick={()=>setMobileOpen(true)} aria-label="Abrir menu"><Menu/></button>{mobileOpen&&<button className="mobile-nav-backdrop" onClick={()=>setMobileOpen(false)} aria-label="Fechar menu"/>}<aside className={`sidebar expanded ${mobileOpen?'mobile-open':''}`} aria-label="Menu lateral"><button className="mobile-nav-close" onClick={()=>setMobileOpen(false)} aria-label="Fechar menu"><X/></button>
    <button className="sidebar-brand" onClick={()=>router.push('/')} aria-label={BRAND_NAME}><img src={BRAND_LOGO} alt={BRAND_NAME}/></button>
    <div className="avatar-wrap"><button className="avatar-button" onClick={()=>fileRef.current?.click()}><div className="avatar" style={avatar?{backgroundImage:`url(${avatar})`}:undefined}>{!avatar&&profileName.split(/\s+/).map(value=>value[0]).slice(0,2).join('')}</div><span className="avatar-camera"><Camera size={11}/></span></button><input ref={fileRef} className="avatar-input" type="file" accept="image/*" onChange={changeAvatar}/><div className="avatar-meta">{editingName?<input className="name-input" value={profileName} autoFocus onChange={event=>setProfileName(event.target.value)} onBlur={()=>{setEditingName(false);try{localStorage.setItem('noza-profile-name',profileName);window.dispatchEvent(new CustomEvent('noza:profile-name',{detail:profileName}))}catch{}}}/>:<button className="name-edit" onClick={()=>setEditingName(true)}><strong>{profileName}</strong><Pencil size={12}/></button>}<span>{rebrandPublicText(planLabel)}</span></div></div>
    <div className="side-nav">
      {primary.map(({label,index,Icon})=><button className={`side-item ${active(label)?'active':''}`} key={`${label}-${index}`} onClick={()=>action(label)} onMouseEnter={()=>prefetch(label)} onFocus={()=>prefetch(label)}><Icon/><span>{label}</span></button>)}
      {extras.map(({label,Icon})=>label==='Chat Noza'||label==='Skills Pro'||label==='My Performance'?<Link className={`side-item ${active(label)?'active':''}`} href={resolveSidebarRoute(label)!} key={label}><Icon/><span>{label}</span></Link>:<button className={`side-item ${active(label)?'active':''}`} key={label} onClick={()=>action(label)} onMouseEnter={()=>prefetch(label)} onFocus={()=>prefetch(label)}><Icon/><span>{label}</span></button>)}
      {final.map(({label,index,Icon})=><button className={`side-item ${active(label)?'active':''}`} key={`${label}-${index}`} onClick={()=>action(label)} onMouseEnter={()=>prefetch(label)} onFocus={()=>prefetch(label)}><Icon/><span>{label}</span></button>)}
    </div>
  </aside></>
}
