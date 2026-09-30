'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import './login.css';

export default function Login() {
  const router = useRouter();
  const s = createClient();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');

    try {
      if (mode === 'forgot') {
        const { error } = await s.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + '/login?reset=1',
        });
        if (error) throw error;
        setMsg('Enviamos as instruções para o seu e-mail.');
      } else if (mode === 'signup') {
        const { data, error } = await s.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;

        if (data.session) {
          window.location.replace('/');
          return;
        }

        const { error: loginError } = await s.auth.signInWithPassword({ email, password });
        if (!loginError) {
          window.location.replace('/');
          return;
        }

        setMsg('Não foi possível iniciar sua sessão. Tente entrar novamente.');
      } else {
        const { error } = await s.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.replace('/');
      }
    } catch (x: any) {
      const m = String(x?.message || '');
      if (m.includes('User already registered') || m.includes('user_already_exists')) {
        setMsg('Este e-mail já possui uma conta. Faça login ou recupere sua senha.');
      } else if (m.includes('Invalid login credentials')) {
        setMsg('E-mail ou senha incorretos. Confira os dados ou recupere sua senha.');
      } else {
        setMsg(m || 'Não foi possível concluir. Tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    await s.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + '/auth/callback' },
    });
  };

  return (
    <main className="auth">
      <div className="auth-atmosphere" aria-hidden="true" />
      <div className="auth-noise" aria-hidden="true" />

      <header className="auth-brand">
        <Image src="/noza-logo.svg" alt="NOZA" width={150} height={44} priority />
      </header>

      <section className="auth-intro">
        <div className="intro-kicker">
          <span className="intro-line" />
          INTELIGÊNCIA · PADRÕES · EVOLUÇÃO
        </div>

        <h1>
          Você não veio aqui
          <br />
          para saber mais.
          <strong>
            Veio para perceber
            <br />
            o que ainda não percebe.
          </strong>
        </h1>

        <p>
          A NOZA aprende como você pensa, identifica seus padrões
          <br className="desktop-only" />
          e mostra o que realmente merece ser desenvolvido.
        </p>

        <div className="auth-brain" aria-hidden="true">
          <div className="brain-glow" />
          <Image
            src="/noza-skills-brain.png"
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 55vw, 520px"
          />
          <span className="brain-node node-perception">PERCEPÇÃO</span>
          <span className="brain-node node-reasoning">RACIOCÍNIO</span>
          <span className="brain-node node-influence">INFLUÊNCIA</span>
          <span className="brain-node node-adaptability">ADAPTABILIDADE</span>
        </div>
      </section>

      <section className="auth-card" aria-label="Acesso à NOZA">
        <div className="card-logo">
          <Image src="/noza-logo.svg" alt="NOZA" width={128} height={38} priority />
        </div>

        <div className="auth-copy">
          <span>{mode === 'forgot' ? 'RECUPERAR ACESSO' : mode === 'signup' ? 'COMEÇAR AGORA' : 'ACESSO À INTELIGÊNCIA'}</span>
          <h2>
            {mode === 'forgot'
              ? 'Recupere seu acesso.'
              : mode === 'signup'
                ? 'Pronto para começar?'
                : 'Você está pronto para evoluir?'}
          </h2>
          <p>
            {mode === 'forgot'
              ? 'Informe seu e-mail e enviaremos as instruções.'
              : mode === 'signup'
                ? 'Crie seu acesso e comece a construir seu mapa de evolução.'
                : 'Entre para continuar construindo sua evolução com a NOZA.'}
          </p>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome e sobrenome"
              autoComplete="name"
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            autoComplete="email"
            required
          />

          {mode !== 'forgot' && (
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '◉' : '◎'}
              </button>
            </div>
          )}

          <button className="primary" disabled={busy}>
            {busy ? 'Aguarde...' : mode === 'signup' ? 'Criar minha conta' : mode === 'forgot' ? 'Enviar instruções' : 'Entrar na NOZA'}
            {!busy && mode === 'login' && <span className="button-arrow">→</span>}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="or"><i /><span>ou</span><i /></div>
            <button className="google" type="button" onClick={google}>
              <span className="google-mark">G</span>
              Continuar com Google
            </button>
          </>
        )}

        {msg && <div className="auth-msg">{msg}</div>}

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button onClick={() => { setMsg(''); setMode('forgot'); }}>Esqueci minha senha</button>
              <button onClick={() => { setMsg(''); setMode('signup'); }}>Criar minha conta</button>
            </>
          )}
          {mode !== 'login' && (
            <button onClick={() => { setMsg(''); setMode('login'); }}>Voltar para entrar</button>
          )}
        </div>

        <div className="auth-foot">Sua evolução começa quando você começa a se perceber.</div>
      </section>

      <div className="auth-signature">NOZA / INTELLIGENCE FOR HUMAN EVOLUTION</div>
    </main>
  );
}
