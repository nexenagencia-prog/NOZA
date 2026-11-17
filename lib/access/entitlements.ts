import {createClient} from '@supabase/supabase-js';
import type {User} from '@supabase/supabase-js';

export type AccessResult={allowed:boolean;plan:'admin'|'free'|'start'|'pro'|'business'|'none';reason:string;expiresAt:string|null};
const PAID=new Set(['start','pro','business']);
export async function getEntitlement(user:User):Promise<AccessResult>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return {allowed:false,plan:'none',reason:'Configuração de acesso indisponível.',expiresAt:null};
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 // A role is set by an authorized database administrator, never from user metadata or email.
 const {data,error}=await admin.from('noza_entitlements').select('role,plan,status,trial_started_at,trial_ends_at').eq('user_id',user.id).maybeSingle();
 if(error)return {allowed:false,plan:'none',reason:'Não foi possível validar o acesso.',expiresAt:null};
 if(data?.role==='admin')return {allowed:true,plan:'admin',reason:'',expiresAt:null};
 if(data?.status==='active'&&PAID.has(data.plan))return {allowed:true,plan:data.plan,reason:'',expiresAt:null};
 if(data?.plan==='free'&&data.status==='trialing'&&data.trial_ends_at&&new Date(data.trial_ends_at).getTime()>Date.now())
  return {allowed:true,plan:'free',reason:'',expiresAt:data.trial_ends_at};
 return {allowed:false,plan:'none',reason:'Seu período gratuito terminou ou você ainda não tem um plano ativo.',expiresAt:null};
}
