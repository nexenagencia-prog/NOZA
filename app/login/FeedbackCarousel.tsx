'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const feedbacks = [
  { name: 'Eric', quote: 'A NOZA é insano.', text: 'Porque ela enxerga o que você ainda não percebe.', portrait: 4, example: false },
  { name: 'Ana', quote: 'Um novo olhar para minha evolução.', text: 'Hoje consigo reconhecer padrões e transformar reflexão em ação.', portrait: 0, example: true },
  { name: 'Lucas', quote: 'Mais clareza para seguir em frente.', text: 'Cada reflexão me ajuda a escolher meu próximo passo.', portrait: 1, example: true },
  { name: 'Mariana', quote: 'Evoluir começa por se conhecer.', text: 'Encontrei uma forma simples de acompanhar meu desenvolvimento.', portrait: 2, example: true },
  { name: 'Rafael', quote: 'Pequenos passos, novas perspectivas.', text: 'Aprender sobre meus padrões mudou a forma como encaro desafios.', portrait: 3, example: true },
];

export default function FeedbackCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % feedbacks.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reducedMotion]);

  return (
    <section className="auth-intro" aria-label="Feedbacks" aria-roledescription="carrossel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="feedback-slides" aria-live={paused || reducedMotion ? 'polite' : 'off'}>
        {feedbacks.map((feedback, index) => (
          <div key={feedback.name} className={`intro-testimonial feedback-slide${index === active ? ' is-active' : ''}`}
            aria-hidden={index !== active}>
            {index === 0 ? (
              <div className="testimonial-photo"><Image src="/noza-home-slide-human.png" alt="Foto de Eric" fill sizes="68px" priority /></div>
            ) : (
              <div className="testimonial-photo feedback-portrait" role="img" aria-label={`Retrato ilustrativo de ${feedback.name}`}
                style={{ backgroundPosition: `${(feedback.portrait % 4) * 100 / 3}% ${feedback.portrait >= 4 ? 100 : 0}%` }} />
            )}
            <div className="testimonial-copy">
              <div className="testimonial-quote">“{feedback.quote}</div>
              <div className="testimonial-text">{feedback.text}”</div>
              <div className="testimonial-author"><span /><div><strong>{feedback.name}</strong>
                <small>{feedback.example ? 'Exemplo ilustrativo' : 'Usuário NOZA'}</small></div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="feedback-controls">
        {feedbacks.map((feedback, index) => <button key={feedback.name} type="button"
          aria-label={`Ver feedback de ${feedback.name}`} aria-pressed={active === index}
          className={active === index ? 'is-active' : ''} onClick={() => setActive(index)} />)}
        <button type="button" className="feedback-pause" onClick={() => setPaused(value => !value)}
          aria-label={paused ? 'Reproduzir feedbacks' : 'Pausar feedbacks'}>{paused ? '▶' : 'Ⅱ'}</button>
      </div>
    </section>
  );
}
