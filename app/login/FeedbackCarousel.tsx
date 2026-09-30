'use client';

import { useEffect, useState } from 'react';

const feedbacks = [
  { name: 'Eric', quote: 'A NOZA é insano.', text: 'Porque ela enxerga o que você ainda não percebe.', portrait: 4, example: false },
  { name: 'Ana', quote: 'Um novo olhar para minha evolução.', text: 'Hoje consigo reconhecer padrões e transformar reflexão em ação.', portrait: 0, example: true },
  { name: 'Lucas', quote: 'Mais clareza para seguir em frente.', text: 'Cada reflexão me ajuda a escolher meu próximo passo.', portrait: 1, example: true },
  { name: 'Mariana', quote: 'Evoluir começa por se conhecer.', text: 'Encontrei uma forma simples de acompanhar meu desenvolvimento.', portrait: 2, example: true },
  { name: 'Rafael', quote: 'Pequenos passos, novas perspectivas.', text: 'Aprender sobre meus padrões mudou a forma como encaro desafios.', portrait: 3, example: true },
];

export default function FeedbackCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % feedbacks.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="auth-intro" aria-label="Feedbacks" aria-roledescription="carrossel">
      <div className="feedback-slides" aria-live="off">
        {feedbacks.map((feedback, index) => (
          <div key={feedback.name} className={`intro-testimonial feedback-slide${index === active ? ' is-active' : ''}`}
            aria-hidden={index !== active}>
            <div className="testimonial-photo feedback-portrait" role="img"
              aria-label={`Retrato ilustrativo associado ao feedback de ${feedback.name}`}
              style={{ backgroundPosition: `${(feedback.portrait % 4) * 100 / 3}% ${feedback.portrait >= 4 ? 100 : 0}%` }} />
            <div className="testimonial-copy">
              <div className="testimonial-quote">“{feedback.quote}</div>
              <div className="testimonial-text">{feedback.text}”</div>
              <div className="testimonial-author"><span /><div><strong>{feedback.name}</strong>
                <small>{feedback.example ? 'Usuário NOZA' : 'Usuário NOZA'}</small></div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
