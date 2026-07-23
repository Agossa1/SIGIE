import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Cell, LabelList
} from 'recharts';
import { useGetInterventionsStatsQuery } from '../services/interventions.rtk';
import { MapPin } from 'lucide-react';

interface InterventionsByZoneProps {
    municipalityId?: string;
    dateFrom?: string;
    dateTo?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs">
                <p className="font-semibold text-gray-800 mb-1">{label}</p>
                <p className="text-emerald-600 font-bold">{payload[0].value} interventions</p>
            </div>
        );
    }
    return null;
};

// Color gradient by rank
const getBarColor = (index: number) => {
    const palette = [
        '#059669', '#10b981', '#34d399', '#6ee7b7',
        '#a7f3d0', '#6ee7b7', '#34d399', '#10b981',
        '#059669', '#047857'
    ];
    return palette[index] ?? '#10b981';
};

export function InterventionsByZone({ municipalityId, dateFrom, dateTo }: InterventionsByZoneProps) {
    const { data: stats } = useGetInterventionsStatsQuery(
        { municipalityId, dateFrom, dateTo },
        { skip: false }
    );

    if (!stats?.byMunicipality?.length) return null;

    const top10 = stats.byMunicipality.slice(0, 10);
    const chartData = top10.map((item, index) => ({
        name: item.municipalityName,
        count: item.count,
        rank: index + 1,
        fill: getBarColor(index),
    }));

    const maxCount = Math.max(...chartData.map(d => d.count));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-800">Top communes</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Par nombre d'interventions</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1">
                    <MapPin className="w-3 h-3" />
                    <span>Top {top10.length}</span>
                </div>
            </div>

            {/* Recharts horizontal bar */}
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 48, left: 4, bottom: 0 }}
                        barSize={14}
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis type="number" hide domain={[0, maxCount + 1]} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={100}
                            tick={({ x, y, payload, index }: any) => (
                                <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} fill="#4b5563">
                                    <tspan fill={getBarColor(index)} fontWeight="700">#{index + 1} </tspan>
                                    {payload.value}
                                </text>
                            )}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList
                                dataKey="count"
                                position="right"
                                style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}