import './refine.css';
import './cms-home.css';
import './home-overrides.css';
import HomeClient from './HomeClient';
import { loadHomeContent } from '../lib/cms/repository';

export const revalidate = 3600;

export default async function Home(){
  const content=await loadHomeContent();
  return <HomeClient content={content}/>;
}
