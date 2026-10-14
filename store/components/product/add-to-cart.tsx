'use client';

import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import LoadingDots from 'components/loading-dots';
import { Product } from 'lib/types';
import { useCartStore } from 'stores/cartStore';

import { PRODUCT_SIZES } from 'lib/constants';

export function AddToCart({
  product,
  availableForSale
}: {
  product: Product;
  availableForSale: boolean;
}) {
  const [selectedSize, setSelectedSize] = useState(PRODUCT_SIZES[0]);
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const sizeParam = searchParams.get('size');
    if (sizeParam && PRODUCT_SIZES.includes(sizeParam)) {
      setSelectedSize(sizeParam);
    }
  }, [searchParams]);

  const isOutOfStock = false;

  function handleAdd() {
    if (!availableForSale || isOutOfStock || !selectedSize) return;

    setAdding(true);

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1,
      image: product.images[0],
      slug: product.slug
    });

    setTimeout(() => {
        setAdding(false);
        // Optionally open cart or show toast
    }, 500);
  }

  return (
    <button
      aria-label="Agregar al carrito"
      disabled={!availableForSale || isOutOfStock || adding}
      onClick={handleAdd}
      className={clsx(
        'flex w-full items-center justify-center bg-black p-4 text-sm uppercase tracking-wide text-white opacity-90 hover:opacity-100 dark:bg-white dark:text-black',
        {
          'cursor-not-allowed opacity-60': !availableForSale || isOutOfStock,
          'cursor-not-allowed': adding
        }
      )}
    >
      <span>{availableForSale ? (isOutOfStock ? 'Agotado' : 'Agregar al carrito') : 'Agotado'}</span>
      {adding ? <LoadingDots className="bg-white dark:bg-black" /> : null}
    </button>
  );
}

