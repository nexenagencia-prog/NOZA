import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { safeNextPath } from '../../../lib/cms/auth.mjs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'), '/cms');
  const destination = new URL(next, url.origin);

  if (!code) {
    destination.pathname = '/cms/login';
    destination.searchParams.set('error', 'callback');
    return NextResponse.redirect(destination);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return NextResponse.redirect(destination);
  } catch {
    const login = new URL('/cms/login', url.origin);
    login.searchParams.set('error', 'callback');
    return NextResponse.redirect(login);
  }
}
