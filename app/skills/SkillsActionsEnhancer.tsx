'use client';

import {useEffect} from 'react';

const actions=[
  {title:'Enviar proposta',meta:'Sandro Belo até sexta-feira às 14:00'},
  {title:'Revisar contrato',meta:'Antes de enviar'},
  {title:'Agendar nova reunião',meta:'Próximo passo'},
];

export default function SkillsActionsEnhancer(){
  useEffect(()=>{
    const apply=()=>{
      const cards=Array.from(document.querySelectorAll<HTMLElement>('.skills-bottom-grid .skills-detail-card'));
      const card=cards.find(item=>item.querySelector('h3')?.textContent?.trim()==='Próximas ações');
      if(!card || card.dataset.actionsEnhanced==='true') return;

      const source=card.querySelector<HTMLLabelElement>('label.skills-action');
      if(!source) return;

      card.querySelectorAll('label.skills-action').forEach(item=>item.remove());
      actions.forEach(({title,meta})=>{
        const row=source.cloneNode(true) as HTMLLabelElement;
        const input=row.querySelector<HTMLInputElement>('input[type="checkbox"]');
        const strong=row.querySelector('strong');
        const paragraph=row.querySelector('p');
        if(input) input.checked=false;
        if(strong) strong.textContent=title;
        if(paragraph) paragraph.textContent=meta;
        card.appendChild(row);
      });
      card.dataset.actionsEnhanced='true';
    };

    apply();
    const observer=new MutationObserver(apply);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);

  return null;
}
