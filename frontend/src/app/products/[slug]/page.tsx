'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { productsApi } from '@/lib/api';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Check, ArrowLeft, Minus, Plus, ShieldCheck } from 'lucide-react';
import { TrustBadges } from '@/components/TrustBadges';
import { ProductReviews } from '@/components/ProductReviews';
import { ProductQAComponent } from '@/components/ProductQA';

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addItem, isInCart } = useCart();

    useEffect(() => {
        async function loadProduct() {
            try {
                const data = await productsApi.getBySlug(slug) as Product;
                setProduct(data);
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setLoading(false);
            }
        }
        loadProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-16 h-16 border-t-2 border-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black">
                <h1 className="text-4xl font-black mb-4">Product Not Found</h1>
                <p className="text-gray-400 mb-10">The item you&apos;re looking for has been moved or removed.</p>
                <Link href="/">
                    <Button size="lg" className="rounded-full px-10">Back to Store</Button>
                </Link>
            </div>
        );
    }

    const hasDiscount = product.discountPercent && parseFloat(product.discountPercent) > 0;
    const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercent);
    const inCart = isInCart(product.id);

    return (
        <div className="min-h-screen py-24 px-4 bg-black">
            <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 mb-12 transition-colors group font-bold">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Visuals */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden glass border-white/5">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-9xl opacity-20">📦</span>
                                </div>
                            )}

                            {hasDiscount && (
                                <div className="absolute top-8 left-8 bg-rose-500 text-white text-sm font-black px-5 py-2 rounded-full shadow-2xl backdrop-blur-xl bg-opacity-90">
                                    SALE: {product.discountPercent}% OFF
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Information */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            {product.category && (
                                <Link href={`/?category=${product.category.slug}`} className="text-purple-400 font-bold uppercase tracking-[0.3em] text-sm hover:text-purple-300 transition-colors">
                                    {product.category.name}
                                </Link>
                            )}
                            <h1 className="text-5xl md:text-6xl font-black text-white mt-4 mb-6 tracking-tight">{product.name}</h1>

                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-5xl font-black text-white">{formatPrice(discountedPrice)}</span>
                                {hasDiscount && (
                                    <span className="text-2xl text-gray-600 line-through font-bold">{formatPrice(product.price)}</span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    {product.stock > 0 ? 'Ready to Ship' : 'Out of Stock'}
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 font-bold text-sm">
                                    <ShieldCheck className="w-4 h-4" />
                                    Verified Quality
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-invert mb-10">
                            <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-xs opacity-50">Overview</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">{product.description}</p>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Quantity</span>
                                <div className="flex items-center glass rounded-2xl p-1 border-white/10">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center text-xl font-black text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock}
                                        className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white disabled:opacity-20"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => addItem(product, quantity)}
                                    disabled={product.stock === 0}
                                    className={`flex-1 h-16 rounded-2xl text-lg font-black transition-all duration-500 ${inCart ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-purple-600 hover:text-white shadow-2xl hover:shadow-purple-600/40'
                                        }`}
                                >
                                    {inCart ? (
                                        <>
                                            <Check className="w-6 h-6 mr-3" />
                                            In Your Bag
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-6 h-6 mr-3" />
                                            Reserve Now - {formatPrice(discountedPrice * quantity)}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <TrustBadges />
                    </div>
                </div>

                {/* Social Proof & Details */}
                <div className="mt-32">
                    <div className="grid lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2">
                            <ProductReviews productId={product.id} />
                        </div>
                        <div className="lg:col-span-1 border-l border-white/5 lg:pl-16">
                            <ProductQAComponent productId={product.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
