import { FC } from 'react';

const stats = [
    { label: 'Happy Customers', value: '50k+', color: 'from-purple-500 to-pink-500' },
    { label: 'Products Delivered', value: '120k+', color: 'from-blue-500 to-cyan-500' },
    { label: 'Positive Reviews', value: '15k+', color: 'from-amber-500 to-orange-500' },
    { label: 'Years of Trust', value: '5+', color: 'from-emerald-500 to-teal-500' },
];

export const StatsSection: FC = () => {
    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center group">
                            <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                                {stat.value}
                            </div>
                            <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
