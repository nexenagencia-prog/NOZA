import './refine.css';
import './cms-home.css';
import './home-overrides.css';
import HomeClient from './HomeClient';
import type { HomeContent } from '../lib/cms/types';

const content: HomeContent = {
  hero: {
    eyebrow: 'PERFORMANCE INTELLIGENCE',
    title: 'Sua performance evolui com você.',
    ratingText: 'Evolução contínua, orientada pela sua própria performance.',
    performancePercent: 82,
    performanceLabel: 'performance',
    primaryButton: 'Iniciar',
    secondaryButton: 'Ver Skills',
    imageUrl: ''
  },
  nextMeeting: { label: 'Próxima reunião', dateTime: '14:00 — 30 Set 2026' },
  profile: { name: 'Sandro', avatarUrl: '', planLabel: 'PRO' },
  navigation: {
    searchPlaceholder: 'Buscar',
    top: ['Início','Skills','Agenda','Planos e Preços'],
    sidebar: ['Início','Reuniões','Gravações','Calculadora','Skills','Human Pro','Sair']
  },
  cards: [
    {slug:'skills',title:'Skills',description:'Evolução das suas habilidades de performance.',percentage:82,imageUrl:'/skills-card.png',ctaLabel:'Ver Skills',sortOrder:0,isActive:true},
    {slug:'insights',title:'Inteligência de Performance',description:'Padrões e sinais para orientar sua evolução.',percentage:76,imageUrl:'/noza-home-slide-brain.png',ctaLabel:'Explorar',sortOrder:1,isActive:true},
    {slug:'recordings',title:'Gravações',description:'Revise os momentos que ajudam a entender sua performance.',percentage:88,imageUrl:'/noza-home-slide-human.png',ctaLabel:'Ver gravações',sortOrder:2,isActive:true}
  ],
  carousel: [
    {id:'brain',title:'Mais do que reuniões.',subtitle:'Entenda como você decide.',imageUrl:'/noza-home-slide-brain.png',sortOrder:0,isActive:true},
    {id:'human',title:'Mais do que comunicação.',subtitle:'Entenda como você se comporta.',imageUrl:'/noza-home-slide-human.png',sortOrder:1,isActive:true},
    {id:'focus',title:'Mais do que foco.',subtitle:'Transforme padrões em performance.',imageUrl:'/noza-home-slide-focus.png',sortOrder:2,isActive:true}
  ],
  carouselIntervalMs: 6000
};

export default function Home(){
  return <HomeClient content={content}/>;
}
