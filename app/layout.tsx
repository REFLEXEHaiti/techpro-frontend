// app/layout.tsx — MediForm Haiti
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { TenantProvider } from '@/lib/tenantContext';
import Navbar from '@/components/layout/Navbar';
import InitAuth from '@/components/layout/InitAuth';
import Chatbot from '@/components/chatbot/Chatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TechPro Haiti — Formations IT & Développement Professionnel',
  description: 'La plateforme de formation IT professionnelle haïtienne. Développement web, cybersécurité, cloud et certifications.',
  keywords: 'formation informatique haïti, développement web, cybersécurité, réseaux',
  openGraph: {
    title: 'TechPro Haiti — Formations Pro & IT',
    description: 'Formation IT professionnelle en Haïti',
    siteName: 'TechPro Haiti',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1B3A6B" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <TenantProvider>
          <InitAuth />
          <Navbar />
          <main style={{ minHeight: '100vh', background: 'var(--page)', overflowX: 'hidden' }}>
            {children}
          </main>
          <Chatbot />
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1B3A6B', color: 'white', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: '13px', borderRadius: '8px' } }} />
        </TenantProvider>
      </body>
    </html>
  );
}
