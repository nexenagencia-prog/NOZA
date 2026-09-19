export function createIntelligenceState(){return {route:'inline',openContext:null};}
export function openContext(state,id){return {...state,openContext:id};}
export function closeContext(state){return {...state,openContext:null};}
