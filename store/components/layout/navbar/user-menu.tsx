'use client';

import { useClientAuthStore } from 'stores/clientAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserIcon from 'components/icons/user';

export default function UserMenu() {
    const { client, logout } = useClientAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.refresh();
        router.push('/');
    };

    if (client) {
        return (
            <div className="flex items-center gap-4">
                <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 md:block">
                    Hola, {client.firstName}
                </span>
                <button
                    onClick={handleLogout}
                    className="text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                >
                    Salir
                </button>
            </div>
        );
    }

    return (
        <Link
            href="/login"
            className="flex items-center gap-1 rounded-full bg-neutral-100 px-4 py-2 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
        >
            <UserIcon className="h-4 w-4" />
            <span>Entrar</span>
        </Link>
    );
}
