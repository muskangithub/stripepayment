'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
    const { items, itemCount, subtotal, tax, total, updateQuantity, removeItem, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <ShoppingBag className="w-24 h-24 text-gray-600 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                <p className="text-gray-400 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
                <Link href="/">
                    <Button size="lg">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Shopping Cart ({itemCount} items)</h1>
                    <button
                        onClick={clearCart}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Cart
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => {
                            const discountedPrice = calculateDiscountedPrice(item.product.price, item.product.discountPercent);
                            const hasDiscount = item.product.discountPercent && parseFloat(item.product.discountPercent) > 0;

                            return (
                                <div
                                    key={item.product.id}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex gap-4"
                                >
                                    {/* Image */}
                                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                                        {item.product.imageUrl ? (
                                            <Image
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                                                <span className="text-2xl">📦</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${item.product.slug}`}>
                                            <h3 className="font-semibold text-lg hover:text-purple-400 transition-colors truncate">
                                                {item.product.name}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-bold text-lg">{formatPrice(discountedPrice)}</span>
                                            {hasDiscount && (
                                                <span className="text-sm text-gray-500 line-through">{formatPrice(item.product.price)}</span>
                                            )}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 mt-3">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.product.stock}
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total & Remove */}
                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => removeItem(item.product.id)}
                                            className="p-2 text-gray-400 hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <span className="font-bold text-lg">
                                            {formatPrice(discountedPrice * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Tax (8%)</span>
                                    <span>{formatPrice(tax)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Shipping</span>
                                    <span className="text-emerald-400">Free</span>
                                </div>
                                <hr className="border-white/10" />
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            <Link href="/checkout">
                                <Button className="w-full" size="lg">
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>

                            <Link href="/" className="block mt-4">
                                <Button variant="secondary" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
