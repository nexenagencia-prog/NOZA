import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '../../../../lib/supabase/server';
import {getEntitlement} from '../../../../lib/access/entitlements';
export const dynamic='force-dynamic';
export async function GET(){
 const supabase=await createServerSupabaseClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({allowed:false,reason:'Faça login.'},{status:401});
 const result=await getEntitlement(user);
 return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
}
