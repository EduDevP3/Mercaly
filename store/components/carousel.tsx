import { getProducts } from 'lib/products';
import Image from 'next/image';
import Link from 'next/link';

export async function Carousel() {
  // Just show all products in the carousel for now, or filter by a 'Featured' logic if we added that field
  const products = await getProducts({}); 

  if (!products?.length) return null;

  return (
    <div className="w-full bg-white py-12 dark:bg-black">
      <div className="mx-auto mb-8 max-w-7xl px-4 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl">
          CATÁLOGO DESTACADO
        </h2>
        <div className="mx-auto mt-4 h-1 w-20 bg-blue-600 rounded-full"></div>
        <p className="mt-4 text-base text-neutral-600 sm:text-lg">
          Explora los productos más nuevos de nuestra tienda
        </p>
      </div>
      <div className="relative w-full overflow-hidden bg-slate-50 py-6 border-y border-slate-200/80">
        <div className="flex animate-carousel">
          {[...products, ...products].map((product, i) => (
            <Link
              key={`${product.slug}${i}`}
              href={`/product/${product.slug}`}
              className="relative h-[30vh] w-1/2 flex-none md:w-1/3 p-2"
            >
              <div 
                className="relative h-full w-full overflow-hidden rounded-xl flex items-center justify-center transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: product.bgColor || '#F5F5F5' }}
              >
                {product.images[0] ? (
                  <Image
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                    fill
                    sizes="33vw"
                    src={product.images[0]}
                  />
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
