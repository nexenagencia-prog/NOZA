'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ArrowUp, RotateCcw, X } from 'lucide-react';
import './floating-ai-chat.css';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const welcome: ChatMessage = {
  role: 'assistant',
  content: 'Sou a NOZA. Posso te ajudar com negócios, vendas, persuasão, estratégia, marketing, gestão e decisões comerciais. O que você quer resolver agora?'
};

export default function FloatingAIChat(){
  const [open,setOpen]=useState(false);
  const [messages,setMessages]=useState<ChatMessage[]>([welcome]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const endRef=useRef<HTMLDivElement>(null);
  const textareaRef=useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{
    if(open){
      requestAnimationFrame(()=>textareaRef.current?.focus());
    }
  },[open]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:'smooth'});
  },[messages,loading]);

  const reset=()=>{
    setMessages([welcome]);
    setInput('');
    setLoading(false);
  };

  const submit=async(e?:FormEvent)=>{
    e?.preventDefault();
    const text=input.trim();
    if(!text||loading)return;

    const next=[...messages,{role:'user' as const,content:text}];
    setMessages(next);
    setInput('');
    setLoading(true);

    try{
      const response=await fetch('/api/zybos',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:next})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data?.error||'Não foi possível responder agora.');
      setMessages(current=>[...current,{role:'assistant',content:data.answer||'Não consegui gerar uma resposta agora.'}]);
    }catch(error){
      const message=error instanceof Error?error.message:'Não foi possível responder agora.';
      setMessages(current=>[...current,{role:'assistant',content:message}]);
    }finally{
      setLoading(false);
    }
  };

  const onKeyDown=(e:KeyboardEvent<HTMLTextAreaElement>)=>{
    if(e.key==='Enter'&&!e.shiftKey){
      e.preventDefault();
      void submit();
    }
  };

  return (
    <>
      {open&&<button className="zybos-backdrop" aria-label="Fechar NOZA" onClick={()=>setOpen(false)} />}

      <section className={`zybos-panel${open?' is-open':''}`} aria-hidden={!open} aria-label="NOZA — inteligência de negócios">
        <header className="zybos-header">
          <div className="zybos-brand">
            <img src="/zyvo-chat-icon.webp" alt="" aria-hidden="true" />
            <div>
              <strong>NOZA</strong>
              <span><i /> Inteligência de negócios</span>
            </div>
          </div>
          <div className="zybos-header-actions">
            <button type="button" onClick={reset} aria-label="Nova conversa"><RotateCcw size={15}/></button>
            <button type="button" onClick={()=>setOpen(false)} aria-label="Fechar"><X size={17}/></button>
          </div>
        </header>

        <div className="zybos-messages" aria-live="polite">
          {messages.map((message,index)=>(
            <div key={`${message.role}-${index}`} className={`zybos-message ${message.role}`}>
              {message.role==='assistant'&&<img src="/zyvo-chat-icon.webp" alt="" aria-hidden="true" />}
              <div>{message.content}</div>
            </div>
          ))}
          {loading&&(
            <div className="zybos-message assistant">
              <img src="/zyvo-chat-icon.webp" alt="" aria-hidden="true" />
              <div className="zybos-typing"><span/><span/><span/></div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        <form className="zybos-composer" onSubmit={submit}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={5000}
            placeholder="Pergunte qualquer coisa à NOZA..."
            aria-label="Mensagem para a NOZA"
          />
          <button type="submit" disabled={!input.trim()||loading} aria-label="Enviar mensagem">
            <ArrowUp size={18}/>
          </button>
        </form>
        <p className="zybos-hint">A NOZA pode cometer erros. Revise informações importantes.</p>
      </section>

      <button className={`zyvo-ai-chat${open?' is-open':''}`} type="button" aria-label={open?'Fechar NOZA':'Abrir NOZA'} onClick={()=>setOpen(v=>!v)}>
        <img src="/zyvo-chat-icon.webp" alt="" aria-hidden="true" />
        <span className="zyvo-ai-chat-dot" aria-hidden="true" />
      </button>
    </>
  );
}
