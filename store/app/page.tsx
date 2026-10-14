import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import { Hero } from 'components/hero';
import Footer from 'components/layout/footer';
import { Suspense } from 'react';

export const runtime = 'edge';

export const metadata = {
  description: 'Catálogo virtual interactivo conectado a WhatsApp para pedidos ágiles y compras directas.',
  openGraph: {
    type: 'website'
  }
};

import { getMenu } from 'lib/products';

export default async function HomePage() {
  const footerMenu = await getMenu('next-js-frontend-footer-menu');

  return (
    <>
      <Hero />
      <Suspense>
        {/* @ts-expect-error Server Component */}
        <Carousel />
      </Suspense>
      {/* @ts-expect-error Server Component */}
      <ThreeItemGrid />
      <Suspense>
        <Footer menu={footerMenu} />
      </Suspense>
    </>
  );
}
