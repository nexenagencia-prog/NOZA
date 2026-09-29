import type {ReactNode} from 'react';

export default function SkillsFullLayout({children}:{children:ReactNode}){
  return <>
    <link rel="preload" href="/models/brain-hologram/scene.gltf" as="fetch" crossOrigin="anonymous"/>
    <link rel="preload" href="/models/brain-hologram/scene.bin" as="fetch" crossOrigin="anonymous"/>
    {children}
  </>;
}
