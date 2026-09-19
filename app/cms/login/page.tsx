'use client';

import '../auth.css';
import { Eye, EyeOff } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { createBrowserSupabaseClient } from '../../../lib/supabase/client';
import { isAdminEmail } from '../../../lib/cms/auth.mjs';

export default function CmsLoginPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [email, setEmail] = useState('sandrobellomind@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState<'error'|'success'|''>('');

  async function login(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!isAdminEmail(email)) {
      setKind('error');
      setMessage('Este e-mail não está autorizado para administrar o NOZA.');
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      setKind('error');
      setMessage('E-mail ou senha inválidos.');
      setBusy(false);
      return;
    }
    const { data: adminState } = await supabase.from('admin_users').select('must_change_password').eq('email', 'sandrobellomind@gmail.com').maybeSingle();
    window.location.href = adminState?.must_change_password ? '/cms/reset-password?first=1' : '/cms';
  }

  async function recover() {
    setMessage('');
    if (!isAdminEmail(email)) {
      setKind('error');
      setMessage('Informe o e-mail administrador cadastrado.');
      return;
    }
    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=/cms/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) {
      setKind('error');
      setMessage('Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.');
    } else {
      setKind('success');
      setMessage('Enviamos o link para definir uma nova senha. Confira sua caixa de entrada e o spam.');
    }
    setBusy(false);
  }

  return <main className="cms-auth-page">
    <section className="cms-auth-card">
      <div className="cms-auth-brand">NOZA CMS</div>
      <h1>Entrar</h1>
      <p>Edite os textos, imagens, percentuais e conteúdo da Home.</p>
      <form className="cms-auth-form" onSubmit={login}>
        <div className="cms-auth-field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required />
        </div>
        <div className="cms-auth-field">
          <label htmlFor="password">Senha</label>
          <div className="cms-auth-password-row">
            <input id="password" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required />
            <button type="button" aria-label="Mostrar ou ocultar senha" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>
          </div>
        </div>
        {message && <div className={`cms-auth-message ${kind==='error'?'cms-auth-error':'cms-auth-success'}`}>{message}</div>}
        <button className="cms-auth-submit" type="submit" disabled={busy}>{busy?'Aguarde...':'Entrar no CMS'}</button>
        <button className="cms-auth-link" type="button" onClick={recover} disabled={busy}>Esqueci minha senha / definir senha</button>
      </form>
      <p className="cms-auth-note">No primeiro acesso com a senha temporária, o sistema exige uma nova senha antes de abrir o painel.</p>
    </section>
  </main>;
}
