'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer({ menu }: { menu: { title: string; path: string }[] }) {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '');
  const { SITE_NAME } = { SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || "La Barata Mayoreos" };

  return (
    <footer className="border-t border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-black dark:text-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 pb-10 border-b border-neutral-200 dark:border-neutral-800">
          {/* Brand & Address */}
          <div className="md:col-span-5 space-y-4">
            <Link className="inline-block" href="/" aria-label="La Barata Mayoreos">
              <Image
                src="/logo.png"
                alt="La Barata Mayoreos"
                width={160}
                height={50}
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">
              Proveedor Mayorista de Ropa &bull; Envíos a todo México
            </p>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 pt-2">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">Tienda Física:</p>
              <p>Av. Insurgentes 322, entre P. Sánchez y 12 de Octubre</p>
              <p>Col. Menchaca, Tepic, Nayarit, México</p>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Atención y Pedidos
            </p>
            <ul className="text-sm space-y-2 text-neutral-600 dark:text-neutral-300">
              <li>
                <a 
                  href="https://wa.me/523112275616" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  311 227 5616
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/523115210393" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  311 521 0393
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/523113923498" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  311 392 3498
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Navegación
            </p>
            {menu.length ? (
              <ul className="text-sm space-y-2">
                {menu.map((item: { title: string; path: string }) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="text-sm space-y-2 text-neutral-600 dark:text-neutral-400">
                <li><Link href="/search">Catálogo</Link></li>
                <li><Link href="/search/Mayoreo">Mayoreo</Link></li>
                <li><Link href="/search/Menudeo">Menudeo</Link></li>
              </ul>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-4">
          <p>&copy; {copyrightDate} {SITE_NAME}. Todos los derechos reservados.</p>
          <p>Tepic, Nayarit &bull; Envíos a todo México</p>
        </div>
      </div>
    </footer>
  );
}
