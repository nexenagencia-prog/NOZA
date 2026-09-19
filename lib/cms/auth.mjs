const ADMIN_EMAIL=(process.env.NEXT_PUBLIC_CMS_ADMIN_EMAIL||process.env.CMS_ADMIN_EMAIL||'sandrobellomind@gmail.com').trim().toLowerCase();
export function isAdminEmail(email){return typeof email==='string'&&email.trim().toLowerCase()===ADMIN_EMAIL}
export function safeNextPath(value,fallback='/cms'){return typeof value==='string'&&value.startsWith('/')&&!value.startsWith('//')?value:fallback}
