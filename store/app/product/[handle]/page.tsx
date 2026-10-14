import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import Grid from 'components/grid';
import Footer from 'components/layout/footer';
import ProductGridItems from 'components/layout/product-grid-items';
import { AddToCart } from 'components/product/add-to-cart';
import { Gallery } from 'components/product/gallery';
import { VariantSelector } from 'components/product/variant-selector';
import Prose from 'components/prose';
import { getMenu, getProduct, getProducts } from 'lib/products';

export const runtime = 'edge';

export async function generateMetadata({
  params
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, altText: alt } = { url: product.images[0], altText: product.name };
  const indexable = true;

  return {
    title: product.name,
    description: product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              alt
            }
          ]
        }
      : null
  };
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const product = await getProduct(params.handle);
  const footerMenu = await getMenu('next-js-frontend-footer-menu');

  if (!product) return notFound();

  return (
    <div>
      <div className="lg:grid lg:grid-cols-6">
        <div className="lg:col-span-4">
          <Gallery
            title={product.name}
            amount={product.price.toString()}
            currencyCode="MXN"
            images={product.images.map((image) => ({
              src: image,
              altText: product.name
            }))}
            bgColor={product.bgColor}
          />
        </div>

        <div className="p-6 lg:col-span-2">
          <h1 className="mb-2 text-5xl font-medium">{product.name}</h1>
          <VariantSelector />

          {product.description ? (
            <Prose className="mb-6 text-sm leading-tight" html={product.description} />
          ) : null}

          <AddToCart product={product} availableForSale={product.isActive} />
        </div>
      </div>
      <Suspense>
        {/* @ts-expect-error Server Component */}
        <RelatedProducts id={product._id} />
        <Suspense>
          <Footer menu={footerMenu} />
        </Suspense>
      </Suspense>
    </div>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProducts();
  // Simple filter to exclude current product, take 4
  const filtered = relatedProducts.filter(p => p._id !== id).slice(0, 4);

  if (!filtered.length) return null;

  return (
    <div className="px-4 py-8">
      <div className="mb-4 text-3xl font-bold uppercase">Productos Relacionados</div>
      <Grid className="grid-cols-2 lg:grid-cols-5">
        <ProductGridItems products={filtered} />
      </Grid>
    </div>
  );
}
