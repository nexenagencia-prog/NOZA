'use client';
import {useEffect,useRef,useState} from 'react';
import {createClient} from '../../lib/supabase/client';
import type {RealtimeChannel} from '@supabase/supabase-js';

export type RoomParticipant={id:string;userId:string;name:string;image:string;activity:string;active:boolean;muted:boolean;cameraOn:boolean;stream?:MediaStream;local:boolean};
type Presence=Omit<RoomParticipant,'stream'|'local'>;
type Signal={from:string;to:string;description?:RTCSessionDescriptionInit;candidate?:RTCIceCandidateInit};

function initialsImage(name:string){return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#25282b"/><text x="128" y="145" text-anchor="middle" fill="#fff" font-family="Arial" font-size="64">${name.split(/\s+/).map(word=>word[0]).slice(0,2).join('').replace(/[^\p{L}\p{N}]/gu,'')}</text></svg>`)}
async function profileImage(value:string,name:string):Promise<string>{
 if(!value)return initialsImage(name);
 if(!value.startsWith('data:'))return value.startsWith('https://')?value:initialsImage(name);
 return new Promise(resolve=>{const img=new Image();img.onload=()=>{const portrait=img.naturalHeight/img.naturalWidth>1.25;const canvas=document.createElement('canvas');canvas.width=portrait?180:160;canvas.height=portrait?320:160;const ctx=canvas.getContext('2d');if(!ctx)return resolve(initialsImage(name));ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.68))};img.onerror=()=>resolve(initialsImage(name));img.src=value});
}

export function useSpaceRoom(stream:MediaStream|null,cameraOn:boolean,micOn:boolean){
 const [participants,setParticipants]=useState<RoomParticipant[]>([]);
 const [error,setError]=useState('');
 const [self,setSelf]=useState<Presence|null>(null);
 const channelRef=useRef<RealtimeChannel|null>(null);
 const peers=useRef(new Map<string,RTCPeerConnection>());
 const remoteStreams=useRef(new Map<string,MediaStream>());
 const localRef=useRef({stream,cameraOn,micOn});localRef.current={stream,cameraOn,micOn};
 const syncRef=useRef(()=>{});
 const ready=useRef(false);

 useEffect(()=>{
  let disposed=false;let room:RealtimeChannel|null=null;
  const supabase=createClient();const sessionId=crypto.randomUUID();
  const send=async(to:string,message:Omit<Signal,'from'|'to'>)=>{if(room&&ready.current)await room.send({type:'broadcast',event:'signal',payload:{from:sessionId,to,...message}})};
  const createPeer=(id:string,offerer=false)=>{
   const existing=peers.current.get(id);if(existing)return existing;
   const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});peers.current.set(id,pc);
   if(offerer)for(const kind of ['audio','video'] as const){const track=localRef.current.stream?.getTracks().find(t=>t.kind===kind&&t.readyState==='live');pc.addTransceiver(track||kind,{direction:'sendrecv',...(track&&localRef.current.stream?{streams:[localRef.current.stream]}:{})})}
   pc.onicecandidate=event=>{if(event.candidate)void send(id,{candidate:event.candidate.toJSON()})};
   pc.ontrack=event=>{const media=remoteStreams.current.get(id)||new MediaStream();if(!media.getTracks().some(t=>t.id===event.track.id))media.addTrack(event.track);remoteStreams.current.set(id,media);syncRef.current()};
   pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')setError('Não foi possível conectar a mídia de um participante nesta rede.')};
   return pc;
  };
  const pending=new Map<string,RTCIceCandidateInit[]>();
  const connect=async(id:string)=>{const pc=createPeer(id,true);try{await pc.setLocalDescription(await pc.createOffer());await send(id,{description:pc.localDescription!.toJSON()})}catch{setError('Não foi possível iniciar a conexão de áudio e vídeo.')}};
  void (async()=>{
   const {data:{user},error:authError}=await supabase.auth.getUser();if(disposed)return;
   if(authError||!user){setError('Entre na sua conta para participar da reunião.');return}
   const url=new URL(location.href);let roomId=url.searchParams.get('room');
   if(!roomId||!/^\w[\w-]{20,100}$/.test(roomId)){roomId=crypto.randomUUID();url.searchParams.set('room',roomId);history.replaceState(history.state,'',url)}
   const name=(localStorage.getItem('noza-profile-name')||user.user_metadata?.full_name||user.user_metadata?.name||'Participante').slice(0,80);
   const image=await profileImage(localStorage.getItem('zyvo-space-avatar')||localStorage.getItem('zyvo-profile-avatar')||user.user_metadata?.avatar_url||'',name);if(disposed)return;
   const identity:Presence={id:sessionId,userId:user.id,name,image,activity:'',active:true,muted:!localRef.current.micOn,cameraOn:localRef.current.cameraOn};setSelf(identity);
   room=supabase.channel('noza-space:'+roomId,{config:{presence:{key:sessionId},broadcast:{self:false}}});channelRef.current=room;
   syncRef.current=()=>{
    if(!room||disposed)return;
    const entries=Object.values(room.presenceState<Presence>()).flat().filter(p=>typeof p.id==='string'&&typeof p.userId==='string'&&typeof p.name==='string');
    const seen=new Set<string>();const current=entries.filter(p=>{if(seen.has(p.userId))return false;seen.add(p.userId);return true});
    setParticipants(current.map(p=>({...p,activity:'',active:true,local:p.id===sessionId,stream:p.id===sessionId?localRef.current.stream||undefined:remoteStreams.current.get(p.id)})));
    const ids=new Set(entries.map(p=>p.id));
    for(const [id,pc] of peers.current)if(!ids.has(id)){pc.close();peers.current.delete(id);remoteStreams.current.delete(id)}
    for(const p of entries)if(p.id!==sessionId&&!peers.current.has(p.id)&&sessionId<p.id)void connect(p.id);
   };
   room.on('presence',{event:'sync'},()=>syncRef.current()).on('broadcast',{event:'signal'},async({payload}:{payload:Signal})=>{
    if(payload.to!==sessionId||payload.from===sessionId||disposed)return;
    const known=Object.values(room!.presenceState<Presence>()).flat().some(p=>p.id===payload.from);if(!known)return;
    const pc=createPeer(payload.from);
    try{
     if(payload.description){await pc.setRemoteDescription(payload.description);for(const candidate of pending.get(payload.from)||[])await pc.addIceCandidate(candidate);pending.delete(payload.from);if(payload.description.type==='offer'){for(const transceiver of pc.getTransceivers()){transceiver.direction='sendrecv';const track=localRef.current.stream?.getTracks().find(t=>t.kind===transceiver.receiver.track.kind&&t.readyState==='live')||null;await transceiver.sender.replaceTrack(track)}await pc.setLocalDescription(await pc.createAnswer());await send(payload.from,{description:pc.localDescription!.toJSON()})}}
     else if(payload.candidate){if(pc.remoteDescription)await pc.addIceCandidate(payload.candidate);else pending.set(payload.from,[...(pending.get(payload.from)||[]),payload.candidate])}
    }catch{setError('A conexão de mídia foi interrompida. Entre novamente na sala.')}
   }).subscribe(async status=>{
    if(disposed)return;
    if(status==='SUBSCRIBED'){ready.current=true;setError('');await room!.track({...identity,muted:!localRef.current.micOn,cameraOn:localRef.current.cameraOn})}
    else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){ready.current=false;setParticipants([]);setError('A conexão com a reunião foi interrompida. Tentando reconectar.')}
   });
  })().catch(()=>{if(!disposed)setError('Não foi possível entrar na reunião.')});
  return()=>{disposed=true;ready.current=false;channelRef.current=null;for(const pc of peers.current.values())pc.close();peers.current.clear();remoteStreams.current.clear();if(room)void supabase.removeChannel(room)};
 },[]);

 useEffect(()=>{
  for(const pc of peers.current.values())for(const transceiver of pc.getTransceivers()){
   const kind=transceiver.receiver.track.kind;const track=stream?.getTracks().find(t=>t.kind===kind&&t.readyState==='live')||null;
   void transceiver.sender.replaceTrack(track).catch(()=>setError('Não foi possível atualizar câmera ou microfone.'));
  }
  if(self&&ready.current)void channelRef.current?.track({...self,cameraOn,muted:!micOn});
  syncRef.current();
 },[stream,cameraOn,micOn,self]);
 return {participants,error};
}

export function ParticipantMedia({person}:{person:RoomParticipant}){
 const ref=useRef<HTMLVideoElement>(null);
 const [ready,setReady]=useState(false);
 useEffect(()=>{setReady(false);if(ref.current){ref.current.srcObject=person.stream||null;void ref.current.play().catch(()=>{})}},[person.stream,person.cameraOn]);
 const showVideo=person.cameraOn&&Boolean(person.stream)&&ready;
 return <><img src={person.image||initialsImage(person.name)} alt="" style={showVideo?{display:'none'}:undefined}/>{person.cameraOn&&person.stream?<video ref={ref} autoPlay playsInline muted onLoadedData={()=>setReady(true)} onError={()=>setReady(false)} style={{display:showVideo?'block':'none'}}/>:null}</>;
}
export function ParticipantAudio({person,muted}:{person:RoomParticipant;muted:boolean}){
 const ref=useRef<HTMLAudioElement>(null);
 useEffect(()=>{const audio=ref.current;if(!audio)return;audio.srcObject=person.stream||null;const play=()=>{void audio.play().catch(()=>{})};play();window.addEventListener('pointerdown',play);return()=>window.removeEventListener('pointerdown',play)},[person.stream]);
 return person.local?null:<audio ref={ref} autoPlay muted={muted||person.muted}/>;
}
