'use client';

import clsx from 'clsx';
import CloseIcon from 'components/icons/close';
import LoadingDots from 'components/loading-dots';
import { useState } from 'react';
import { useCartStore, type CartItem } from 'stores/cartStore';

export default function DeleteItemButton({ item }: { item: CartItem }) {
  const removeItem = useCartStore((state) => state.removeItem);
  const [removing, setRemoving] = useState(false);

  function handleRemove() {
    setRemoving(true);
    removeItem(item.productId, item.size);
    setRemoving(false);
  }

  return (
    <button
      aria-label="Eliminar artículo del carrito"
      onClick={handleRemove}
      disabled={removing}
      className={clsx(
        'ease flex min-w-[36px] max-w-[36px] items-center justify-center border px-2 transition-all duration-200 hover:border-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900',
        {
          'cursor-not-allowed px-0': removing
        }
      )}
    >
      {removing ? (
        <LoadingDots className="bg-black dark:bg-white" />
      ) : (
        <CloseIcon className="hover:text-accent-3 mx-[1px] h-4 w-4" />
      )}
    </button>
  );
}
