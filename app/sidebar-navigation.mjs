const routes={
  'Início':'/',
  'Agenda':'/agenda',
  'Skills':'/skills',
  'Calibragem':'/calibragem',
  'Contatos':'/contatos',
  'Gravações':'/gravacoes',
  'Skills Pro':'/skills-pro',
  'Skills Full':'/skills-full',
  'Human Pro':'/human-pro',
  'Space':'/space',
  'Anotações':'/anotacoes',
};

export function resolveSidebarRoute(label){
  return routes[label]||null;
}

export function isSidebarRouteActive(label,pathname){
  const route=resolveSidebarRoute(label);
  return route==='/'?pathname==='/':Boolean(route&&pathname===route);
}
