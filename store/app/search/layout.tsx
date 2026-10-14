import Footer from 'components/layout/footer';
import Collections from 'components/layout/search/collections';
import FilterList from 'components/layout/search/filter';
import { sorting } from 'lib/constants';
import { getMenu } from 'lib/products';
import { Suspense } from 'react';

export default async function SearchLayout({ children }: { children: React.ReactNode }) {
  const footerMenu = await getMenu('next-js-frontend-footer-menu');
  return (
    <Suspense>
      <div className="mx-auto flex max-w-7xl flex-col bg-white py-6 text-black dark:bg-black dark:text-white md:flex-row">
        <div className="order-first flex-none md:w-1/6">
          <Collections />
        </div>
        <div className="order-last min-h-screen w-full md:order-none">{children}</div>
        <div className="order-none md:order-last md:w-1/6 md:flex-none">
          <FilterList list={sorting} title="Ordenar por" />
        </div>
      </div>
      <Footer menu={footerMenu} />
    </Suspense>
  );
}
