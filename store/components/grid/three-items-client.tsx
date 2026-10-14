'use client';

import { motion } from 'framer-motion';
import { GridTileImage } from 'components/grid/tile';
import { Product } from 'lib/types';
import Link from 'next/link';

export function AnimatedThreeItemGridItem({
  item,
  size,
  background,
  index
}: {
  item: Product;
  size: 'full' | 'half';
  background?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={size === 'full' ? 'lg:col-span-4 lg:row-span-2' : 'lg:col-span-2 lg:row-span-1'}
    >
      <Link className="block h-full group" href={`/product/${item.slug}`}>
        <div className="h-full overflow-hidden rounded-xl">
          <GridTileImage
            src={item.images[0] || ''}
            width={size === 'full' ? 1080 : 540}
            height={size === 'full' ? 1080 : 540}
            priority={true}
            background={background}
            alt={item.name}
            labels={{
              title: item.name,
              amount: item.price.toString(),
              currencyCode: 'MXN'
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export function AnimatedGridTitle() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="mb-10 text-center md:text-left"
    >
      <h2 className="text-3xl font-black uppercase tracking-tighter text-black dark:text-white md:text-5xl">
        DESTACADOS DE LA SEMANA
      </h2>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        Selección premium de nuestros productos más vendidos
      </p>
    </motion.div>
  );
}
