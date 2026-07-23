import { useState, useEffect } from 'react'
import { Truck, Megaphone, MapPin, BarChart2 } from 'lucide-react'
import { KpiCard } from '../../../components/ui/KpiCard'

interface WastePoint {
    id: string
    name: string
    municipality_id?: string
    latitude?: number
    longitude?: number
    waste_type?: string
    created_at: string
}

interface WasteCollection {
    id: string
    municipality_id?: string
    collection_date: string
    volume_collected_m3?: number
    team_id?: string
    status?: string
}

interface SanitationCampaign {
    id: string
    municipality_id?: string
    name: string
    start_date: string
    end_date?: string
    created_at: string
}

export function SanitationDashboard() {
    const [points, setPoints] = useState<WastePoint[]>([])
    const [collections, setCollections] = useState<WasteCollection[]>([])
    const [campaigns, setCampaigns] = useState<SanitationCampaign[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'points' | 'collections' | 'campaigns'>('points')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [pointsRes, collectionsRes, campaignsRes] = await Promise.all([
                    fetch('/api/sanitation/points').then(r => r.json()),
                    fetch('/api/sanitation/collections').then(r => r.json()),
                    fetch('/api/sanitation/campaigns').then(r => r.json()),
                ])
                if (pointsRes.success) setPoints(pointsRes.data || [])
                if (collectionsRes.success) setCollections(collectionsRes.data || [])
                if (campaignsRes.success) setCampaigns(campaignsRes.data || [])
            } catch (e) {
                console.error('Erreur chargement données salubrité:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const totalVolume = collections.reduce((sum, c) => sum + (c.volume_collected_m3 || 0), 0)
    const activeCampaigns = campaigns.filter(c => !c.end_date || new Date(c.end_date) > new Date()).length

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* KPIs Salubrité */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-white border border-gray-200 rounded overflow-hidden">
                <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-500">Points de collecte</p>
                        <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{points.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Points de dépôt actifs</p>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-500">Tournées</p>
                        <Truck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{collections.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Collectes réalisées</p>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-500">Volume</p>
                        <BarChart2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{totalVolume.toFixed(1)} m³</p>
                    <p className="text-xs text-gray-400 mt-1">Déchets ramassés</p>
                </div>
                <div className="p-5 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-500">Campagnes</p>
                        <Megaphone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-semibold text-emerald-600">{activeCampaigns}</p>
                    <p className="text-xs text-gray-400 mt-1">Sur {campaigns.length} campagnes</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                {[
                    { key: 'points' as const, label: 'Points de collecte', count: points.length, icon: MapPin },
                    { key: 'collections' as const, label: 'Tournées', count: collections.length, icon: Truck },
                    { key: 'campaigns' as const, label: 'Campagnes', count: campaigns.length, icon: Megaphone },
                ].map(({ key, label, count, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === key
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label} ({count})
                    </button>
                ))}
            </div>

            {/* Contenu */}
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                {activeTab === 'points' && (
                    points.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400">Aucun point de collecte enregistré.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Nom</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Type de déchet</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Coordonnées</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Date création</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {points.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{p.waste_type || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {p.latitude && p.longitude ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {activeTab === 'collections' && (
                    collections.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400">Aucune tournée de collecte enregistrée.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Date</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Volume</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {collections.slice(0, 10).map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {new Date(c.collection_date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {c.volume_collected_m3 ? `${c.volume_collected_m3.toFixed(1)} m³` : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    c.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                                    c.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-gray-50 text-gray-600'
                                                }`}>
                                                    {c.status || 'planifié'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {activeTab === 'campaigns' && (
                    campaigns.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-400">Aucune campagne de salubrité enregistrée.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Nom</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Début</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Fin</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {campaigns.map((c) => {
                                        const isActive = !c.end_date || new Date(c.end_date) > new Date()
                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(c.start_date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {c.end_date ? new Date(c.end_date).toLocaleDateString('fr-FR') : 'En cours'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'
                                                    }`}>
                                                        {isActive ? 'Active' : 'Terminée'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}