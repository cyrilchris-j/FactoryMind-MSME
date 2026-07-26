import type { Metadata } from 'next';
import { Poppins, Inter, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex',
});

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FactoryMind AI — AI Decision Intelligence for MSMEs',
  description: 'AI-powered factory copilot for smarter manufacturing decisions. Industry 4.0 & 5.0 ready.',
  keywords: ['factory', 'AI', 'MSME', 'manufacturing', 'Industry 4.0', 'predictive analytics'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${ibmPlex.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
