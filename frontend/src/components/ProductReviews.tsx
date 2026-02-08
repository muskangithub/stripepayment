'use client';

import { FC, useEffect, useState } from 'react';
import { reviewsApi } from '@/lib/api';
import { Review } from '@/types';
import { Star, User } from 'lucide-react';

interface ProductReviewsProps {
    productId: string;
}

export const ProductReviews: FC<ProductReviewsProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const data = await reviewsApi.getByProduct(productId) as Review[];
                setReviews(data);
            } catch (error) {
                console.error('Failed to load reviews:', error);
            }
        };
        loadReviews();
    }, [productId]);

    if (reviews.length === 0) return null;

    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    return (
        <div className="mt-16 pt-16 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Customer Reviews</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-current' : 'opacity-30'}`} />
                            ))}
                        </div>
                        <span className="text-gray-400 font-medium">Based on {reviews.length} reviews</span>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-medium">
                    Write a Review
                </button>
            </div>

            <div className="grid gap-6">
                {reviews.map((review) => (
                    <div key={review.id} className="glass p-6 rounded-3xl animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Verified Customer</h4>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
