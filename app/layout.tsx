import './globals.css';
import './logo.css';
import type { Metadata } from 'next';
import FloatingAIChat from './FloatingAIChat';
import GlobalFloatingTools from './GlobalFloatingTools';

export const metadata: Metadata = {
  title: 'NOZA — Videoconferência de alta performance',
  description: 'Converse, evolua e alcance resultados em cada reunião.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <GlobalFloatingTools />
        <FloatingAIChat />
      </body>
    </html>
  );
}
