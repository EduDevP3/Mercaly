'use client';

import { useEffect, useState } from 'react';

import CartIcon from 'components/icons/cart';
import { useCartStore } from 'stores/cartStore';
import CartModal from './modal';

export default function CartButton() {
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());
  // Hydration fix
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <CartModal isOpen={cartIsOpen} onClose={() => setCartIsOpen(false)} />

      <button
        aria-label="Abrir carrito"
        onClick={() => {
          setCartIsOpen(true);
        }}
        className="relative right-0 top-0"
        data-testid="open-cart"
      >
        <CartIcon quantity={mounted ? totalItems : 0} />
      </button>
    </>
  );
}

