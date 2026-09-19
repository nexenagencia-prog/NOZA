import type {HomeContent} from './types';
import {createServerSupabaseClient} from '../supabase/server';

const fallback:HomeContent={hero:{eyebrow:'PERFORMANCE INTELLIGENCE',title:'Sua performance evolui com você.',ratingText:'Evolução contínua',performancePercent:82,performanceLabel:'performance',primaryButton:'Iniciar',secondaryButton:'Ver Skills',imageUrl:''},nextMeeting:{label:'Próxima reunião',dateTime:''},profile:{name:'Sandro',avatarUrl:'',planLabel:'PRO'},navigation:{searchPlaceholder:'Buscar',top:['Início','Skills','Agenda','Planos e Preços'],sidebar:['Início','Agenda','Reuniões','Gravações','Anotar','Calculadora','Skills','Human Pro','Planos e Preços','Sair']},cards:[],carousel:[],carouselIntervalMs:6000};

export async function loadHomeContent():Promise<HomeContent>{
 try{
  const s=await createServerSupabaseClient();
  const [site,cards,carousel]=await Promise.all([s.from('site_content').select('section,key,value'),s.from('home_cards').select('*').eq('is_active',true).order('sort_order'),s.from('carousel_items').select('*').eq('is_active',true).order('sort_order')]);
  const out:HomeContent=JSON.parse(JSON.stringify(fallback));
  for(const row of site.data||[]){if(row.section==='hero'&&row.key in out.hero)(out.hero as any)[row.key]=row.value;else if(row.section==='nextMeeting'&&row.key in out.nextMeeting)(out.nextMeeting as any)[row.key]=row.value;else if(row.section==='profile'&&row.key in out.profile)(out.profile as any)[row.key]=row.value;else if(row.section==='navigation'&&row.key in out.navigation)(out.navigation as any)[row.key]=row.value;else if(row.section==='settings'&&row.key==='carouselIntervalMs')out.carouselIntervalMs=Number(row.value)||6000}
  if(cards.data?.length)out.cards=cards.data.map((x:any)=>({slug:x.slug,title:x.title,description:x.description,percentage:Number(x.percentage)||0,imageUrl:x.image_url||'',ctaLabel:x.cta_label||'',sortOrder:Number(x.sort_order)||0,isActive:x.is_active!==false}));
  if(carousel.data?.length)out.carousel=carousel.data.map((x:any)=>({id:x.id,title:x.title,subtitle:x.subtitle||'',imageUrl:x.image_url||'',sortOrder:Number(x.sort_order)||0,isActive:x.is_active!==false}));
  return out;
 }catch{return fallback}
}
