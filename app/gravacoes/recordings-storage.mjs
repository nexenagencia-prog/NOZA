export function resolveStoredRecordings(raw,fallback){
  if(!raw)return fallback;

  try{
    const parsed=JSON.parse(raw);
    if(Array.isArray(parsed))return parsed;
    if(Array.isArray(parsed?.recordings))return parsed.recordings;
  }catch{}

  return fallback;
}
