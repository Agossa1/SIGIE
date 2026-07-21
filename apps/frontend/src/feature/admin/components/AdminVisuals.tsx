import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import type { TechnicianReport } from '../../reports/services/reports.types'
import type { Mission } from '../../missions/services/missions.types'

// ── Enregistrement Chart.js ────────────────────────────────────────────────
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

// ── Types ──────────────────────────────────────────────────────────────────
export interface AdminVisualsData {
  totalReports: number
  completedMissions: number
  reportsByCategory: {
    waste: number
    drainage: number
    road: number
    other: number
  }
  reports: TechnicianReport[]
  missions: Mission[]
}

interface AdminVisualsProps {
  stats: AdminVisualsData
}

// ── Helpers ────────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function aggregateReportsByMonth(reports: TechnicianReport[], categoryFilter?: string): { labels: string[]; values: number[] } {
  const now = new Date()
  const counts: Record<string, number> = {}

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    counts[key] = 0
  }

  reports.forEach((r) => {
    if (!r.createdAt) return
    if (categoryFilter && categoryFilter !== 'all') {
      // Inondation/Drainage = flooding OR drainage
      if (categoryFilter === 'drainage' && r.issueCategory !== 'drainage' && r.issueCategory !== 'flooding') return
      // Autres
      if (categoryFilter !== 'drainage' && r.issueCategory !== categoryFilter) return
    }
    const d = new Date(r.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (counts[key] !== undefined) counts[key]++
  })

  const sortedKeys = Object.keys(counts).sort()
  return {
    labels: sortedKeys.map((k) => {
      const month = parseInt(k.split('-')[1], 10)

      const dayLabel = `${String(sortedKeys.indexOf(k) + 1).padStart(2, '0')} ${MONTHS_SHORT[month]?.toLowerCase() ?? ''}`
      return dayLabel
    }),
    values: sortedKeys.map((k) => counts[k]),
  }
}

// ── Composant principal ────────────────────────────────────────────────────
const AdminVisuals = ({ stats }: AdminVisualsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'waste' | 'drainage' | 'road'>('all')
  const monthly = useMemo(() => aggregateReportsByMonth(stats.reports, activeTab), [stats.reports, activeTab])

  // KPI metrics sous le graphique
  const kpiList = [
    { label: 'Signalements (Total)', val: stats.totalReports.toString(), trend: 'Global', trendUp: true },
    { label: 'Missions Terminées', val: stats.completedMissions.toString(), trend: 'Terrain', trendUp: true },
    { label: 'Inondations signalées', val: stats.reportsByCategory.drainage?.toString() || '0', trend: 'Urgence', trendUp: false },
    { label: 'Déchets', val: stats.reportsByCategory.waste.toString(), trend: 'Salubrité', trendUp: true },
  ]

  // Données donut "Répartition par Catégorie"
  const catData = [
    stats.reportsByCategory.waste,
    stats.reportsByCategory.drainage,
    stats.reportsByCategory.road,
    stats.reportsByCategory.other
  ]
  const catTotal = stats.totalReports

  // Données bar chart (On utilise les données réelles mensuelles pour le volume global)
  // Comme on a qu'une série de valeurs dans monthly.values pour l'instant, on l'affiche simplement.
  const volumeData = monthly.values

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* ── Audience Overview (8/12) ── */}
      <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-800">Évolution des signalements</h3>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
            <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? "text-gray-900 font-semibold border-b border-gray-900 pb-0.5" : "hover:text-gray-800 transition-colors pb-0.5"}>Tous</button>
            <button onClick={() => setActiveTab('waste')} className={activeTab === 'waste' ? "text-amber-600 font-semibold border-b border-amber-600 pb-0.5" : "hover:text-amber-600 transition-colors pb-0.5"}>Déchets</button>
            <button onClick={() => setActiveTab('drainage')} className={activeTab === 'drainage' ? "text-blue-600 font-semibold border-b border-blue-600 pb-0.5" : "hover:text-blue-600 transition-colors pb-0.5"}>Inondation</button>
            <button onClick={() => setActiveTab('road')} className={activeTab === 'road' ? "text-purple-600 font-semibold border-b border-purple-600 pb-0.5" : "hover:text-purple-600 transition-colors pb-0.5"}>Infrastructures</button>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex-1 min-h-[220px] mt-4 relative">
          <Bar
            data={{
              labels: monthly.labels,
              datasets: [
                {
                  label: 'Volume de signalements',
                  data: volumeData,
                  backgroundColor: activeTab === 'waste' ? '#f59e0b' : activeTab === 'drainage' ? '#3b82f6' : activeTab === 'road' ? '#8b5cf6' : '#10b981',
                  borderRadius: 4,
                  barPercentage: 0.6,
                }
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  backgroundColor: '#fff',
                  titleColor: '#1e293b',
                  bodyColor: '#475569',
                  padding: 10,
                  cornerRadius: 10,
                  borderColor: '#e2e8f0',
                  borderWidth: 1,
                  boxPadding: 4,
                },
                legend: {
                  display: true,
                  position: 'top',
                  align: 'start',
                  labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 7,
                    boxHeight: 7,
                    color: '#64748b',
                    font: { size: 13 },
                    padding: 16,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: '#94a3b8', font: { size: 13 } },
                  border: { display: false },
                },
                y: {
                  grid: { color: '#f1f5f9' },
                  ticks: {
                    color: '#94a3b8',
                    font: { size: 13 },
                    maxTicksLimit: 6,
                    stepSize: 20,
                  },
                  border: { display: false },
                },
              },
            }}
          />
        </div>

        {/* KPI row sous le graphique */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          {kpiList.map((kpi, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-500">{kpi.label}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-gray-900">{kpi.val}</span>
                <span
                  className={`text-sm font-bold ${
                    kpi.trendUp ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {kpi.trendUp ? '↑' : '↓'} {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Répartition par Catégorie (4/12) ── */}
      <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Répartition par catégorie</h3>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Donut chart avec valeur centrale */}
        <div className="flex-1 flex items-center justify-center min-h-[180px] relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-3xl font-bold text-gray-900">{catTotal}</span>
          </div>
          <Doughnut
            data={{
              labels: ['Déchets', 'Inondation/Drainage', 'Infrastructures', 'Autres'],
              datasets: [
                {
                  data: catData,
                  backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#94a3b8'],
                  borderWidth: 5,
                  borderColor: '#ffffff',
                  hoverBorderWidth: 5,
                  hoverOffset: 5,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#fff',
                  titleColor: '#1e293b',
                  bodyColor: '#475569',
                  padding: 10,
                  cornerRadius: 10,
                  borderColor: '#e2e8f0',
                  borderWidth: 1,
                },
              },
              cutout: '78%',
              layout: { padding: 8 },
            }}
          />
        </div>

        {/* Légende custom en dessous */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-gray-600 font-medium">Déchets</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.reportsByCategory.waste}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-gray-600 font-medium">Inondation/Drainage</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.reportsByCategory.drainage}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="text-gray-600 font-medium">Infrastructures</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.reportsByCategory.road}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AdminVisuals
