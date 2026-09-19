import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { isAdminEmail } from '../../../../lib/cms/auth.mjs';
import { loadHomeContent } from '../../../../lib/cms/repository';
import { validateHomePayload } from '../../../../lib/cms/payload.mjs';

async function authorized(){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user || !isAdminEmail(user.email)) return {supabase:null,user:null};
  return {supabase,user};
}

export async function GET(){
  const {user}=await authorized();
  if(!user) return NextResponse.json({error:'Não autorizado.'},{status:401});
  return NextResponse.json(await loadHomeContent());
}

export async function PUT(request:Request){
  const {supabase,user}=await authorized();
  if(!supabase || !user) return NextResponse.json({error:'Não autorizado.'},{status:401});
  let content;
  try{ content=validateHomePayload(await request.json()); }
  catch(e){ return NextResponse.json({error:e instanceof Error?e.message:'Conteúdo inválido.'},{status:400}); }

  const siteRows=[
    ['hero','eyebrow',content.hero.eyebrow],['hero','title',content.hero.title],['hero','ratingText',content.hero.ratingText],['hero','performancePercent',content.hero.performancePercent],['hero','performanceLabel',content.hero.performanceLabel],['hero','primaryButton',content.hero.primaryButton],['hero','secondaryButton',content.hero.secondaryButton],['hero','imageUrl',content.hero.imageUrl],
    ['nextMeeting','label',content.nextMeeting.label],['nextMeeting','dateTime',content.nextMeeting.dateTime],
    ['profile','name',content.profile.name],['profile','avatarUrl',content.profile.avatarUrl],['profile','planLabel',content.profile.planLabel],
    ['navigation','searchPlaceholder',content.navigation.searchPlaceholder],['navigation','top',content.navigation.top],['navigation','sidebar',content.navigation.sidebar],
    ['settings','carouselIntervalMs',content.carouselIntervalMs]
  ].map(([section,key,value])=>({section,key,value,updated_at:new Date().toISOString(),updated_by:user.id}));

  const site=await supabase.from('site_content').upsert(siteRows,{onConflict:'section,key'});
  if(site.error) return NextResponse.json({error:'Não foi possível salvar os textos.'},{status:500});

  for(const card of content.cards){
    const payload={slug:card.slug,title:card.title,description:card.description,percentage:card.percentage,image_url:card.imageUrl,cta_label:card.ctaLabel,sort_order:card.sortOrder,is_active:card.isActive,updated_at:new Date().toISOString()};
    const result=await supabase.from('home_cards').upsert(payload,{onConflict:'slug'});
    if(result.error) return NextResponse.json({error:`Não foi possível salvar o card ${card.title}.`},{status:500});
  }

  for(const item of content.carousel){
    const payload={title:item.title,subtitle:item.subtitle,image_url:item.imageUrl,sort_order:item.sortOrder,is_active:item.isActive,updated_at:new Date().toISOString()};
    const result=item.id
      ? await supabase.from('carousel_items').update(payload).eq('id',item.id)
      : await supabase.from('carousel_items').insert(payload);
    if(result.error) return NextResponse.json({error:'Não foi possível salvar o carrossel.'},{status:500});
  }

  revalidateTag('zyvo-home-content');
  revalidatePath('/');
  return NextResponse.json({ok:true,content:await loadHomeContent()});
}
