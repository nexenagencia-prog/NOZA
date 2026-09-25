import {NextResponse,type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return response;
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(cookies){cookies.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const {data:{user}}=await supabase.auth.getUser();
 const path=request.nextUrl.pathname;
 const publicPath=path.startsWith('/login')||path.startsWith('/auth/callback')||path.startsWith('/api/');
 if(!user&&!publicPath){const next=request.nextUrl.clone();next.pathname='/login';next.searchParams.set('next',path);return NextResponse.redirect(next)}
 if(user&&path==='/login')return NextResponse.redirect(new URL('/',request.url));
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']};
