import Footer from 'components/layout/footer';
import { getMenu } from 'lib/products';
import { Suspense } from 'react';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const footerMenu = await getMenu('next-js-frontend-footer-menu');
  return (
    <Suspense>
      <div className="w-full bg-white dark:bg-black">
        <div className="mx-8 max-w-2xl py-20 sm:mx-auto">
          <Suspense>{children}</Suspense>
        </div>
      </div>
      <Footer menu={footerMenu} />
    </Suspense>
  );
}
