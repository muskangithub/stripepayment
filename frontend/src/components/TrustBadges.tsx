import { FC } from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

export const TrustBadges: FC = () => {
    const badges = [
        { icon: <ShieldCheck className="w-5 h-5" />, text: '2-Year Warranty', sub: 'On all electronics' },
        { icon: <Truck className="w-5 h-5" />, text: 'Free Shipping', sub: 'Orders over $50' },
        { icon: <RotateCcw className="w-5 h-5" />, text: '30-Day Returns', sub: 'No questions asked' },
        { icon: <Lock className="w-5 h-5" />, text: 'Secure Payment', sub: '100% SSL encrypted' },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
            {badges.map((badge, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-purple-400 shrink-0">{badge.icon}</div>
                    <div>
                        <p className="text-sm font-bold text-white leading-tight">{badge.text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{badge.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
