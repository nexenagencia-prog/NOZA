'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { Check, ImagePlus, LogOut, Plus, Save, Trash2 } from 'lucide-react';
import type { HomeContent } from '../../lib/cms/types';
import { createBrowserSupabaseClient } from '../../lib/supabase/client';

type Props={initialContent:HomeContent;adminEmail:string};

async function uploadImage(file:File){
  const form=new FormData(); form.append('file',file);
  const response=await fetch('/api/cms/upload',{method:'POST',body:form});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||'Falha no upload.');
  return String(data.url);
}

export default function CmsEditor({initialContent,adminEmail}:Props){
  const supabase=useMemo(()=>createBrowserSupabaseClient(),[]);
  const [content,setContent]=useState<HomeContent>(initialContent);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  const hero=(key:keyof HomeContent['hero'],value:string|number)=>setContent(v=>({...v,hero:{...v.hero,[key]:value}}));
  const nextMeeting=(key:keyof HomeContent['nextMeeting'],value:string)=>setContent(v=>({...v,nextMeeting:{...v.nextMeeting,[key]:value}}));
  const profile=(key:keyof HomeContent['profile'],value:string)=>setContent(v=>({...v,profile:{...v.profile,[key]:value}}));

  async function save(){
    setSaving(true);setMessage('');setError('');
    try{
      const response=await fetch('/api/cms/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(content)});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Falha ao salvar.');
      if(data.content) setContent(data.content);
      setMessage('Alterações salvas e publicadas na Home.');
    }catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar.');}
    finally{setSaving(false);}
  }

  async function chooseImage(event:ChangeEvent<HTMLInputElement>,apply:(url:string)=>void){
    const file=event.target.files?.[0]; if(!file)return;
    setMessage('');setError('');
    try{apply(await uploadImage(file));setMessage('Imagem enviada. Clique em “Salvar alterações” para publicar.');}
    catch(e){setError(e instanceof Error?e.message:'Falha no upload.');}
    event.target.value='';
  }

  async function logout(){await supabase.auth.signOut();window.location.href='/cms/login';}

  return <main className="cms-shell">
    <header className="cms-header"><div><span>NOZA CMS</span><h1>Conteúdo da Home</h1><p>{adminEmail}</p></div><div className="cms-header-actions"><a href="/" target="_blank">Ver Home</a><button onClick={logout}><LogOut size={17}/>Sair</button><button className="cms-save" onClick={save} disabled={saving}><Save size={17}/>{saving?'Salvando...':'Salvar alterações'}</button></div></header>
    {(message||error)&&<div className={`cms-toast ${error?'error':''}`}>{error||message}</div>}

    <div className="cms-grid">
      <section className="cms-panel wide"><div className="cms-panel-title"><div><span>01</span><h2>Hero</h2></div></div><div className="cms-fields cols-2">
        <Field label="Eyebrow" value={content.hero.eyebrow} onChange={v=>hero('eyebrow',v)}/>
        <Field label="Texto de performance" value={content.hero.ratingText} onChange={v=>hero('ratingText',v)}/>
        <Field className="span-2" label="Título" multiline value={content.hero.title} onChange={v=>hero('title',v)}/>
        <Field label="Percentual principal" type="number" value={String(content.hero.performancePercent)} onChange={v=>hero('performancePercent',Number(v))}/>
        <Field label="Label do percentual" value={content.hero.performanceLabel} onChange={v=>hero('performanceLabel',v)}/>
        <Field label="Botão principal" value={content.hero.primaryButton} onChange={v=>hero('primaryButton',v)}/>
        <Field label="Botão secundário" value={content.hero.secondaryButton} onChange={v=>hero('secondaryButton',v)}/>
        <ImageField label="Imagem da hero" url={content.hero.imageUrl} onFile={e=>chooseImage(e,url=>hero('imageUrl',url))}/>
      </div></section>

      <section className="cms-panel"><div className="cms-panel-title"><div><span>02</span><h2>Próxima reunião</h2></div></div><div className="cms-fields">
        <Field label="Label" value={content.nextMeeting.label} onChange={v=>nextMeeting('label',v)}/>
        <Field label="Data e hora" value={content.nextMeeting.dateTime} onChange={v=>nextMeeting('dateTime',v)}/>
      </div></section>

      <section className="cms-panel"><div className="cms-panel-title"><div><span>03</span><h2>Perfil</h2></div></div><div className="cms-fields">
        <Field label="Nome" value={content.profile.name} onChange={v=>profile('name',v)}/>
        <Field label="Plano" value={content.profile.planLabel} onChange={v=>profile('planLabel',v)}/>
        <ImageField label="Foto do perfil" url={content.profile.avatarUrl} onFile={e=>chooseImage(e,url=>profile('avatarUrl',url))}/>
      </div></section>

      <section className="cms-panel wide"><div className="cms-panel-title"><div><span>04</span><h2>Cards</h2></div></div><div className="cms-card-editors">
        {content.cards.map((card,index)=><div className="cms-card-editor" key={card.slug}><div className="cms-mini-head"><strong>{card.slug}</strong><span>{card.percentage}%</span></div>
          <Field label="Título" value={card.title} onChange={value=>setContent(v=>({...v,cards:v.cards.map((x,i)=>i===index?{...x,title:value}:x)}))}/>
          <Field label="Descrição" multiline value={card.description} onChange={value=>setContent(v=>({...v,cards:v.cards.map((x,i)=>i===index?{...x,description:value}:x)}))}/>
          <div className="cms-fields cols-2"><Field label="Percentual" type="number" value={String(card.percentage)} onChange={value=>setContent(v=>({...v,cards:v.cards.map((x,i)=>i===index?{...x,percentage:Number(value)}:x)}))}/><Field label="CTA" value={card.ctaLabel} onChange={value=>setContent(v=>({...v,cards:v.cards.map((x,i)=>i===index?{...x,ctaLabel:value}:x)}))}/></div>
          <ImageField label="Imagem de fundo" url={card.imageUrl} onFile={e=>chooseImage(e,url=>setContent(v=>({...v,cards:v.cards.map((x,i)=>i===index?{...x,imageUrl:url}:x)})))}/>
        </div>)}
      </div></section>

      <section className="cms-panel wide"><div className="cms-panel-title"><div><span>05</span><h2>Carrossel superior</h2></div><Field compact label="Intervalo (ms)" type="number" value={String(content.carouselIntervalMs)} onChange={v=>setContent(x=>({...x,carouselIntervalMs:Number(v)}))}/></div>
        <div className="cms-carousel-editors">{content.carousel.map((item,index)=><div className="cms-carousel-editor" key={item.id||index}><div className="cms-mini-head"><strong>Slide {index+1}</strong><button title="Desativar" onClick={()=>setContent(v=>({...v,carousel:v.carousel.map((x,i)=>i===index?{...x,isActive:false}:x)}))}><Trash2 size={15}/></button></div>
          <Field label="Título" value={item.title} onChange={value=>setContent(v=>({...v,carousel:v.carousel.map((x,i)=>i===index?{...x,title:value}:x)}))}/>
          <Field label="Subtítulo" value={item.subtitle} onChange={value=>setContent(v=>({...v,carousel:v.carousel.map((x,i)=>i===index?{...x,subtitle:value}:x)}))}/>
          <ImageField label="Foto do slide" url={item.imageUrl} onFile={e=>chooseImage(e,url=>setContent(v=>({...v,carousel:v.carousel.map((x,i)=>i===index?{...x,imageUrl:url}:x)})))}/>
          <label className="cms-check"><input type="checkbox" checked={item.isActive} onChange={e=>setContent(v=>({...v,carousel:v.carousel.map((x,i)=>i===index?{...x,isActive:e.target.checked}:x)}))}/><Check size={14}/>Ativo</label>
        </div>)}</div>
        <button className="cms-add" onClick={()=>setContent(v=>({...v,carousel:[...v.carousel,{title:'Novo slide',subtitle:'Subtítulo',imageUrl:'',sortOrder:v.carousel.length,isActive:true}]}))}><Plus size={17}/>Adicionar slide</button>
      </section>

      <section className="cms-panel"><div className="cms-panel-title"><div><span>06</span><h2>Navegação</h2></div></div><div className="cms-fields">
        <Field label="Placeholder de busca" value={content.navigation.searchPlaceholder} onChange={value=>setContent(v=>({...v,navigation:{...v.navigation,searchPlaceholder:value}}))}/>
        <Field label="Menu superior (separado por |)" value={content.navigation.top.join(' | ')} onChange={value=>setContent(v=>({...v,navigation:{...v.navigation,top:value.split('|').map(x=>x.trim()).filter(Boolean)}}))}/>
        <Field label="Menu lateral (separado por |)" multiline value={content.navigation.sidebar.join(' | ')} onChange={value=>setContent(v=>({...v,navigation:{...v.navigation,sidebar:value.split('|').map(x=>x.trim()).filter(Boolean)}}))}/>
      </div></section>
    </div>
  </main>;
}

function Field({label,value,onChange,multiline=false,type='text',className='',compact=false}:{label:string;value:string;onChange:(v:string)=>void;multiline?:boolean;type?:string;className?:string;compact?:boolean}){
  return <label className={`cms-field ${className} ${compact?'compact':''}`}><span>{label}</span>{multiline?<textarea value={value} onChange={e=>onChange(e.target.value)}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)}/>}</label>;
}
function ImageField({label,url,onFile}:{label:string;url:string;onFile:(e:ChangeEvent<HTMLInputElement>)=>void}){
  return <div className="cms-image-field"><span>{label}</span><div className="cms-image-preview" style={url?{backgroundImage:`url(${url})`}:undefined}>{!url&&<ImagePlus size={22}/>}</div><label className="cms-upload"><ImagePlus size={15}/>Trocar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile}/></label></div>;
}
