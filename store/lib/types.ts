export type Product = {
    _id: string;
    sku: string;
    title: string;
    handle: string;
    description: string;
    price: number;
    currency: string;
    image_url: string;
    stock: boolean;
    category: string;
    bgColor?: string;
    createdAt: string;
    updatedAt: string;
    images: string[];
    name: string;
    slug: string;
    isActive: boolean;
};
