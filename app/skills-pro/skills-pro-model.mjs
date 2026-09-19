export function createCognitiveSession(){
  return {
    forecast:{
      prompt:'O que essa pessoa está tentando proteger antes de decidir?',
      reveal:'hidden',
    },
  };
}

export function revealForecast(session,userReading){
  return {
    ...session,
    forecast:{
      ...session.forecast,
      userReading,
      reveal:'visible',
      actualResponse:'“Minha preocupação é o ritmo de implantação. Não posso travar a equipe agora.”',
      signal:'O sinal central era risco operacional — não resistência a preço.',
    },
  };
}
