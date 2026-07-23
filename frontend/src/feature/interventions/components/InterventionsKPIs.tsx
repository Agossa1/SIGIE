import { useGetInterventionsStatsQuery } from '../services/interventions.rtk';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Activity, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface InterventionsKPIsProps {
    municipalityId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export function InterventionsKPIs({ municipalityId, dateFrom, dateTo }: InterventionsKPIsProps) {
    const { data: stats, isLoading } = useGetInterventionsStatsQuery(
        { municipalityId, dateFrom, dateTo },
        { skip: false }
    );

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <LoadingSpinner size="md" label="Chargement des statistiques..." />
            </div>
        );
    }

    if (!stats) return null;

    const completionRate = stats.total > 0 ? Math.round(((stats.completedToday || 0) / stats.total) * 100) : 0;
    const progressRate = stats.total > 0 ? Math.round(((stats.inProgress || 0) / stats.total) * 100) : 0;

    const cards = [
        {
            label: 'Total interventions',
            value: stats.total,
            icon: Activity,
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            ring: 'ring-blue-100',
            subLabel: 'Toutes périodes',
            radialData: [{ value: 100, fill: '#3b82f6' }],
        },
        {
            label: 'En cours',
            value: stats.inProgress,
            icon: TrendingUp,
            gradient: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            ring: 'ring-amber-100',
            subLabel: `${progressRate}% du total`,
            radialData: [{ value: progressRate, fill: '#f59e0b' }, { value: 100 - progressRate, fill: '#fef3c7' }],
        },
        {
            label: 'Résolues aujourd\'hui',
            value: stats.completedToday,
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-green-500',
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            ring: 'ring-emerald-100',
            subLabel: `${completionRate}% de taux`,
            radialData: [{ value: completionRate, fill: '#10b981' }, { value: 100 - completionRate, fill: '#d1fae5' }],
        },
        {
            label: 'Délai moyen résolution',
            value: `${stats.averageResolutionHours}h`,
            icon: Clock,
            gradient: 'from-purple-500 to-violet-600',
            bg: 'bg-purple-50',
            iconColor: 'text-purple-500',
            ring: 'ring-purple-100',
            subLabel: 'Temps moyen',
            radialData: [{ value: 75, fill: '#8b5cf6' }, { value: 25, fill: '#ede9fe' }],
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden group hover:border-gray-200 transition-all duration-200`}
                >
                    {/* Subtle gradient accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} rounded-t-2xl`} />

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.bg} ring-4 ${card.ring} mb-3`}>
                                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
                            <p className="text-3xl font-bold text-gray-900 leading-none mb-2">{card.value}</p>
                            <p className="text-xs text-gray-400">{card.subLabel}</p>
                        </div>

                        {/* Mini radial chart */}
                        <div className="w-16 h-16 flex-shrink-0 -mt-1 -mr-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="55%"
                                    outerRadius="100%"
                                    data={card.radialData}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <RadialBar dataKey="value" cornerRadius={4} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}