'use client';

import { FC, useEffect, useState } from 'react';
import { qaApi } from '@/lib/api';
import { ProductQA } from '@/types';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface ProductQAProps {
    productId: string;
}

export const ProductQAComponent: FC<ProductQAProps> = ({ productId }) => {
    const [qas, setQas] = useState<ProductQA[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const loadQA = async () => {
            try {
                const data = await qaApi.getByProduct(productId) as ProductQA[];
                setQas(data);
            } catch (error) {
                console.error('Failed to load Q&A:', error);
            }
        };
        loadQA();
    }, [productId]);

    if (qas.length === 0) return null;

    return (
        <div className="mt-16 pt-16 border-t border-white/10">
            <div className="flex items-center gap-3 mb-8 text-gradient">
                <HelpCircle className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl md:text-3xl font-bold">Questions & Answers</h2>
            </div>

            <div className="grid gap-4">
                {qas.map((qa, i) => (
                    <div key={qa.id} className="glass rounded-2xl overflow-hidden transition-all duration-300">
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full p-6 flex justify-between items-center text-left hover:bg-white/[0.03] transition-colors"
                        >
                            <span className="font-bold text-lg text-white pr-8">{qa.question}</span>
                            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                        </button>
                        {openIndex === i && (
                            <div className="px-6 pb-6 animate-fade-in">
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-gray-300 leading-relaxed">
                                    <span className="font-bold text-purple-400 mb-1 block">Answer:</span>
                                    {qa.answer || "Testing is still in progress for this specific detail. Please check back soon!"}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
