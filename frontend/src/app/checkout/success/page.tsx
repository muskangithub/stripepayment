'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

function SuccessContent() {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Payment Successful!</h1>
            <p className="text-lg text-gray-600 max-w-md">
                Thank you for your purchase. Your order has been confirmed and is being processed.
            </p>

            <div className="pt-6">
                <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
