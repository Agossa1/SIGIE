import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray';
    trend?: 'up' | 'down' | 'stable';
    trendLabel?: string;
}

const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'text-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: 'text-blue-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: 'text-amber-500' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', icon: 'text-red-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: 'text-purple-500' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', icon: 'text-gray-500' },
};

export function KpiCard({ title, value, subtitle, icon, color = 'emerald', trend, trendLabel }: KpiCardProps) {
    const colors = colorMap[color];
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400';

    return (
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 flex flex-col gap-2 transition-all hover:shadow-sm`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">{title}</span>
                {icon && <span className={colors.icon}>{icon}</span>}
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${colors.text}`}>{value}</span>
                {trend && trendLabel && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        {trendLabel}
                    </span>
                )}
            </div>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
    );
}