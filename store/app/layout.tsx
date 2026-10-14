import Navbar from 'components/layout/navbar';
import Awakener from 'components/layout/awakener';
import { Inter } from 'next/font/google';
import { ReactNode, Suspense } from 'react';
import './globals.css';

const { TWITTER_CREATOR, TWITTER_SITE } = process.env;
const SITE_NAME = process.env.SITE_NAME || 'Mercaly';

export const metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  },
  ...(TWITTER_CREATOR &&
    TWITTER_SITE && {
      twitter: {
        card: 'summary_large_image',
        creator: TWITTER_CREATOR,
        site: TWITTER_SITE
      }
    })
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

import PromoBanner from 'components/layout/promo-banner';
import { Toaster } from 'react-hot-toast';
import WhatsAppFloating from 'components/whatsapp-floating';

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-[#fafbfc] text-neutral-900 selection:bg-blue-100 selection:text-blue-900 font-sans antialiased">
        <Toaster position="top-center" />
        <PromoBanner />
        <WhatsAppFloating />
        <Awakener />
        {/* @ts-expect-error Server Component */}
        <Navbar />
        <Suspense>
          <main>{children}</main>
        </Suspense>
      </body>
    </html>
  );
}
