import {NextResponse,type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';

export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
 const path=request.nextUrl.pathname;
 if(path.startsWith('/api/')||path.startsWith('/auth/callback'))return response;
 const publicPath=path.startsWith('/login');
 const hasAuthCookie=request.cookies.getAll().some(cookie=>cookie.name.includes('-auth-token'));
 if(!hasAuthCookie){if(publicPath)return response;const next=request.nextUrl.clone();next.pathname='/login';next.searchParams.set('next',path+request.nextUrl.search);return NextResponse.redirect(next)}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return response;

 const supabase=createServerClient(url,key,{cookies:{
  getAll(){return request.cookies.getAll()},
  setAll(cookies){cookies.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options))}
 }});

 try{
  const auth=await Promise.race([
   supabase.auth.getUser(),
   new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('auth-timeout')),1800))
  ]);
  const user=auth.data.user;
  if(!user&&!publicPath){const next=request.nextUrl.clone();next.pathname='/login';next.searchParams.set('next',path+request.nextUrl.search);return NextResponse.redirect(next)}
  if(user&&path==='/login'){const target=request.nextUrl.searchParams.get('next')||'/';return NextResponse.redirect(new URL(target.startsWith('/')&&!target.startsWith('//')?target:'/',request.url))}
 }catch{
  // Keep the application reachable if the auth provider is temporarily slow.
  // Protected server APIs still validate authentication independently.
  return response;
 }
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']};