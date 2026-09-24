'use client';

import Link from 'next/link';
import {Bell} from 'lucide-react';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {BRAND_LOGO,BRAND_NAME} from './brand.mjs';
import './app-topbar.css';

const nav=[['Início','/'],['Skills','/skills'],['Planos e Preços','/planos']] as const;

type AppTopbarProps={
  floating?:boolean;
  nextLabel?:string;
  nextDateTime?:string;
  performancePercent?:number;
  showContext?:boolean;
};

export default function AppTopbar({
  floating=false,
  nextLabel='Sua próxima Reunião',
  nextDateTime='14:00 — 30 Set 2026',
  performancePercent=69,
  showContext=false
}:AppTopbarProps){
  const pathname=usePathname();
  const router=useRouter();
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const notificationRef=useRef<HTMLDivElement>(null);
  const notificationButtonRef=useRef<HTMLButtonElement>(null);

  useEffect(()=>{if(pathname!=='/')router.prefetch('/')},[pathname,router]);
  useEffect(()=>{
    if(!notificationsOpen)return;
    const onOutside=(e:globalThis.MouseEvent)=>{
      const target=e.target as Node;
      if(notificationRef.current?.contains(target)||notificationButtonRef.current?.contains(target))return;
      setNotificationsOpen(false);
    };
    document.addEventListener('mousedown',onOutside);
    return()=>document.removeEventListener('mousedown',onOutside);
  },[notificationsOpen]);

  return <header className={`topbar app-topbar ${floating?'app-topbar-floating':''}`}>
    <Link href="/" prefetch className="zyvo-brand" aria-label={BRAND_NAME}><img src={BRAND_LOGO} alt="" aria-hidden="true"/></Link>
    <nav className="topnav">{nav.map(([label,href])=><Link href={href} prefetch className={pathname===href?'current':''} key={href}>{label}</Link>)}</nav>
    {showContext&&<div className="next-meeting"><span>{nextLabel}</span><strong>{nextDateTime}</strong></div>}
    <div className="notification-wrap">
      <button ref={notificationButtonRef} className={`notification-button ${notificationsOpen?'active':''}`} aria-label="Notificações" aria-expanded={notificationsOpen} onClick={()=>setNotificationsOpen(v=>!v)}><Bell/></button>
      {notificationsOpen&&<div ref={notificationRef} className="notification-panel">
        <div className="notification-head"><strong>Notificações</strong><span>Hoje</span></div>
        <div className="notification-item"><span className="notification-mark"/><div><strong>Próxima reunião</strong><p>{nextDateTime}</p></div></div>
        <div className="notification-item"><span className="notification-mark muted"/><div><strong>Performance atualizada</strong><p>{performancePercent}% de performance nas reuniões.</p></div></div>
      </div>}
    </div>
  </header>;
}
