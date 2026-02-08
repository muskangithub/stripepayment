'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    imageUrl: string;
    stock: number;
    categoryId: string;
}

function ProductsList() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = new URLSearchParams(searchParams.toString());
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                // API returns { products: [], total: number } or just [] (if changed)
                // Based on backend code: return c.json({ products: productList, total: ... })
                const productsList = data.products || data;

                if (Array.isArray(productsList)) {
                    setProducts(productsList);
                } else {
                    console.error('API returned non-array:', data);
                    setProducts([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg h-96 animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (products.length === 0) {
        return <div className="text-center py-10">No products found.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.id} className="group">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border transition-shadow hover:shadow-md">
                        <div className="relative h-64 w-full bg-gray-200">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">
                                    ${parseFloat(product.price).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">All Products</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <ProductsList />
            </Suspense>
        </div>
    );
}
