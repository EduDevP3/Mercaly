'use client';

import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PRODUCT_SIZES } from 'lib/constants';

export function VariantSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <dl className="mb-8">
      <dt className="mb-4 text-sm uppercase tracking-wide">Talla</dt>
      <dd className="flex flex-wrap gap-3">
        {PRODUCT_SIZES.map((size) => {
          const isActive = searchParams.get('size') === size;

          return (
            <button
              key={size}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('size', size);
                router.replace(`${pathname}?${params.toString()}`);
              }}
              className={clsx(
                'flex min-w-[48px] items-center justify-center rounded-full border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900',
                {
                  'cursor-default ring-2 ring-blue-600': isActive,
                  'ring-1 ring-transparent transition duration-300 ease-in-out hover:scale-110 hover:ring-blue-600':
                    !isActive
                }
              )}
            >
              {size}
            </button>
          );
        })}
      </dd>
    </dl>
  );
}
