import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Votação Presidencial em Tempo Real | Lula 13 vs Flávio Bolsonaro 22',
  description:
    'Acompanhe e participe da apuração da eleição online em tempo real. Desenvolvido com Next.js, Drizzle ORM, PostgreSQL e SSE. 1 voto por IP.',
  keywords: ['eleição', 'votação online', 'lula 13', 'flavio bolsonaro 22', 'tempo real', 'drizzle orm', 'postgresql'],
  authors: [{ name: 'Votação Online Brasil' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
