import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useGetInterventionsStatsQuery } from '../services/interventions.rtk';

interface InterventionsByTypeProps {
    municipalityId?: string;
    dateFrom?: string;
    dateTo?: string;
}

const TYPE_LABELS: Record<string, string> = {
    drain_cleaning: 'Curage drains',
    waste_collection: 'Collecte déchets',
    road_repair: 'Réfection voirie',
    flood_response: 'Inondation',
    inspection: 'Inspection',
    emergency_response: 'Urgence',
    sanitation: 'Assainissement',
    maintenance: 'Maintenance',
    reforestation: 'Reboisement',
    ecological_restoration: 'Restauration écologique',
    biodiversity_survey: 'Biodiversité',
};

const COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1',
    '#22c55e', '#f97316', '#84cc16'
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium text-gray-700">
                <p className="font-semibold" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
                <p className="text-gray-500">{payload[0].value} intervention{payload[0].value > 1 ? 's' : ''}</p>
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-col gap-1.5 mt-2">
        {payload?.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                    <span className="text-xs text-gray-600 truncate">{entry.value}</span>
                </div>
                <span className="text-xs font-semibold text-gray-800 flex-shrink-0">{entry.payload.count}</span>
            </div>
        ))}
    </div>
);

export function InterventionsByType({ municipalityId, dateFrom, dateTo }: InterventionsByTypeProps) {
    const { data: stats } = useGetInterventionsStatsQuery(
        { municipalityId, dateFrom, dateTo },
        { skip: false }
    );

    if (!stats?.byType?.length) return null;

    const total = stats.byType.reduce((sum, item) => sum + item.count, 0);
    const chartData = stats.byType.map((item, index) => ({
        name: TYPE_LABELS[item.type] || item.type.replace(/_/g, ' '),
        count: item.count,
        fill: COLORS[index % COLORS.length],
        pct: Math.round((item.count / total) * 100),
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800">Par type d'intervention</h3>
                <p className="text-xs text-gray-400 mt-0.5">{total} interventions au total</p>
            </div>

            <div className="flex gap-4 items-center flex-1">
                {/* Donut Chart */}
                <div className="w-44 h-44 flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={52}
                                outerRadius={78}
                                paddingAngle={2}
                                dataKey="count"
                                strokeWidth={0}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-gray-900">{total}</span>
                        <span className="text-xs text-gray-400">total</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 min-w-0">
                    <CustomLegend payload={chartData.map(d => ({ value: d.name, color: d.fill, payload: d }))} />
                </div>
            </div>
        </div>
    );
}