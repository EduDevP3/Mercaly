'use client';

import clsx from 'clsx';
import MinusIcon from 'components/icons/minus';
import PlusIcon from 'components/icons/plus';
import LoadingDots from 'components/loading-dots';
import { useState } from 'react';
import { useCartStore, type CartItem } from 'stores/cartStore';

export default function EditItemQuantityButton({
  item,
  type
}: {
  item: CartItem;
  type: 'plus' | 'minus';
}) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const [editing, setEditing] = useState(false);

  function handleEdit() {
    setEditing(true);
    const newQuantity = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
    updateQuantity(item.productId, item.size, newQuantity);
    setEditing(false);
  }

  return (
    <button
      aria-label={type === 'plus' ? 'Aumentar cantidad' : 'Reducir cantidad'}
      onClick={handleEdit}
      disabled={editing}
      className={clsx(
        'ease flex min-w-[36px] max-w-[36px] items-center justify-center border px-2 transition-all duration-200 hover:border-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900',
        {
          'cursor-not-allowed': editing,
          'ml-auto': type === 'minus'
        }
      )}
    >
      {editing ? (
        <LoadingDots className="bg-black dark:bg-white" />
      ) : type === 'plus' ? (
        <PlusIcon className="h-4 w-4" />
      ) : (
        <MinusIcon className="h-4 w-4" />
      )}
    </button>
  );
}
