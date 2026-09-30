'use client';

import { useState } from 'react';

const feedbacks = [
  { name: 'Eric', quote: 'A NOZA é insano.', text: 'Porque ela enxerga o que você ainda não percebe.' },
];

export default function FeedbackCarousel() {
  const [active, setActive] = useState(0);

  return (
    <section className="auth-intro" aria-label="Feedbacks" aria-roledescription="carrossel">
      <div className="feedback-slides" aria-live="off">
        {feedbacks.map((feedback, index) => (
          <div key={feedback.name} className={`intro-testimonial feedback-slide${index === active ? ' is-active' : ''}`}
            aria-hidden={index !== active}>
            <div className="testimonial-copy">
              <div className="testimonial-quote">“{feedback.quote}</div>
              <div className="testimonial-text">{feedback.text}”</div>
              <div className="testimonial-author"><span /><div><strong>{'{feedback.name}'}</strong><small>Usuário NOZA</small></div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
