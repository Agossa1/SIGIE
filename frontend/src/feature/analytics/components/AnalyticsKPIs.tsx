import React from 'react';
import type { AnalyticsSummary } from '../services/analytics.api';

interface AnalyticsKPIsProps {
    data: AnalyticsSummary;
    loading?: boolean;
    onRefresh?: () => void;
}

const KPICard = ({ label, value, sub, color, icon, alert }: { 
    label: string; value: string | number; sub?: string; 
    color: string; icon: React.ReactNode; alert?: boolean;
}) => (
    <div className={`bg-white rounded-2xl border ${alert ? 'border-red-200 shadow-red-50' : 'border-gray-100'} p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-500 truncate">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
        </div>
    </div>
);

const BarChart = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-600 w-20 shrink-0 truncate">{label}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div 
                className={`h-2 rounded-full transition-all duration-700 ${color}`}
                style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
            />
        </div>
        <span className="text-xs font-bold text-gray-700 w-6 text-right">{value}</span>
    </div>
);

export const AnalyticsKPIs: React.FC<AnalyticsKPIsProps> = ({ data, loading, onRefresh }) => {
    const missionCompletionRate = data.missions.total > 0 
        ? Math.round(((data.missions.completed + data.missions.validated) / data.missions.total) * 100)
        : 0;
    
    const interventionSuccessRate = data.interventions.total > 0
        ? Math.round((data.interventions.completed / data.interventions.total) * 100)
        : 0;

    const maxCategoryCount = Math.max(
        data.reports.byCategory.drainage,
        data.reports.byCategory.waste,
        data.reports.byCategory.road,
        data.reports.byCategory.flooding,
        1
    );

    return (
        <div className="space-y-6">
            {/* Titre + actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Analytics & KPIs</h2>
                    <p className="text-sm text-gray-500">Tableau de bord de performance opérationnelle</p>
                </div>
                {onRefresh && (
                    <button 
                        onClick={onRefresh} 
                        disabled={loading}
                        className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualiser
                    </button>
                )}
            </div>

            {/* KPIs Row 1 — Signalements */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Signalements Terrain
                </h3>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <KPICard 
                        label="En cours de traitement" value={data.reports.active} 
                        sub={`${data.reports.pendingTriage} en attente de triage`}
                        color="bg-gray-50 text-gray-600"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    />
                    <KPICard 
                        label="Résolus" value={data.reports.resolved} 
                        sub={`sur ${data.reports.total} total`}
                        color="bg-emerald-50 text-emerald-600"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <KPICard 
                        label="SLA dépassé" value={data.reports.slaBreached}
                        sub={data.reports.slaBreached > 0 ? 'Intervention urgente requise' : 'Tous dans les délais ✓'}
                        color={data.reports.slaBreached > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}
                        alert={data.reports.slaBreached > 0}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <KPICard 
                        label="Résolution moyenne" 
                        value={data.reports.avgResolutionHours != null ? `${Math.round(data.reports.avgResolutionHours)}h` : '—'}
                        sub="temps moyen de traitement"
                        color="bg-gray-50 text-gray-600"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    />
                </div>
            </div>

            {/* KPIs Row 2 — Missions */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Missions Terrain
                </h3>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <KPICard 
                        label="En cours" value={data.missions.inProgress}
                        sub={`${data.missions.draft} en brouillon`}
                        color="bg-gray-50 text-gray-600"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    />
                    <KPICard 
                        label="Taux de complétion" value={`${missionCompletionRate}%`}
                        sub={`${data.missions.completed + data.missions.validated} terminées sur ${data.missions.total}`}
                        color="bg-emerald-50 text-emerald-600"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    />
                    <KPICard 
                        label="En retard" value={data.missions.overdue}
                        sub={data.missions.overdue > 0 ? 'Délai dépassé' : 'Aucune en retard ✓'}
                        color={data.missions.overdue > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}
                        alert={data.missions.overdue > 0}
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <KPICard 
                        label="Durée moyenne" 
                        value={data.missions.avgActualHours != null ? `${Math.round(data.missions.avgActualHours)}h` : '—'}
                        sub={data.missions.avgEstimatedHours != null ? `estimée: ${Math.round(data.missions.avgEstimatedHours)}h` : 'pas encore de données'}
                        color="bg-gray-50 text-gray-600"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    />
                </div>
            </div>

            {/* Ligne du bas — Catégories + Équipes + Interventions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Répartition par catégorie */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Signalements par catégorie</h4>
                    <div className="space-y-3">
                        <BarChart label="Drainage" value={data.reports.byCategory.drainage} max={maxCategoryCount} color="bg-emerald-300" />
                        <BarChart label="Déchets" value={data.reports.byCategory.waste} max={maxCategoryCount} color="bg-emerald-400" />
                        <BarChart label="Routes" value={data.reports.byCategory.road} max={maxCategoryCount} color="bg-emerald-500" />
                        <BarChart label="Inondations" value={data.reports.byCategory.flooding} max={maxCategoryCount} color="bg-emerald-600" />
                    </div>
                </div>

                {/* Stats interventions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Interventions terrain</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-sm font-bold text-gray-900">{data.interventions.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Taux de succès</span>
                            <span className="text-sm font-bold text-emerald-600">{interventionSuccessRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Durée moy.</span>
                            <span className="text-sm font-bold text-gray-900">
                                {data.interventions.avgDurationHours != null ? `${Math.round(data.interventions.avgDurationHours)}h` : '—'}
                            </span>
                        </div>
                        {data.interventions.avgConditionScore != null && (
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Score de qualité moy.</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {data.interventions.avgConditionScore.toFixed(1)}/10
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
                                        style={{ width: `${(data.interventions.avgConditionScore / 10) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats équipes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Équipes & Ressources</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 text-center bg-emerald-50 rounded-xl p-3">
                                <p className="text-2xl font-bold text-emerald-700">{data.teams.active}</p>
                                <p className="text-xs text-emerald-600 font-medium">Actives</p>
                            </div>
                            <div className="flex-1 text-center bg-gray-50 rounded-xl p-3">
                                <p className="text-2xl font-bold text-gray-700">{data.teams.total}</p>
                                <p className="text-xs text-gray-500 font-medium">Total</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Membres actifs</span>
                            <span className="text-sm font-bold text-gray-900">{data.teams.totalMembers}</span>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Disponibilité</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {data.teams.total > 0 ? `${Math.round((data.teams.active / data.teams.total) * 100)}%` : '—'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
                                    style={{ width: data.teams.total > 0 ? `${(data.teams.active / data.teams.total) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
