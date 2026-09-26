import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

function validSignature(req:NextRequest,dataId:string,secret:string){
 const signature=req.headers.get('x-signature')||'';
 const requestId=req.headers.get('x-request-id')||'';
 const parts=Object.fromEntries(signature.split(',').map(p=>p.trim().split('=')));
 const ts=parts.ts, received=parts.v1;
 if(!ts||!received||!requestId)return false;
 const manifest=`id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
 const expected=createHmac('sha256',secret).update(manifest).digest('hex');
 try{return timingSafeEqual(Buffer.from(expected),Buffer.from(received));}catch{return false;}
}
export async function POST(req:NextRequest){
 const token=process.env.MERCADOPAGO_ACCESS_TOKEN;
 const secret=process.env.MERCADOPAGO_WEBHOOK_SECRET;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!token||!secret||!url||!service)return NextResponse.json({ok:false},{status:503});
 const body=await req.json().catch(()=>({}));
 const u=new URL(req.url);
 const id=String(u.searchParams.get('data.id')||u.searchParams.get('id')||body?.data?.id||'');
 if(!id)return NextResponse.json({ok:true});
 if(!validSignature(req,id,secret))return NextResponse.json({ok:false},{status:401});
 const mp=await fetch('https://api.mercadopago.com/preapproval/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token},cache:'no-store'});
 if(!mp.ok)return NextResponse.json({ok:false},{status:502});
 const sub=await mp.json();
 const [userId,plan='pro']=String(sub.external_reference||'').split('|');
 if(!userId)return NextResponse.json({ok:true});
 const statusMap:Record<string,string>={authorized:'active',pending:'pending',paused:'paused',cancelled:'canceled',canceled:'canceled'};
 const isPro=plan!=='premium';
 const trialEnd=isPro&&sub.auto_recurring?.free_trial&&sub.date_created?new Date(new Date(sub.date_created).getTime()+7*86400000).toISOString():null;
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await admin.from('profiles').update({
  plan:isPro?'pro':'premium',
  subscription_status:statusMap[sub.status]||'pending',
  mercadopago_preapproval_id:String(sub.id),
  mercadopago_payer_id:sub.payer_id?String(sub.payer_id):null,
  trial_started_at:trialEnd?sub.date_created:null,
  trial_ends_at:trialEnd,
  current_period_end:sub.next_payment_date||null
 }).eq('id',userId);
 if(error)return NextResponse.json({ok:false},{status:500});
 return NextResponse.json({ok:true});
}