import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { data, error } = await supabase.from('free_experiences')
    .select('started_at,ends_at').eq('user_id',user.id).maybeSingle();
  if (error) return NextResponse.json({ error: 'Experiência indisponível. Verifique a configuração do banco.' }, { status: 503 });
  const endsAt = data?.ends_at ?? null;
  const active = !!endsAt && Date.parse(endsAt) > Date.now();
  return NextResponse.json({ plan: 'experiencia-free', active, endsAt, daysRemaining: active ? Math.ceil((Date.parse(endsAt!) - Date.now()) / 86400000) : 0, meetingMinutes: 30, maxParticipants: 2, transcription: false, ai: false, recording: false }, { headers: { 'Cache-Control': 'no-store' } });
}
