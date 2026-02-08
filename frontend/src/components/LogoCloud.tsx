import { FC } from 'react';

const partners = [
    { name: 'Stripe', logo: '💳' },
    { name: 'PostgreSQL', logo: '🐘' },
    { name: 'Next.js', logo: '▲' },
    { name: 'Hono', logo: '🔥' },
    { name: 'Drizzle', logo: '🌧️' },
    { name: 'Tailwind', logo: '🎨' },
];

export const LogoCloud: FC = () => {
    return (
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
                    Trusted by Industry Leaders
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {partners.map((partner) => (
                        <div key={partner.name} className="flex items-center gap-2 group cursor-default">
                            <span className="text-3xl filter group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-all">
                                {partner.logo}
                            </span>
                            <span className="text-xl font-bold text-gray-300 group-hover:text-white transition-colors">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
