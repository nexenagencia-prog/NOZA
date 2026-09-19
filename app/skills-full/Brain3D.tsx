'use client';

import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const target: Record<string,[number,number,number]> = {
  foco: [-0.48, 0.22, 0.34], memoria: [0.18,-0.10,0.42], disciplina: [-0.38,0.30,0.28],
  criatividade: [0.10,0.42,0.18], emocional: [0.00,-0.08,0.40], comunicacao: [0.42,-0.02,0.28],
  visao: [-0.48,0.12,0.22], lideranca: [0.08,0.34,0.20], produtividade: [0.30,0.22,0.22]
};
const rot: Record<string,[number,number]> = {
  foco:[-.05,.18], memoria:[.08,-.48], disciplina:[-.08,.30], criatividade:[-.15,-.20],
  emocional:[.11,.06], comunicacao:[.02,-.44], visao:[-.10,.42], lideranca:[-.14,-.13], produtividade:[-.05,-.30]
};

function HologramBrain({active,color}:{active:string;color:string}) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/models/brain-hologram/scene.gltf');
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.traverse((o:any) => {
      if (!o.isMesh) return;
      const src = Array.isArray(o.material) ? o.material[0] : o.material;
      const m = src?.clone?.() || new THREE.MeshStandardMaterial();
      m.transparent = true;
      m.opacity = Math.min(m.opacity ?? 1, .82);
      m.depthWrite = false;
      if ('color' in m) m.color = new THREE.Color('#6f91b7');
      if ('emissive' in m) { m.emissive = new THREE.Color('#173451'); m.emissiveIntensity = .85; }
      m.blending = THREE.AdditiveBlending;
      o.material = m;
    });
  }, [model]);

  useFrame((_,dt) => {
    if (!group.current) return;
    const r = rot[active] || rot.foco;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x,r[0],4,dt);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y,r[1],4,dt);
  });

  const p = target[active] || target.foco;
  return <group ref={group} scale={2.15} rotation={[0,.08,0]}>
    <primitive object={model}/>
    <pointLight
      position={p}
      color={color || '#e8edef'}
      intensity={8.5}
      distance={0.92}
      decay={2.0}
    />
  </group>;
}

export default function Brain3D({active,color='#e8edef'}:{active:string;color:string}) {
  return <div className="brain-canvas">
    <Canvas camera={{position:[0,0,4.1],fov:34}} dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>gl.setClearColor(0x000000,0)}>
      <ambientLight intensity={.65}/>
      <directionalLight position={[3,4,5]} intensity={1.5} color="#9ec9ff"/>
      <directionalLight position={[-3,-1,2]} intensity={.8} color="#527ca8"/>
      <Suspense fallback={null}><HologramBrain active={active} color={color}/></Suspense>
      <OrbitControls enablePan={false} enableZoom minDistance={2.6} maxDistance={6} rotateSpeed={.55}/>
    </Canvas>
  </div>;
}

useGLTF.preload('/models/brain-hologram/scene.gltf');
