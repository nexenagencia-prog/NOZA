'use client';
import AppTopbar from '../AppTopbar';

import {useMemo,useState} from 'react';
import {ChevronDown,MoreHorizontal,Plus,SlidersHorizontal,Star,Video} from 'lucide-react';
import AppSidebar from '../AppSidebar';
import './contatos.css';
import './contatos-favorites.css';

const contacts=[
 {name:'Juliana',role:'Marketing',online:true,img:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=85'},
 {name:'Camila',role:'Produto',online:false,img:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85'},
 {name:'Rafael',role:'Design',online:true,img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85'},
 {name:'Bruno',role:'Vendas',online:false,img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=85'},
 {name:'Lucas',role:'Estratégia',online:true,img:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=85'},
 {name:'Mariana',role:'Conteúdo',online:true,img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=85'},
 {name:'Pedro',role:'Operações',online:true,img:'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=85'},
 {name:'Ana',role:'Financeiro',online:false,img:'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=160&q=85'},
];

type ContactFilter='all'|'online'|'favorites';

export default function ContatosPage(){
 const [favorites,setFavorites]=useState<string[]>(['Juliana','Camila','Rafael','Bruno','Lucas']);
 const [filter,setFilter]=useState<ContactFilter>('all');

 const toggleFavorite=(name:string)=>{
   setFavorites(current=>current.includes(name)?current.filter(item=>item!==name):[...current,name]);
 };

 const visibleContacts=useMemo(()=>contacts.filter(contact=>{
   if(filter==='online') return contact.online;
   if(filter==='favorites') return favorites.includes(contact.name);
   return true;
 }),[filter,favorites]);

 return <main className="contacts-page">
   <AppSidebar/><AppTopbar/>
   
   <section className="contacts-content">
     <div className="contacts-inner">
       <h1>Conexões<br/>para reuniões de <span>alto nível.</span></h1>
       <p className="contacts-sub">Organize, convide e colabore.</p>
       <div className="contacts-toolbar">
         <div className="contacts-filters">
           <button className={`pill ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>Todos (24)</button>
           <button className={`pill ${filter==='online'?'active':''}`} onClick={()=>setFilter('online')}><i className="online-dot"/>Online (8)</button>
           <button className={`pill ${filter==='favorites'?'active':''}`} onClick={()=>setFilter('favorites')}><Star size={15}/>Favoritos ({favorites.length})</button>
           <button className="pill"><SlidersHorizontal size={15}/>Filtros</button>
         </div>
         <button className="sort-pill"><SlidersHorizontal size={14}/>Mais recentes<ChevronDown size={15}/></button>
       </div>
       <div className="contacts-row">
         {visibleContacts.map(c=>{
           const isFavorite=favorites.includes(c.name);
           return <article className="contact-card" key={c.name} tabIndex={0}>
             <button className={`favorite-toggle ${isFavorite?'is-favorite':''}`} onClick={()=>toggleFavorite(c.name)} aria-label={isFavorite?`Remover ${c.name} dos favoritos`:`Favoritar ${c.name}`} aria-pressed={isFavorite}>
               <Star/>
             </button>
             <div className="contact-photo-wrap"><img src={c.img} alt={c.name}/><i className={c.online?'status online':'status'}/></div>
             <strong>{c.name}</strong><span>{c.role}</span>
             <div className="contact-actions"><button aria-label={`WhatsApp de ${c.name}`}>◉</button><button aria-label={`Vídeo com ${c.name}`}><Video/></button><button aria-label={`Mais opções para ${c.name}`}><MoreHorizontal/></button></div>
           </article>;
         })}
         {filter!=='favorites'&&<button className="invite-card"><Plus/><span>Convidar alguém<br/>para NOZA</span></button>}
       </div>
       <footer className="contacts-footer"><div><span>8 online agora</span><i/><span>24 contatos</span></div><blockquote>“Boas conversas constroem grandes resultados.”</blockquote></footer>
     </div>
   </section>
 </main>
}