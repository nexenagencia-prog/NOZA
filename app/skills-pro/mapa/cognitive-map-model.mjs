export function createMapState(){return {view:'map',activeSituation:null};}
export function exploreSituation(state,id){return {...state,view:'situation',activeSituation:id};}
export function returnToMap(){return createMapState();}
