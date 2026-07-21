import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetInterventionsStatsQuery } from '../services/interventions.rtk';

interface InterventionsByZoneProps {
    municipalityId?: string;
    dateFrom?: string;
    dateTo?: string;
}



export function InterventionsByZone({ municipalityId, dateFrom, dateTo }: InterventionsByZoneProps) {
    const { data: stats } = useGetInterventionsStatsQuery(
        { municipalityId, dateFrom, dateTo },
        { skip: false }
    );

    if (!stats?.byMunicipality?.length) return null;

    const chartData = stats.byMunicipality.map((item, index) => ({
        name: `#${index + 1} ${item.municipalityName}`,
        count: item.count
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full">
            <h3 className="text-sm font-bold text-gray-700 mb-6">Top 10 communes</h3>
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
                            labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}