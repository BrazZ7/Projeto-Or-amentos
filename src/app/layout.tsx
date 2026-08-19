import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProviderClient } from '@/components/SessionProviderClient';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'OrcaFacil — Orçamentos profissionais em PDF',
  description:
    'Crie, personalize e envie orçamentos profissionais em PDF. Gestão de clientes, produtos e propostas com IA integrada.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <SessionProviderClient>{children}</SessionProviderClient>
      </body>
    </html>
  );
}
