'use client';

import { FC, useEffect, useState } from 'react';
import { testimonialsApi } from '@/lib/api';
import { Testimonial } from '@/types';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export const TestimonialSlider: FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                const data = await testimonialsApi.getFeatured() as Testimonial[];
                setTestimonials(data);
            } catch (error) {
                console.error('Failed to load testimonials:', error);
            }
        };
        loadTestimonials();
    }, []);

    if (testimonials.length === 0) return null;

    const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    const t = testimonials[activeIndex];

    return (
        <section className="py-24 px-4 bg-premium overflow-hidden">
            <div className="max-w-5xl mx-auto relative">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Real Stories from Real Customers</h2>
                    <p className="text-gray-400">Join thousands of satisfied shoppers who trust us every day.</p>
                </div>

                <div className="relative glass p-8 md:p-12 rounded-[2.5rem] animate-fade-in">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
                            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10">
                                {t.avatarUrl ? (
                                    <Image src={t.avatarUrl} alt={t.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-2xl font-bold">
                                        {t.name[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <div className="flex justify-center md:justify-start gap-1 mb-4 text-amber-400">
                                {[...Array(t.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>
                            <p className="text-xl md:text-2xl font-medium text-gray-200 leading-relaxed mb-6 italic">
                                &quot;{t.content}&quot;
                            </p>
                            <div>
                                <h4 className="text-lg font-bold text-white">{t.name}</h4>
                                <p className="text-purple-400 font-medium">{t.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center md:justify-end gap-4 mt-8">
                        <button onClick={prev} className="p-3 glass rounded-full hover:bg-white/10 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={next} className="p-3 glass rounded-full hover:bg-white/10 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
