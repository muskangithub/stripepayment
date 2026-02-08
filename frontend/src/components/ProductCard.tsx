'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem, isInCart } = useCart();
    const hasDiscount = product.discountPercent && parseFloat(product.discountPercent) > 0;
    const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercent);
    const inCart = isInCart(product.id);

    return (
        <div className="group glass glass-hover rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
            {/* Image */}
            <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                        <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-500">📦</span>
                    </div>
                )}

                {/* Badges Container */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {hasDiscount && (
                        <div className="bg-rose-500 text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md bg-opacity-90">
                            Save {product.discountPercent}%
                        </div>
                    )}
                    {product.featured && (
                        <div className="bg-amber-500 text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md bg-opacity-90">
                            Staff Pick
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>

            {/* Content */}
            <div className="p-6">
                <div className="mb-4">
                    {product.category && (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-1 opacity-80">{product.category.name}</p>
                    )}
                    <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-gray-500 line-through mb-0.5">
                                {formatPrice(product.price)}
                            </span>
                        )}
                        <span className="text-2xl font-black text-white tracking-tight">
                            {formatPrice(discountedPrice)}
                        </span>
                    </div>

                    <button
                        onClick={() => addItem(product)}
                        disabled={product.stock === 0}
                        className={`p-4 rounded-2xl transition-all duration-300 ${inCart
                            ? 'bg-emerald-500 text-white'
                            : product.stock === 0
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-xl hover:shadow-purple-500/40'
                            }`}
                    >
                        {inCart ? (
                            <Check className="w-6 h-6" />
                        ) : (
                            <ShoppingCart className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Stock Status Mini */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                        {product.stock > 10 ? 'Available' : product.stock > 0 ? `Limited (${product.stock})` : 'Sold Out'}
                    </span>
                </div>
            </div>
        </div>
    );
}
