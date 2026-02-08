'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    description: string | null;
    slug: string;
}

function CategoriesList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await response.json();
                // Categories API returns array directly: return c.json(categories)
                setCategories(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (categories.length === 0) {
        return <div className="text-center py-10">No categories found.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
                <Link
                    href={`/products?category=${category.slug}`}
                    key={category.id}
                    className="group block p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-gray-500 text-sm line-clamp-2">
                            {category.description}
                        </p>
                    )}
                </Link>
            ))}
        </div>
    );
}

export default function CategoriesPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Browse by Category</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <CategoriesList />
            </Suspense>
        </div>
    );
}
