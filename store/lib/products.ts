import { Product } from './types';

export type { Product };

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'https://tribuna-back-nfl9.onrender.com/api/v1';
};

const mapToProduct = (p: any): Product => {
  const title = p.title || p.name || '';
  const handle = p.handle || p.slug || p._id;
  const imageUrl = p.image_url || (Array.isArray(p.images) && p.images[0]) || '';

  return {
    _id: p._id || '',
    sku: p.sku || '',
    title: title,
    name: title,
    handle: handle,
    slug: handle,
    description: p.description || '',
    price: typeof p.price === 'number' ? p.price : parseFloat(p.price || 0),
    currency: p.currency || 'MXN',
    image_url: imageUrl,
    images: imageUrl ? [imageUrl] : [],
    stock: p.stock ?? true,
    isActive: p.stock ?? true,
    category: p.category || '',
    bgColor: p.bgColor || '#FFFFFF',
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || p.createdAt || new Date().toISOString()
  };
};

export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<Product[]> {
  try {
    const apiUrl = getApiUrl();
    const params = new URLSearchParams();
    params.append('limit', '100');
    if (query) params.append('search', query);

    const res = await fetch(`${apiUrl}/products?${params.toString()}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`Error fetching products from backend (${res.status}):`, await res.text());
      return [];
    }

    const data = await res.json();
    const rawItems: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
      ? data.products
      : [];

    let products = rawItems.map(mapToProduct).filter((p) => p.isActive);

    if (query && !params.has('search')) {
      products = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    }

    if (sortKey === 'PRICE') {
      products.sort((a, b) => (reverse ? b.price - a.price : a.price - b.price));
    } else if (sortKey === 'CREATED_AT') {
      products.sort((a, b) =>
        reverse
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return products;
  } catch (error) {
    console.error('Failed to get products from backend:', error);
    return [];
  }
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  try {
    const products = await getProducts();
    const found = products.find((p) => p.slug === handle || p.handle === handle || p._id === handle);
    if (found) return found;

    // Try direct ID lookup if handle is an ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(handle)) {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/products/${handle}`, { cache: 'no-store' });
      if (res.ok) {
        const p = await res.json();
        return mapToProduct(p);
      }
    }

    return undefined;
  } catch (error) {
    console.error(`Failed to get product ${handle}:`, error);
    return undefined;
  }
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(
      `${apiUrl}/products?category=${encodeURIComponent(collection)}&limit=100`,
      { cache: 'no-store' }
    );

    let products: Product[] = [];
    if (res.ok) {
      const data = await res.json();
      const rawItems: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];
      products = rawItems.map(mapToProduct).filter((p) => p.isActive);
    } else {
      // Fallback: filter from all products
      const all = await getProducts();
      products = all.filter(
        (p) => p.category?.toLowerCase() === collection.toLowerCase()
      );
    }

    if (sortKey === 'PRICE') {
      products.sort((a, b) => (reverse ? b.price - a.price : a.price - b.price));
    } else if (sortKey === 'CREATED_AT') {
      products.sort((a, b) =>
        reverse
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return products;
  } catch (error) {
    console.error(`Failed to get collection products for ${collection}:`, error);
    return [];
  }
}

export async function getCollections(): Promise<
  { handle: string; title: string; path: string; updatedAt: string }[]
> {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/categories`, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      const rawCategories: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data.categories)
        ? data.categories
        : [];

      if (rawCategories.length > 0) {
        return rawCategories.map((c) => ({
          handle: c.handle || c.name,
          title: c.name,
          path: `/search/${c.handle || c.name}`,
          updatedAt: c.updatedAt || new Date().toISOString()
        }));
      }
    }

    // Extract unique categories from real products if /categories endpoint is empty
    const products = await getProducts();
    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );

    return categories.map((c) => ({
      handle: c,
      title: c.charAt(0).toUpperCase() + c.slice(1),
      path: `/search/${c}`,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to get collections from backend:', error);
    return [];
  }
}

export async function getCollection(
  handle: string
): Promise<
  | {
      handle: string;
      title: string;
      path: string;
      seo?: { title: string; description: string };
      description?: string;
      updatedAt: string;
    }
  | undefined
> {
  const collections = await getCollections();
  return collections.find(
    (c) => c.handle.toLowerCase() === handle.toLowerCase() || c.path === `/search/${handle}`
  );
}

export async function getMenu(handle: string): Promise<{ title: string; path: string }[]> {
  const collections = await getCollections();

  const menuItems = [
    {
      title: 'Todo',
      path: '/search'
    },
    ...collections.map((c) => ({
      title: c.title,
      path: c.path
    }))
  ];

  return menuItems;
}

export async function getPage(handle: string) {
  return {
    id: '1',
    title: 'Página',
    handle: handle,
    body: 'Contenido informativo.',
    bodySummary: 'Resumen informativo.',
    seo: {
      title: 'Información',
      description: 'Página de información'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function getPages() {
  return [
    {
      id: '1',
      title: 'Sobre Nosotros',
      handle: 'about',
      slug: 'about',
      path: '/about',
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Términos y Condiciones',
      handle: 'terms-conditions',
      slug: 'terms-conditions',
      path: '/terms-conditions',
      updatedAt: new Date().toISOString()
    }
  ];
}
