type Guest={name?:string;email:string};

function escape(value:string){
  return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
}

export async function sendAgendaEmail(guests:Guest[],subject:string,title:string,body:string,id:string){
  const to=[...new Set(guests.map(g=>g.email).filter(Boolean))];
  const configured=Boolean(process.env.RESEND_API_KEY&&process.env.NOZA_MEETINGS_FROM);
  if(!to.length)return{configured,total:0,sent:0,failed:0};
  const key=process.env.RESEND_API_KEY,from=process.env.NOZA_MEETINGS_FROM;
  if(!key||!from)return{configured:false,total:to.length,sent:0,failed:0};

  const appBase=(process.env.NOZA_APP_URL||'https://noza-silk.vercel.app').replace(/\\/+$/,'');
  const loginUrl=appBase+'/login?next=%2Fagenda';
  let sent=0,failed=0;
  await Promise.all(to.map(async address=>{
    try{
      const res=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{authorization:'Bearer '+key,'content-type':'application/json'},
        body:JSON.stringify({
          from,
          to:address,
          subject:'NOZA · '+title+': '+subject,
          html:'<div style="background:#0b0e0d;color:#eff5f2;padding:32px;font:15px Arial"><div style="max-width:520px;margin:auto;padding:26px;border:1px solid #2a3733;border-radius:14px;background:#121817"><p style="color:#70d9c2;letter-spacing:2px;font-size:10px">NOZA · AGENDA</p><h1>'+escape(title)+'</h1><h3>'+escape(subject)+'</h3><p style="color:#b7c3be;line-height:1.6">'+escape(body)+'</p><a href="'+escape(loginUrl)+'" style="display:inline-block;margin:12px 0 18px;padding:13px 18px;border-radius:8px;background:#e8e8e4;color:#111;text-decoration:none;font-weight:700">Entrar na NOZA e abrir a Agenda</a><p style="color:#87938e;font-size:12px;line-height:1.5">Se você ainda não tem uma conta, crie seu acesso com este e-mail para continuar.</p><small style="color:#798580">Reunião '+escape(id)+'</small></div></div>'
        })
      });
      if(res.ok)sent++;else failed++;
    }catch{failed++}
  }));
  return{configured:true,total:to.length,sent,failed};
}
