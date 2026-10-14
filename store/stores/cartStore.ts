import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image?: string;
    slug: string;
};

type CartState = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(
                    (i) => i.productId === item.productId && i.size === item.size
                );

                if (existingItem) {
                    set({
                        items: currentItems.map((i) =>
                            i.productId === item.productId && i.size === item.size
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...currentItems, item] });
                }
            },
            removeItem: (productId, size) => {
                set({
                    items: get().items.filter(
                        (i) => !(i.productId === productId && i.size === size)
                    ),
                });
            },
            updateQuantity: (productId, size, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId, size);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.productId === productId && i.size === size
                            ? { ...i, quantity }
                            : i
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            totalPrice: () => {
                const totalQuantity = get().items.reduce((total, item) => total + item.quantity, 0);
                const pairs = Math.floor(totalQuantity / 2);
                const singles = totalQuantity % 2;
                return (pairs * 1000) + (singles * 600);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
