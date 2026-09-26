import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export async function POST(req:NextRequest){
 const token=process.env.MERCADOPAGO_ACCESS_TOKEN;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!token||!url||!service)return NextResponse.json({ok:false},{status:503});
 const body=await req.json().catch(()=>({}));
 const id=body?.data?.id||new URL(req.url).searchParams.get('id');
 if(!id)return NextResponse.json({ok:true});
 const mp=await fetch('https://api.mercadopago.com/preapproval/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token},cache:'no-store'});
 if(!mp.ok)return NextResponse.json({ok:true});
 const sub=await mp.json();
 const [userId,plan='pro']=String(sub.external_reference||'').split('|');
 if(!userId)return NextResponse.json({ok:true});
 const map:any={authorized:'active',pending:'pending',paused:'paused',cancelled:'canceled'};
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 await admin.from('profiles').update({plan:plan==='premium'?'premium':'pro',subscription_status:map[sub.status]||'pending',mercadopago_preapproval_id:String(sub.id),current_period_end:sub.next_payment_date||null}).eq('id',userId);
 return NextResponse.json({ok:true});
}