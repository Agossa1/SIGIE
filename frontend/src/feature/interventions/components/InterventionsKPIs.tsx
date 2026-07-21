import { useGetInterventionsStatsQuery } from '../services/interventions.rtk';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

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

    const cards = [
        {
            label: 'Total interventions',
            value: stats.total,
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'En cours',
            value: stats.inProgress,
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            label: 'Résolues aujourd\'hui',
            value: stats.completedToday,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            label: 'Délai moyen',
            value: `${stats.averageResolutionHours}h`,
            icon: Clock,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div key={card.label} className={`rounded-2xl p-5 ${card.bg} border border-gray-100`}>
                    <div className="flex items-center gap-3 mb-3">
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                        <span className="text-sm font-medium text-gray-600">{card.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
            ))}
        </div>
    );
}