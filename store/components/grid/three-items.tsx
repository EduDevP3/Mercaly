import { getProducts } from 'lib/products';
import { AnimatedGridTitle, AnimatedThreeItemGridItem } from './three-items-client';

export async function ThreeItemGrid() {
  const products = await getProducts({});
  
  if (products.length < 3) return null;

  const firstProduct = products[0]!;
  const secondProduct = products[1]!;
  const thirdProduct = products[2]!;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12" data-testid="homepage-products">
      <AnimatedGridTitle />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 lg:grid-rows-2">
        <AnimatedThreeItemGridItem index={0} size="full" item={firstProduct} background={firstProduct.bgColor || 'white'} />
        <AnimatedThreeItemGridItem index={1} size="half" item={secondProduct} background={secondProduct.bgColor || 'white'} />
        <AnimatedThreeItemGridItem index={2} size="half" item={thirdProduct} background={thirdProduct.bgColor || 'white'} />
      </div>
    </section>
  );
}
