import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState, useEffect } from 'react';

import CloseIcon from 'components/icons/close';
import ShoppingBagIcon from 'components/icons/shopping-bag';
import LoadingDots from 'components/loading-dots';
import Price from 'components/price';
import { DEFAULT_OPTION } from 'lib/constants';
import { createUrl } from 'lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStore } from 'stores/cartStore';
import { useClientAuthStore } from 'stores/clientAuthStore';
import DeleteItemButton from './delete-item-button';
import EditItemQuantityButton from './edit-item-quantity-button';

export default function CartModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const cartItems = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalPrice = useCartStore((state) => state.totalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [view, setView] = useState<'cart' | 'shipping'>('cart');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'México',
    state: ''
  });

    const { isLoggedIn, token, logout } = useClientAuthStore();

  useEffect(() => {
    if (!isOpen) {
      setView('cart');
    }
  }, [isOpen]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    async function handleCheckout() {
        if (!isLoggedIn()) {
            toast.error('Por favor, inicia sesión para completar tu compra.');
            onClose();
            router.push('/login');
            return;
        }

        if (view === 'cart') {
            setView('shipping');
            return;
        }

        // Validar dirección simple
        if (!address.street || !address.city || !address.postalCode) {
            toast.error('Por favor, completa los datos de envío faltantes.');
            return;
        }

        setIsCheckingOut(true);

        try {
            const orderPayload = {
                orderItems: cartItems.map(item => ({
                    product: item.productId,
                    sku: item.name,
                    title: item.name,
                    quantity: item.quantity,
                    image_url: item.image || '',
                    price: item.price,
                    size: item.size
                })),
                shippingAddress: {
                    address: address.street,
                    city: address.city,
                    postalCode: address.postalCode,
                    country: address.country,
                    state: address.state
                },
                itemsPrice: totalPrice,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: totalPrice,
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tribuna-back-nfl9.onrender.com/api/v1';

            const response = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                const data = await response.json();
                clearCart();
                onClose();
                setView('cart'); // Reset for next time
                router.push(`/order-summary/${data._id}`);
            } else if (response.status === 401 || response.status === 403) {
                console.error('Session expired or unauthorized');
                logout();
                onClose();
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
                router.push('/login');
            } else {
                const errorData = await response.json();
                console.error('Order creation failed:', errorData);
                toast.error(`Error: ${errorData.message || 'Inténtalo de nuevo'}`);
            }

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Error de conexión al crear el pedido.');
        } finally {
            setIsCheckingOut(false);
        }
    }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-[.5px]"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100 backdrop-blur-[.5px]"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed inset-y-0 right-0 flex w-full flex-col bg-white p-6 text-black shadow-xl dark:bg-black dark:text-white md:w-3/5 lg:w-2/5">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">
                {view === 'cart' ? 'Mi Carrito' : 'Datos de Envío'}
              </p>
              <button
                aria-label="Cerrar carrito"
                onClick={onClose}
                className="text-black transition-colors hover:text-gray-500 dark:text-gray-100"
                data-testid="close-cart"
              >
                <CloseIcon className="h-7" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden"
              >
                <ShoppingBagIcon className="h-16" />
                <p className="mt-6 text-center text-2xl font-bold">Tu carrito está vacío.</p>
              </motion.div>
            ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden">
                  {view === 'cart' ? (
                    <>
                      <ul className="flex-grow overflow-auto py-4">
                        <AnimatePresence initial={false}>
                          {cartItems.map((item, i) => {
                            const merchandiseUrl = createUrl(
                              `/product/${item.slug}`,
                              new URLSearchParams({ size: item.size })
                            );

                            const hasPromo = totalItems >= 2;
                            const originalItemPrice = 600 * item.quantity;

                            return (
                              <motion.li 
                                key={`${item.productId}-${item.size}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                              >
                                <div className="relative flex w-full flex-row justify-between px-1 py-4">
                                  <div className="absolute z-40 -mt-2 ml-[55px]">
                                    <DeleteItemButton item={item} />
                                  </div>
                                  <Link
                                    href={merchandiseUrl}
                                    onClick={onClose}
                                    className="z-30 flex flex-row space-x-4"
                                  >
                                    <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                      <Image
                                        className="h-full w-full object-cover"
                                        width={64}
                                        height={64}
                                        alt={item.name}
                                        src={item.image || ''}
                                      />
                                    </div>

                                    <div className="flex flex-1 flex-col text-base text-black dark:text-white">
                                      <span className="leading-tight font-medium">
                                        {item.name}
                                      </span>
                                      <div className="flex flex-col gap-1 mt-1">
                                        {item.size !== DEFAULT_OPTION ? (
                                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Talla: {item.size}
                                          </p>
                                        ) : null}
                                        {hasPromo && (
                                          <span className="w-fit rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white animate-pulse">
                                            ¡OFERTA APLICADA!
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </Link>

                                  <div className="flex h-16 flex-col justify-between">
                                    <div className="flex flex-col items-end">
                                      <Price
                                        className={clsx(
                                          "flex justify-end text-right text-sm font-bold",
                                          hasPromo && "text-neutral-500 line-through decoration-red-500 font-normal"
                                        )}
                                        amount={originalItemPrice}
                                        currencyCode="MXN"
                                      />
                                      {hasPromo && (
                                        <span className="text-[10px] font-bold text-blue-500 animate-pulse">
                                          PRECIO ESPECIAL
                                        </span>
                                      )}
                                    </div>
                                    <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                      <EditItemQuantityButton item={item} type="minus" />
                                      <p className="w-6 text-center">
                                        <span className="w-full text-sm">{item.quantity}</span>
                                      </p>
                                      <EditItemQuantityButton item={item} type="plus" />
                                    </div>
                                  </div>
                                </div>
                              </motion.li>
                            );
                          })}
                        </AnimatePresence>
                      </ul>
                      
                      {/* Summary section with breakdown */}
                      <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl mb-4 border border-neutral-200 dark:border-neutral-800">
                        <div className="mb-2 flex items-center justify-between border-b border-neutral-200/50 pb-2 dark:border-neutral-700/50">
                          <p>Número de artículos</p>
                          <p className="text-right font-medium text-black dark:text-white">{totalItems}</p>
                        </div>
                        
                        <div className="mb-2 flex items-center justify-between">
                          <p>Monto original</p>
                          <Price
                            className="text-right text-black dark:text-white"
                            amount={totalItems * 600}
                            currencyCode="MXN"
                          />
                        </div>

                        {totalItems >= 2 && (
                          <div className="mb-2 flex items-center justify-between text-blue-500 font-bold">
                            <p className="flex items-center gap-2">
                              Promo 2x1000
                              <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                                ¡OFERTA!
                              </span>
                            </p>
                            <div className="text-right">
                              - <Price amount={(totalItems * 600) - totalPrice} currencyCode="MXN" />
                            </div>
                          </div>
                        )}

                        <div className="mb-2 flex items-center justify-between border-b border-neutral-200/50 pb-2 dark:border-neutral-700/50">
                          <p>Envío</p>
                          {totalItems >= 2 ? (
                            <p className="text-right text-blue-500 font-bold uppercase flex items-center gap-1">
                              Gratis 
                              <span className="text-[10px] bg-blue-500 text-white px-1 rounded italic">Promo</span>
                            </p>
                          ) : (
                            <p className="text-right text-amber-600 dark:text-amber-400 font-bold uppercase italic">A COTIZAR</p>
                          )}
                        </div>

                        <div className="mb-2 flex items-center justify-between font-bold text-lg text-black dark:text-white">
                          <p>Total a pagar</p>
                          <Price
                            className="text-right"
                            amount={totalPrice}
                            currencyCode="MXN"
                          />
                        </div>
                        
                        <p className="text-[10px] text-center mt-3 uppercase tracking-widest text-blue-600 font-black">
                          {totalItems % 2 !== 0 && totalItems > 1 
                            ? "¡Añade 1 más para obtener $1000 x PAR y ENVÍO GRATIS!" 
                            : totalItems > 0 && totalItems % 2 === 0 
                            ? "¡Llevas ENVÍO GRATIS y el mejor precio por par!" 
                            : totalItems === 1
                            ? "¡Lleva 2 por $1000 y el ENVÍO ES GRATIS!"
                            : "¡2 por $1000 + ENVÍO GRATIS!"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow overflow-auto py-8 px-2 space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Calle y Número</label>
                          <input
                            name="street"
                            value={address.street}
                            onChange={handleAddressChange}
                            placeholder="Av. Principal 123, Int 4"
                            className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-black dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Ciudad</label>
                            <input
                              name="city"
                              value={address.city}
                              onChange={handleAddressChange}
                              placeholder="Puerto Vallarta"
                              className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-black dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Estado</label>
                            <input
                              name="state"
                              value={address.state}
                              onChange={handleAddressChange}
                              placeholder="Jalisco"
                              className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-black dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Código Postal</label>
                            <input
                              name="postalCode"
                              value={address.postalCode}
                              onChange={handleAddressChange}
                              placeholder="48300"
                              className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-black dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="pt-6">
                           <button 
                            onClick={() => setView('cart')}
                            className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
                           >
                             &larr; Volver al carrito
                           </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="block w-full rounded-full bg-black dark:bg-white dark:text-black p-4 text-center text-sm font-bold uppercase tracking-widest text-white opacity-90 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60 transition-all active:scale-[0.98]"
                  >
                    {isCheckingOut ? (
                      <div className="flex items-center justify-center gap-3">
                        <LoadingDots className="bg-white dark:bg-black" />
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      view === 'cart' ? 'Continuar con el Envío' : 'Finalizar Pedido'
                    )}
                  </button>
                </div>
            )}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

