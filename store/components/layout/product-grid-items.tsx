'use client';

import { motion } from 'framer-motion';
import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import { Product } from 'lib/types';
import Link from 'next/link';

export default function ProductGridItems({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product, index) => (
        <motion.div
          key={product.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Grid.Item className="h-full w-full">
            <Link className="h-full w-full" href={`/product/${product.slug}`}>
              <GridTileImage
                alt={product.name}
                labels={{
                  isSmall: true,
                  title: product.name,
                  amount: product.price.toString(),
                  currencyCode: 'MXN'
                }}
                src={product.images[0] || ''}
                width={600}
                height={600}
                background={product.bgColor}
              />
            </Link>
          </Grid.Item>
        </motion.div>
      ))}
    </>
  );
}

