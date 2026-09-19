const routes={
  skills:'/skills',
  recordings:'/gravacoes',
};

export function homeCardRoute(slug){
  return routes[slug]??null;
}
