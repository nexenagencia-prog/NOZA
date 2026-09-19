export const BRAND_NAME='NOZA';
export const BRAND_AI_NAME='NOZA';
export const BRAND_LOGO='/noza-logo.png';

export function rebrandPublicText(value){
  return String(value??'').replace(/zyvo/gi,BRAND_NAME);
}
