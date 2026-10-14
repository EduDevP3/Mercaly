import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Client = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
};

type ClientAuthState = {
    client: Client | null;
    token: string | null;
    setAuth: (client: Client, token: string) => void;
    logout: () => void;
    isLoggedIn: () => boolean;
};

export const useClientAuthStore = create<ClientAuthState>()(
    persist(
        (set, get) => ({
            client: null,
            token: null,
            setAuth: (client, token) => set({ client, token }),
            logout: () => set({ client: null, token: null }),
            isLoggedIn: () => !!get().token,
        }),
        {
            name: 'client-auth-storage',
        }
    )
);
