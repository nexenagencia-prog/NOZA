const TYPES=new Set(['image/jpeg','image/png','image/webp']);const MAX=10*1024*1024;
export function validateImage(file){if(!TYPES.has(file.type))throw new Error('Use JPG, PNG ou WebP.');if(file.size>MAX)throw new Error('A imagem deve ter no máximo 10 MB.');}
