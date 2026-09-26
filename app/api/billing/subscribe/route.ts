import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PRICES={pro:79.9,premium:197} as const;
export async function POST(req:NextRequest){
 const token=process.env.MERCADOPAGO_ACCESS_TOKEN;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!token||!url||!key)return NextResponse.json({error:'Configuração de pagamento indisponível.'},{status:503});
 const jar=await cookies();
 const supabase=createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll(){}}});
 const {data:{user}}=await supabase.auth.getUser();
 if(!user?.email)return NextResponse.json({error:'Faça login para assinar.'},{status:401});
 const body=await req.json().catch(()=>({}));
 const plan=body.plan as keyof typeof PRICES;
 if(!PRICES[plan])return NextResponse.json({error:'Plano inválido.'},{status:400});
 const origin=new URL(req.url).origin;
 const external_reference=user.id+'|'+plan;
 const payload:any={
   reason:plan==='pro'?'NOZA PRO':'NOZA PREMIUM',
   external_reference,
   payer_email:user.email,
   back_url:origin+'/planos?billing=return',
   auto_recurring:{frequency:1,frequency_type:'months',transaction_amount:PRICES[plan],currency_id:'BRL'}
 };
 if(plan==='pro')payload.auto_recurring.free_trial={frequency:7,frequency_type:'days'};
 const mp=await fetch('https://api.mercadopago.com/preapproval',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
 const data=await mp.json();
 if(!mp.ok)return NextResponse.json({error:'Não foi possível iniciar a assinatura.',detail:data?.message},{status:502});
 await supabase.from('profiles').update({plan,subscription_status:'pending',mercadopago_preapproval_id:data.id,trial_started_at:plan==='pro'?new Date().toISOString():null,trial_ends_at:plan==='pro'?new Date(Date.now()+7*86400000).toISOString():null}).eq('id',user.id);
 return NextResponse.json({url:data.init_point});
}