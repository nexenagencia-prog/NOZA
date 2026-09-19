'use client';
import '../auth.css';
import { FormEvent, useMemo, useState } from 'react';
import { createBrowserSupabaseClient } from '../../../lib/supabase/client';
import { validatePassword } from '../../../lib/cms/validation.mjs';

export default function ResetPasswordPage(){
  const supabase=useMemo(()=>createBrowserSupabaseClient(),[]);
  const [nextPassword,setNextPassword]=useState('');
  const [confirmation,setConfirmation]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent){
    event.preventDefault();
    setMessage('');
    let value:string;
    try{ value=validatePassword(nextPassword,confirmation); }catch(e){ setMessage(e instanceof Error?e.message:'Revise os dados.'); return; }
    setBusy(true);
    const session=await supabase.auth.getSession();
    if(!session.data.session){ setBusy(false); setMessage('Sua sessão expirou. Solicite um novo link de recuperação.'); return; }
    const result=await supabase.auth.updateUser({password:value});
    if(result.error){ setBusy(false); setMessage('Não foi possível definir a nova senha. Solicite um novo link.'); return; }
    const state=await supabase.from('admin_users').update({must_change_password:false,updated_at:new Date().toISOString()}).eq('email','sandrobellomind@gmail.com');
    if(state.error){ setBusy(false); setMessage('Senha alterada. Entre novamente para concluir o acesso.'); return; }
    window.location.href='/cms';
  }
  return <main className="cms-auth-page"><section className="cms-auth-card"><div className="cms-auth-brand">NOZA CMS</div><h1>Definir nova senha</h1><p>Crie uma nova senha com pelo menos 12 caracteres.</p><form className="cms-auth-form" onSubmit={submit}><div className="cms-auth-field"><label>Nova senha</label><input type="password" value={nextPassword} onChange={e=>setNextPassword(e.target.value)} minLength={12} required/></div><div className="cms-auth-field"><label>Confirmar nova senha</label><input type="password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} minLength={12} required/></div>{message&&<div className="cms-auth-message cms-auth-error">{message}</div>}<button className="cms-auth-submit" disabled={busy}>{busy?'Salvando...':'Salvar nova senha'}</button></form></section></main>;
}
