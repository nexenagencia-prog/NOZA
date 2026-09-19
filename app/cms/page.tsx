import './cms.css';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../lib/supabase/server';
import { isAdminEmail } from '../../lib/cms/auth.mjs';
import { loadHomeContent } from '../../lib/cms/repository';
import CmsEditor from './CmsEditor';

export default async function CmsPage(){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user || !isAdminEmail(user.email)) redirect('/cms/login');
  const content=await loadHomeContent();
  return <CmsEditor initialContent={content} adminEmail={user.email ?? ''}/>;
}
