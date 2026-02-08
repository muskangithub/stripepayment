import { FC } from 'react';
import Image from 'next/image';

const galleryPhotos = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
];

export const CommunityGallery: FC = () => {
    return (
        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">#ShopProCommunity</h2>
                    <p className="text-gray-400">Join our growing community and share your style!</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {galleryPhotos.map((photo, i) => (
                        <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden glass">
                            <Image
                                src={photo}
                                alt="Community Photo"
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-medium">View Product</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
