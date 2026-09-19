'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GripHorizontal, X } from 'lucide-react';
import './floating-calculator.css';

type Props={open:boolean;onClose:()=>void};
type Op='+'|'-'|'×'|'÷'|null;

const fmt=(n:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:8}).format(n);

export default function FloatingCalculator({open,onClose}:Props){
  const [display,setDisplay]=useState('0');
  const [stored,setStored]=useState<number|null>(null);
  const [op,setOp]=useState<Op>(null);
  const [waiting,setWaiting]=useState(false);
  const [history,setHistory]=useState<Array<{expr:string;result:string}>>([]);
  const [pos,setPos]=useState({x:0,y:0});
  const drag=useRef<{sx:number;sy:number;ox:number;oy:number}|null>(null);

  useEffect(()=>{if(open)setPos({x:0,y:0})},[open]);
  useEffect(()=>{
    const move=(e:PointerEvent)=>{if(!drag.current)return;setPos({x:drag.current.ox+e.clientX-drag.current.sx,y:drag.current.oy+e.clientY-drag.current.sy})};
    const up=()=>{drag.current=null};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)};
  },[]);

  const expression=useMemo(()=>stored!==null&&op?`${fmt(stored)} ${op} ${waiting?'':display}`:'',[stored,op,waiting,display]);
  if(!open)return null;

  const input=(v:string)=>{if(waiting||display==='0'){setDisplay(v);setWaiting(false)}else setDisplay(d=>d+v)};
  const decimal=()=>{if(waiting){setDisplay('0,');setWaiting(false);return}if(!display.includes(','))setDisplay(d=>d+',')};
  const n=()=>Number(display.replace(/\./g,'').replace(',','.'))||0;
  const calc=(a:number,b:number,o:Op)=>o==='+'?a+b:o==='-'?a-b:o==='×'?a*b:o==='÷'?(b===0?0:a/b):b;
  const choose=(next:Op)=>{const cur=n();if(stored!==null&&op&&!waiting){const r=calc(stored,cur,op);setStored(r);setDisplay(fmt(r));}else setStored(cur);setOp(next);setWaiting(true)};
  const equals=()=>{if(stored===null||!op)return;const cur=n();const r=calc(stored,cur,op);const expr=`${fmt(stored)} ${op} ${fmt(cur)}`;const result=fmt(r);setDisplay(result);setHistory(h=>[{expr,result},...h].slice(0,4));setStored(null);setOp(null);setWaiting(true)};
  const clear=()=>{setDisplay('0');setStored(null);setOp(null);setWaiting(false)};
  const sign=()=>setDisplay(fmt(-n()));
  const pct=()=>setDisplay(fmt(n()/100));

  return <div className="floating-calc-layer" aria-live="polite">
    <section className="floating-calc" style={{transform:`translate(calc(-50% + ${pos.x}px),calc(-50% + ${pos.y}px))`}}>
      <header className="floating-calc-head" onPointerDown={e=>{drag.current={sx:e.clientX,sy:e.clientY,ox:pos.x,oy:pos.y}}}>
        <div><span className="floating-calc-accent"/><h3>Calculadora</h3><p>Simples. Poderosa. Sempre com você.</p></div>
        <GripHorizontal className="floating-calc-grip" size={20}/>
        <button className="floating-calc-close" aria-label="Fechar calculadora" onPointerDown={e=>e.stopPropagation()} onClick={onClose}><X size={17}/></button>
      </header>
      <div className="floating-calc-display"><span>{expression}</span><strong>{display}</strong></div>
      <div className="floating-calc-grid">
        <button onClick={clear}>AC</button><button onClick={sign}>+/−</button><button onClick={pct}>%</button><button onClick={()=>choose('÷')}>÷</button>
        {['7','8','9'].map(v=><button key={v} onClick={()=>input(v)}>{v}</button>)}<button onClick={()=>choose('×')}>×</button>
        {['4','5','6'].map(v=><button key={v} onClick={()=>input(v)}>{v}</button>)}<button onClick={()=>choose('-')}>−</button>
        {['1','2','3'].map(v=><button key={v} onClick={()=>input(v)}>{v}</button>)}<button onClick={()=>choose('+')}>+</button>
        <button className="zero" onClick={()=>input('0')}>0</button><button onClick={decimal}>,</button><button className="equals" onClick={equals}>=</button>
      </div>
      <div className="floating-calc-history"><div className="floating-calc-history-head"><strong>Histórico</strong><button onClick={()=>setHistory([])}>Limpar</button></div>{history.length?history.map((h,i)=><div className="floating-calc-history-row" key={`${h.expr}-${i}`}><span>{h.expr}</span><b>{h.result}</b></div>):<div className="floating-calc-history-empty">Sem cálculos recentes</div>}</div>
    </section>
  </div>;
}
