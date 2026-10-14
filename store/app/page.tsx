import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';
import { Hero } from 'components/hero';
import Footer from 'components/layout/footer';
import { Suspense } from 'react';

export const runtime = 'edge';

export const metadata = {
  description: 'La Barata Mayoreos (LBM) - Venta de pacas de ropa americana de calidad al mayoreo y menudeo con envíos seguros a todo México.',
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
