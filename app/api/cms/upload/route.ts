import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { isAdminEmail } from '../../../../lib/cms/auth.mjs';
import { validateImage } from '../../../../lib/cms/validation.mjs';

export async function POST(request:Request){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user || !isAdminEmail(user.email)) return NextResponse.json({error:'Não autorizado.'},{status:401});

  const form=await request.formData();
  const file=form.get('file');
  if(!(file instanceof File)) return NextResponse.json({error:'Selecione uma imagem.'},{status:400});
  try{ validateImage(file); }
  catch(e){ return NextResponse.json({error:e instanceof Error?e.message:'Imagem inválida.'},{status:400}); }

  const ext=file.name.split('.').pop()?.toLowerCase() || (file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg');
  const safeExt=['jpg','jpeg','png','webp'].includes(ext)?ext:'jpg';
  const path=`zyvo/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
  const bytes=new Uint8Array(await file.arrayBuffer());
  const upload=await supabase.storage.from('cms-media').upload(path,bytes,{contentType:file.type,upsert:false});
  if(upload.error) return NextResponse.json({error:'Falha no upload. A imagem anterior foi preservada.'},{status:500});
  const {data}=supabase.storage.from('cms-media').getPublicUrl(path);
  return NextResponse.json({url:data.publicUrl,path});
}
