import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGetInterventionsStatsQuery } from '../services/interventions.rtk';

interface InterventionsByTypeProps {
    municipalityId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export function InterventionsByType({ municipalityId, dateFrom, dateTo }: InterventionsByTypeProps) {
    const { data: stats } = useGetInterventionsStatsQuery(
        { municipalityId, dateFrom, dateTo },
        { skip: false }
    );

    if (!stats?.byType?.length) return null;

    // Couleurs par type d'intervention
    const colors: Record<string, string> = {
        drain_cleaning: '#06b6d4',
        waste_collection: '#f59e0b',
        road_repair: '#3b82f6',
        flood_response: '#ef4444',
        inspection: '#8b5cf6',
        emergency_response: '#dc2626',
        sanitation: '#10b981',
        maintenance: '#6366f1',
        reforestation: '#22c55e',
        ecological_restoration: '#059669',
        biodiversity_survey: '#047857',
    };

    const chartData = stats.byType.map(item => ({
        name: item.type.replace(/_/g, ' '),
        count: item.count,
        fill: colors[item.type] || '#6b7280'
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full">
            <h3 className="text-sm font-bold text-gray-700 mb-6">Par type d'intervention</h3>
            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                        barSize={20}
                    >
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            width={130} 
                            tick={{ fontSize: 13, fill: '#4b5563', fontWeight: 500 }} 
                        />
                        <Tooltip 
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                            formatter={(value: any) => [<span className="font-semibold">{value} interventions</span>, '']}
                            labelStyle={{ color: '#6b7280', marginBottom: '4px', textTransform: 'capitalize' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}