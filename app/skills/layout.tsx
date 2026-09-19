import type {ReactNode} from 'react';
import SkillsActionsEnhancer from './SkillsActionsEnhancer';

export default function SkillsLayout({children}:{children:ReactNode}){
  return <>{children}<SkillsActionsEnhancer/></>;
}
