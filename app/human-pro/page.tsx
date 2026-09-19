import type {Metadata} from 'next';
import HumanProClient from './HumanProClient';

export const metadata:Metadata={
  title:'Human Pro — NOZA',
  description:'Entenda o que está limitando sua performance e o que precisa mudar para evoluir.',
};

export default function HumanProPage(){
  return <HumanProClient/>;
}
