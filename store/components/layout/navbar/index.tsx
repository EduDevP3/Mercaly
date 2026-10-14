import Link from 'next/link';
import { Suspense } from 'react';

import Cart from 'components/cart';
import CartIcon from 'components/icons/cart';
// import LogoIcon from 'components/icons/logo'; // Removed
import { getMenu } from 'lib/products';
import Image from 'next/image';
import MobileMenu from './mobile-menu';
import Search from './search';
import UserMenu from './user-menu';

const { SITE_NAME } = process.env;

export default async function Navbar() {
  const menu = await getMenu('next-js-frontend-header-menu');

  return (
    <nav className="relative flex items-center justify-between bg-white p-4 border-b border-neutral-100 lg:px-8">
      <div className="block w-1/3 md:hidden">
        <MobileMenu menu={menu} />
      </div>
      <div className="flex justify-self-center md:w-1/3 md:justify-self-start">
        <div className="md:mr-4">
          <Link href="/" aria-label="Volver al inicio">
            <Image
              src="/logo.png"
              alt="La Barata Mayoreos"
              width={110}
              height={44} 
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        {menu.length ? (
          <ul className="hidden md:flex gap-1">
            {menu.map((item: { title: string; path: string }) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="hidden w-1/3 md:block">
        <Search />
      </div>

      <div className="flex w-1/3 justify-end items-center gap-4">
        <UserMenu />
        <Suspense fallback={<CartIcon className="h-6" />}>
          <Cart />
        </Suspense>
      </div>
    </nav>
  );
}

