'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientAuthStore } from 'stores/clientAuthStore';
import toast, { Toaster } from 'react-hot-toast';
import LoadingDots from 'components/loading-dots';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useClientAuthStore((state) => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tribuna-back-nfl9.onrender.com/api/v1';
      const response = await fetch(`${apiUrl}/client/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setAuth(data.client, data.token);
        toast.success('¡Bienvenido a La Barata Mayoreos!');
        router.push('/');
        router.refresh();
      } else {
        toast.error(data.message || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Únete a La Barata Mayoreos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm"
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Teléfono (WhatsApp)
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              className="mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm"
              placeholder="3221234567"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-black dark:text-white sm:text-sm"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-black px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? <LoadingDots className="bg-white dark:bg-black" /> : 'Crear cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
